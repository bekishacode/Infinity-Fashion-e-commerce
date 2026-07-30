RewriteEngine On
RewriteBase /

# ============================================
# Force HTTPS (Uncomment when SSL is ready)
# ============================================
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
# Redirect old URLs to your main site (just in case someone visits them)
Redirect 301 /index.php https://stylebadgetex.com/
Redirect 301 /ind.php https://stylebadgetex.com/
# ============================================
# If the request is for a real file or directory, serve it directly
# (This allows React's static files like CSS, JS, images to load)
# ============================================
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# ============================================
# Route API calls to backend
# ============================================
RewriteRule ^backend/(.*)$ backend/index.php [QSA,L]

# ============================================
# ✅ Route /api/uploads/ to /backend/api/uploads/
# ============================================
RewriteRule ^api/uploads/(.*)$ backend/api/uploads/$1 [L]

# ============================================
# Handle React SPA routing (all other requests)
# ============================================
RewriteRule ^(.*)$ index.html [L]

# ============================================
# Security Headers (optional)
# ============================================
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>