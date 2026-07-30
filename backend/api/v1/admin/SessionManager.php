<?php
// backend/api/v1/admin/SessionManager.php

class SessionManager {
    private $db;
    private $sessionTimeout = 1800; // 30 minutes in seconds

    public function __construct($db) {
        $this->db = $db;
    }

    private function isDbAvailable() {
        return $this->db !== null;
    }

    public function createSession($adminId, $ip, $userAgent, $expiresIn = 1800) {
        if (!$this->isDbAvailable()) {
            throw new Exception('Database connection not available');
        }
        
        $sessionToken = bin2hex(random_bytes(32));
        $refreshToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + $expiresIn);

        // ============================================
        // ✅ FIX: Invalidate all existing sessions for this admin
        // ============================================
        $this->invalidateOldSessions($adminId);

        $sql = "INSERT INTO admin_sessions 
                (admin_id, session_token, refresh_token, ip_address, user_agent, expires_at, last_activity) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId, $sessionToken, $refreshToken, $ip, $userAgent, $expiresAt]);

        return [
            'session_token' => $sessionToken,
            'refresh_token' => $refreshToken,
            'expires_at' => $expiresAt
        ];
    }

    public function validateSession($sessionToken) {
        error_log("=== VALIDATE SESSION CALLED ===");
        error_log("Token: " . substr($sessionToken, 0, 20) . "...");
        if (!$this->isDbAvailable()) {
            return false;
        }
        
        $sql = "SELECT * FROM admin_sessions 
                WHERE session_token = ? AND is_active = 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            return false;
        }

        // Check inactivity timeout
        $lastActivity = strtotime($session['last_activity']);
        $timeSinceActivity = time() - $lastActivity;
        
        if ($timeSinceActivity > $this->sessionTimeout) {
            $this->destroySession($sessionToken);
            return false;
        }

        // ============================================
        // ✅ UPDATE last_activity AND expires_at
        // ============================================
        error_log("Session ID: " . $session['id']);
        error_log("Session token: " . substr($sessionToken, 0, 20) . "...");
        error_log("Before update - last_activity: " . $session['last_activity']);
        $this->updateLastActivity($session['id']);
        $this->extendExpiration($session['id']);
        error_log("After update - last_activity should be updated");

        // Get updated session data
        $updatedSql = "SELECT * FROM admin_sessions WHERE id = ?";
        $updatedStmt = $this->db->prepare($updatedSql);
        $updatedStmt->execute([$session['id']]);
        $updatedSession = $updatedStmt->fetch(PDO::FETCH_ASSOC);

        return $updatedSession;
    }

    // ============================================
    // ✅ Extend expiration based on current time
    // ============================================
    private function extendExpiration($sessionId) {
        if (!$this->isDbAvailable()) return;
        $sql = "UPDATE admin_sessions 
                SET expires_at = DATE_ADD(NOW(), INTERVAL ? SECOND) 
                WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$this->sessionTimeout, $sessionId]);
    }

    private function updateLastActivity($sessionId) {
        if (!$this->isDbAvailable()) {
            error_log("❌ updateLastActivity: Database not available");
            return;
        }
        
        error_log("🔄 updateLastActivity: Updating session ID: " . $sessionId);
        
        $sql = "UPDATE admin_sessions SET last_activity = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([$sessionId]);
        
        error_log("✅ updateLastActivity: Result: " . ($result ? 'SUCCESS' : 'FAILED'));
        error_log("✅ updateLastActivity: Affected rows: " . $stmt->rowCount());
    }

    private function invalidateOldSessions($adminId) {
        if (!$this->isDbAvailable()) return;
        $sql = "UPDATE admin_sessions SET is_active = 0 WHERE admin_id = ? AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId]);
    }

    public function getActiveSessions($adminId) {
        if (!$this->isDbAvailable()) {
            return [];
        }
        
        $sql = "SELECT id, session_token, ip_address, user_agent, last_activity, expires_at, created_at 
                FROM admin_sessions 
                WHERE admin_id = ? AND is_active = 1
                ORDER BY created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countActiveSessions($adminId) {
        if (!$this->isDbAvailable()) {
            return 0;
        }
        
        $sql = "SELECT COUNT(*) as count FROM admin_sessions 
                WHERE admin_id = ? AND is_active = 1 
                AND TIMESTAMPDIFF(SECOND, last_activity, NOW()) <= ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId, $this->sessionTimeout]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($result['count'] ?? 0);
    }

    public function hasActiveSession($adminId) {
        return $this->countActiveSessions($adminId) > 0;
    }

    public function revokeOtherSessions($adminId, $currentSessionToken) {
        if (!$this->isDbAvailable()) {
            return false;
        }
        
        $sql = "UPDATE admin_sessions SET is_active = 0 
                WHERE admin_id = ? AND session_token != ? AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$adminId, $currentSessionToken]);
    }

    public function revokeAllSessions($adminId) {
        if (!$this->isDbAvailable()) {
            return false;
        }
        
        $sql = "UPDATE admin_sessions SET is_active = 0 WHERE admin_id = ? AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$adminId]);
    }

    public function destroySession($sessionToken) {
        if (!$this->isDbAvailable()) return false;
        $sql = "UPDATE admin_sessions SET is_active = 0 WHERE session_token = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$sessionToken]);
    }

    public function getSessionTimeLeft($sessionToken) {
        if (!$this->isDbAvailable()) return 0;
        $sql = "SELECT expires_at FROM admin_sessions WHERE session_token = ? AND is_active = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$sessionToken]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) return 0;
        
        $expiresAt = strtotime($result['expires_at']);
        return max(0, $expiresAt - time());
    }
}
?>