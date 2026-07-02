<?php
// backend/api/v1/admin/LoginAttemptsManager.php

class LoginAttemptsManager {
    private $db;
    private $maxAttempts = 10;
    private $lockTime = 1800; // 30 minutes in seconds

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Record a login attempt
     */
    public function recordAttempt($email, $adminId = null, $ip) {
        // Check if there's an existing record
        $sql = "SELECT id, attempts, locked_until FROM admin_login_attempts 
                WHERE email = :email AND ip_address = :ip 
                ORDER BY last_attempt DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email, ':ip' => $ip]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($record) {
            // Check if currently locked
            if ($record['locked_until'] && strtotime($record['locked_until']) > time()) {
                return [
                    'locked' => true,
                    'locked_until' => $record['locked_until'],
                    'attempts' => $record['attempts']
                ];
            }

            // Reset lock if expired
            if ($record['locked_until'] && strtotime($record['locked_until']) <= time()) {
                $record['attempts'] = 0;
                $record['locked_until'] = null;
            }

            $newAttempts = $record['attempts'] + 1;
            $lockedUntil = null;

            // Check if should lock
            if ($newAttempts >= $this->maxAttempts) {
                $lockedUntil = date('Y-m-d H:i:s', time() + $this->lockTime);
            }

            // Update record
            $updateSql = "UPDATE admin_login_attempts 
                          SET attempts = :attempts, 
                              last_attempt = NOW(), 
                              locked_until = :locked_until,
                              admin_id = :admin_id
                          WHERE id = :id";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([
                ':attempts' => $newAttempts,
                ':locked_until' => $lockedUntil,
                ':admin_id' => $adminId,
                ':id' => $record['id']
            ]);

            return [
                'locked' => $lockedUntil !== null,
                'locked_until' => $lockedUntil,
                'attempts' => $newAttempts,
                'remaining' => max(0, $this->maxAttempts - $newAttempts)
            ];
        } else {
            // Insert new record
            $insertSql = "INSERT INTO admin_login_attempts 
                          (email, admin_id, ip_address, attempts, last_attempt) 
                          VALUES (:email, :admin_id, :ip, 1, NOW())";
            $insertStmt = $this->db->prepare($insertSql);
            $insertStmt->execute([
                ':email' => $email,
                ':admin_id' => $adminId,
                ':ip' => $ip
            ]);

            return [
                'locked' => false,
                'attempts' => 1,
                'remaining' => $this->maxAttempts - 1
            ];
        }
    }

    /**
     * Reset attempts on successful login
     */
    public function resetAttempts($email, $ip) {
        $sql = "UPDATE admin_login_attempts 
                SET attempts = 0, locked_until = NULL 
                WHERE email = :email AND ip_address = :ip";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email, ':ip' => $ip]);
    }

    /**
     * Check if account is locked
     */
    public function isLocked($email, $ip) {
        $sql = "SELECT locked_until FROM admin_login_attempts 
                WHERE email = :email AND ip_address = :ip 
                AND locked_until IS NOT NULL AND locked_until > NOW()
                ORDER BY last_attempt DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email, ':ip' => $ip]);
        $result = $stmt->fetch();
        
        if ($result) {
            return [
                'locked' => true,
                'locked_until' => $result['locked_until']
            ];
        }
        
        return ['locked' => false];
    }
}
?>