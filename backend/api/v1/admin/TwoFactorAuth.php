<?php
// backend/api/v1/admin/TwoFactorAuth.php

// ============================================
// ✅ FIX: Set timezone FIRST
// ============================================
date_default_timezone_set('Africa/Addis_Ababa');

require_once __DIR__ . '/../../../helpers/EmailHelper.php';

class TwoFactorAuth {
    private $db;
    private $otpLength = 6;
    private $otpExpiry = 300; // 5 minutes

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Generate OTP for 2FA
     */
    public function generateOTP($adminId, $type = '2fa') {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // ============================================
        // ✅ FIX: Use the same method as forgot-password
        // ============================================
        $expires_at = date('Y-m-d H:i:s', strtotime('+5 minutes'));

        error_log("=== GENERATE OTP ===");
        error_log("OTP: " . $otp);
        error_log("Expires At: " . $expires_at);
        error_log("Current Time: " . date('Y-m-d H:i:s'));

        // Invalidate old unused OTPs
        $this->invalidateOldOTPs($adminId);

        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        $sql = "INSERT INTO admin_password_resets 
                (admin_id, otp, type, expires_at, ip_address, user_agent, request_count, first_request_at, last_request_at) 
                VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId, $otp, $type, $expires_at, $ip, $userAgent]);

        return $otp;
    }

    /**
     * Verify OTP
     */
    public function verifyOTP($adminId, $otp, $type = '2fa') {
        $sql = "SELECT * FROM admin_password_resets 
                WHERE admin_id = ? 
                AND otp = ? 
                AND type = ? 
                AND used = 0 
                AND expires_at > NOW()
                ORDER BY created_at DESC 
                LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId, $otp, $type]);
        $otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$otpRecord) {
            error_log("OTP NOT FOUND for admin_id: $adminId, otp: $otp");
            return false;
        }

        error_log("OTP FOUND for admin_id: $adminId, otp: $otp, expires_at: " . $otpRecord['expires_at']);

        $updateSql = "UPDATE admin_password_resets SET used = 1 WHERE id = ?";
        $updateStmt = $this->db->prepare($updateSql);
        $updateStmt->execute([$otpRecord['id']]);

        return true;
    }

    /**
     * Invalidate old unused OTPs
     */
    private function invalidateOldOTPs($adminId) {
        $sql = "UPDATE admin_password_resets SET used = 1 
                WHERE admin_id = ? AND used = 0 AND expires_at < NOW()";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId]);
    }

    /**
     * Check if admin has 2FA enabled
     */
    public function is2FAEnabled($adminId) {
        $sql = "SELECT is_enabled, preferred_method FROM admin_2fa_settings WHERE admin_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$adminId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result && $result['is_enabled'] == 1;
    }

    /**
     * Enable 2FA for admin
     */
    public function enable2FA($adminId, $method = 'email') {
        $sql = "INSERT INTO admin_2fa_settings 
                (admin_id, is_enabled, preferred_method) 
                VALUES (?, 1, ?) 
                ON DUPLICATE KEY UPDATE 
                is_enabled = 1, preferred_method = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$adminId, $method, $method]);
    }

    /**
     * Disable 2FA for admin
     */
    public function disable2FA($adminId) {
        $sql = "UPDATE admin_2fa_settings SET is_enabled = 0 WHERE admin_id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$adminId]);
    }

    /**
     * Send OTP via email using EmailHelper
     */
    public function sendOTPEmail($email, $otp) {
        try {
            $sql = "SELECT full_name FROM admin_users WHERE email = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$email]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $name = $admin['full_name'] ?? 'Admin';
            
            $emailHelper = new EmailHelper($this->db);
            $result = $emailHelper->sendEmail(
                $email,
                '2fa_verification',
                [
                    'name' => $name,
                    'otp' => $otp,
                    'expires_in' => '5 minutes'
                ]
            );
            
            return $result['success'];
            
        } catch (Exception $e) {
            error_log("2FA email exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send OTP via SMS (if configured)
     */
    public function sendOTPSMS($phone, $otp) {
        return true;
    }
}
?>