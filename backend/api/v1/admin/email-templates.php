<?php
// backend/api/v1/admin/email-templates.php

require_once __DIR__ . '/../../../bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
require_once __DIR__ . '/verify.php';

// ============================================
//Get admin from the auth array
// ============================================
$auth = verifyAdminToken();
$admin = $auth['admin'];

// Only super admin can manage templates
if ($admin['role'] !== 'super_admin') {
    sendResponse(false, 'Access denied', null, 403);
}

$database = new Database();
$db = $database->getConnection();

$input = json_decode(file_get_contents('php://input'), true);

// ============================================
// GET: Retrieve template(s) or layout
// ============================================
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $key = isset($_GET['key']) ? $_GET['key'] : '';
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    // Get layout settings
    if ($action === 'layout') {
        $sql = "SELECT * FROM email_layout_settings LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $layout = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$layout) {
            // Create default layout
            $insertSql = "INSERT INTO email_layout_settings (company_name) VALUES ('Style Badge')";
            $db->exec($insertSql);
            $stmt->execute();
            $layout = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        sendResponse(true, 'Layout settings retrieved', $layout);
        exit();
    }
    
    // Get single template by ID
    if ($id > 0) {
        $sql = "SELECT * FROM email_templates WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($template) {
            sendResponse(true, 'Template retrieved', $template);
        } else {
            sendResponse(false, 'Template not found', null, 404);
        }
        exit();
    }
    
    // Get single template by key
    if (!empty($key)) {
        $sql = "SELECT * FROM email_templates WHERE template_key = :key";
        $stmt = $db->prepare($sql);
        $stmt->execute([':key' => $key]);
        $template = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($template) {
            sendResponse(true, 'Template retrieved', $template);
        } else {
            sendResponse(false, 'Template not found', null, 404);
        }
        exit();
    }
    
    // Get all templates
    $sql = "SELECT id, template_key, name, subject, variables, description, is_active, updated_at 
            FROM email_templates ORDER BY name";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(true, 'Templates retrieved', $templates);
    exit();
}

// ============================================
// PUT: Update template or layout
// ============================================
if ($method === 'PUT') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    // Update layout settings
    if ($action === 'layout') {
        $logo_url = $input['logo_url'] ?? '';
        $primary_color = $input['primary_color'] ?? '#273B89';
        $secondary_color = $input['secondary_color'] ?? '#EC2D7B';
        $font_family = $input['font_family'] ?? 'Arial, sans-serif';
        $company_name = $input['company_name'] ?? 'Style Badge';
        $company_address = $input['company_address'] ?? '';
        $company_phone = $input['company_phone'] ?? '';
        $company_email = $input['company_email'] ?? '';
        $website_url = $input['website_url'] ?? '';
        $social_facebook = $input['social_facebook'] ?? '';
        $social_instagram = $input['social_instagram'] ?? '';
        $social_twitter = $input['social_twitter'] ?? '';
        
        // Check if layout exists
        $checkSql = "SELECT id FROM email_layout_settings LIMIT 1";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute();
        $exists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($exists) {
            $sql = "UPDATE email_layout_settings SET 
                    logo_url = :logo_url,
                    primary_color = :primary_color,
                    secondary_color = :secondary_color,
                    font_family = :font_family,
                    company_name = :company_name,
                    company_address = :company_address,
                    company_phone = :company_phone,
                    company_email = :company_email,
                    website_url = :website_url,
                    social_facebook = :social_facebook,
                    social_instagram = :social_instagram,
                    social_twitter = :social_twitter,
                    updated_at = NOW()
                    WHERE id = :id";
            $stmt = $db->prepare($sql);
            $result = $stmt->execute([
                ':id' => $exists['id'],
                ':logo_url' => $logo_url,
                ':primary_color' => $primary_color,
                ':secondary_color' => $secondary_color,
                ':font_family' => $font_family,
                ':company_name' => $company_name,
                ':company_address' => $company_address,
                ':company_phone' => $company_phone,
                ':company_email' => $company_email,
                ':website_url' => $website_url,
                ':social_facebook' => $social_facebook,
                ':social_instagram' => $social_instagram,
                ':social_twitter' => $social_twitter
            ]);
        } else {
            $sql = "INSERT INTO email_layout_settings 
                    (logo_url, primary_color, secondary_color, font_family, company_name, company_address, company_phone, company_email, website_url, social_facebook, social_instagram, social_twitter) 
                    VALUES (:logo_url, :primary_color, :secondary_color, :font_family, :company_name, :company_address, :company_phone, :company_email, :website_url, :social_facebook, :social_instagram, :social_twitter)";
            $stmt = $db->prepare($sql);
            $result = $stmt->execute([
                ':logo_url' => $logo_url,
                ':primary_color' => $primary_color,
                ':secondary_color' => $secondary_color,
                ':font_family' => $font_family,
                ':company_name' => $company_name,
                ':company_address' => $company_address,
                ':company_phone' => $company_phone,
                ':company_email' => $company_email,
                ':website_url' => $website_url,
                ':social_facebook' => $social_facebook,
                ':social_instagram' => $social_instagram,
                ':social_twitter' => $social_twitter
            ]);
        }
        
        if ($result) {
            sendResponse(true, 'Layout settings updated successfully');
        } else {
            sendResponse(false, 'Failed to update layout settings', null, 500);
        }
        exit();
    }
    
    // Update template
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $subject = $input['subject'] ?? '';
    $header = $input['header'] ?? '';
    $body = $input['body'] ?? '';
    $footer = $input['footer'] ?? '';
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;
    
    if (!$id) {
        sendResponse(false, 'Template ID is required', null, 400);
        exit();
    }
    
    if (empty($subject)) {
        sendResponse(false, 'Subject is required', null, 400);
        exit();
    }
    
    $sql = "UPDATE email_templates SET 
            subject = :subject, 
            header = :header,
            body = :body, 
            footer = :footer,
            is_active = :is_active,
            updated_at = NOW()
            WHERE id = :id";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':subject' => $subject,
        ':header' => $header,
        ':body' => $body,
        ':footer' => $footer,
        ':is_active' => $is_active,
        ':id' => $id
    ]);
    
    if ($result) {
        sendResponse(true, 'Template updated successfully');
    } else {
        $error = $stmt->errorInfo();
        sendResponse(false, 'Failed to update template: ' . $error[2], null, 500);
    }
    exit();
}

// ============================================
// POST: Preview email
// ============================================
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'preview') {
    $header = $input['header'] ?? '';
    $body = $input['body'] ?? '';
    $footer = $input['footer'] ?? '';
    
    // Get layout settings
    $layoutSql = "SELECT * FROM email_layout_settings LIMIT 1";
    $layoutStmt = $db->prepare($layoutSql);
    $layoutStmt->execute();
    $layout = $layoutStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$layout) {
        $layout = [
            'font_family' => 'Arial, sans-serif',
            'primary_color' => '#273B89',
            'secondary_color' => '#EC2D7B'
        ];
    }
    
    $fullHtml = "<!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Email Preview</title>
        <style>
            body { font-family: {$layout['font_family']}; margin: 0; padding: 0; background-color: #f4f4f4; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        </style>
    </head>
    <body style='margin: 0; padding: 20px; background-color: #f4f4f4;'>
        <div class='email-container' style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;'>
            {$header}
            <div style='padding: 30px;'>
                {$body}
            </div>
            {$footer}
        </div>
    </body>
    </html>";
    
    sendResponse(true, 'Preview generated', ['html' => $fullHtml]);
    exit();
}

// ============================================
// Method not allowed
// ============================================
sendResponse(false, 'Method not allowed', null, 405);
?>