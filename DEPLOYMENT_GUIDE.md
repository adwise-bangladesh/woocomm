# 🚀 Production Deployment Guide for m.zonash.com

## 📋 Pre-Deployment Checklist

### ✅ Code Quality Status
- [x] Build successful (`npm run build`)
- [x] All TypeScript errors fixed
- [x] ESLint warnings minimized
- [x] Facebook Pixel fully implemented
- [x] All components optimized
- [x] Static generation working

### 🔧 Server Requirements
- **OS**: Debian (✅ Confirmed)
- **Panel**: CloudPanel (✅ Confirmed)
- **Node.js**: 18.x or higher
- **Nginx**: For reverse proxy
- **SSL**: Let's Encrypt certificate

## 🚀 Deployment Steps

### 1. **Prepare Production Environment**

#### A. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (if not already installed)
sudo apt install nginx -y
```

#### B. Create Application Directory
```bash
# Create app directory
sudo mkdir -p /var/www/m.zonash.com
sudo chown -R $USER:$USER /var/www/m.zonash.com
cd /var/www/m.zonash.com
```

### 2. **Upload and Configure Application**

#### A. Upload Files
```bash
# Upload your project files to /var/www/m.zonash.com
# You can use SCP, SFTP, or Git clone

# If using Git:
git clone <your-repo-url> .
# OR upload via CloudPanel file manager
```

#### B. Install Dependencies
```bash
cd /var/www/m.zonash.com
npm install --production
```

#### C. Create Production Environment File
```bash
# Create .env.production
cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
NEXT_PUBLIC_STORE_ID=your_store_id
NEXT_PUBLIC_STORE_NAME=Zonash
NEXT_PUBLIC_SITE_URL=https://m.zonash.com
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_AD_ACCOUNT_ID=your_ad_account_id
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_CATALOG_ID=your_catalog_id
NEXT_PUBLIC_CROSS_DOMAIN_DOMAINS=m.zonash.com,zonash.com
NEXT_PUBLIC_COOKIE_DOMAIN=.zonash.com
NEXT_PUBLIC_ENABLE_CROSS_DOMAIN=true
EOF
```

### 3. **Build and Optimize**

```bash
# Build the application
npm run build

# Verify build
ls -la .next/
```

### 4. **Configure PM2 Process Manager**

#### A. Create PM2 Ecosystem File
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'zonash-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/m.zonash.com',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/zonash-frontend-error.log',
    out_file: '/var/log/pm2/zonash-frontend-out.log',
    log_file: '/var/log/pm2/zonash-frontend.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
};
EOF
```

#### B. Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 5. **Configure Nginx Reverse Proxy**

#### A. Create Nginx Configuration
```bash
sudo cat > /etc/nginx/sites-available/m.zonash.com << 'EOF'
server {
    listen 80;
    server_name m.zonash.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name m.zonash.com;
    
    # SSL Configuration (CloudPanel will handle this)
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Static files caching
    location /_next/static/ {
        alias /var/www/m.zonash.com/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
```

#### B. Enable Site and Test Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/m.zonash.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. **SSL Certificate Setup (CloudPanel)**

#### A. Using CloudPanel SSL
1. Login to CloudPanel
2. Go to your domain settings
3. Enable SSL certificate
4. Choose Let's Encrypt
5. Apply certificate

#### B. Manual SSL (if needed)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d m.zonash.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. **Configure CloudPanel Domain**

#### A. Add Domain in CloudPanel
1. Login to CloudPanel
2. Go to "Websites"
3. Click "Add Website"
4. Enter domain: `m.zonash.com`
5. Choose "Node.js" as application type
6. Set document root: `/var/www/m.zonash.com`
7. Enable SSL

#### B. Configure PHP-FPM (if needed)
```bash
# If CloudPanel requires PHP configuration
sudo systemctl restart php8.1-fpm
```

### 8. **Database and Backend Configuration**

#### A. Backend Domain Setup
- Ensure `backend.zonash.com` is properly configured
- Verify GraphQL endpoint is accessible
- Test API connectivity

#### B. CORS Configuration
```bash
# Add to your backend server configuration
# Allow requests from m.zonash.com
```

### 9. **Monitoring and Logs**

#### A. Setup Log Rotation
```bash
sudo cat > /etc/logrotate.d/zonash-frontend << 'EOF'
/var/log/pm2/zonash-frontend*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

#### B. Monitor Application
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs zonash-frontend

# Monitor resources
pm2 monit
```

### 10. **Security Hardening**

#### A. Firewall Configuration
```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### B. File Permissions
```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/m.zonash.com
sudo chmod -R 755 /var/www/m.zonash.com
sudo chmod -R 644 /var/www/m.zonash.com/.next/static/
```

## 🔧 Post-Deployment Verification

### 1. **Test Application**
```bash
# Check if application is running
curl -I https://m.zonash.com

# Test API endpoints
curl https://m.zonash.com/api/health

# Test Facebook Pixel
# Open browser dev tools and check for pixel events
```

### 2. **Performance Testing**
```bash
# Test page load times
curl -w "@curl-format.txt" -o /dev/null -s https://m.zonash.com

# Check SSL rating
# Visit: https://www.ssllabs.com/ssltest/
```

### 3. **Monitor Logs**
```bash
# Check application logs
pm2 logs zonash-frontend --lines 100

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port 3000 not accessible**
   ```bash
   # Check if PM2 is running
   pm2 status
   pm2 restart zonash-frontend
   ```

2. **SSL certificate issues**
   ```bash
   # Renew certificate
   sudo certbot renew --force-renewal
   sudo systemctl reload nginx
   ```

3. **Build errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next/
   npm run build
   ```

4. **Memory issues**
   ```bash
   # Increase Node.js memory
   pm2 restart zonash-frontend --node-args="--max-old-space-size=4096"
   ```

## 📊 Production Monitoring

### 1. **Setup Monitoring**
```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 2. **Health Checks**
```bash
# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://m.zonash.com)
if [ $response -eq 200 ]; then
    echo "✅ Application is healthy"
else
    echo "❌ Application is down (HTTP $response)"
    pm2 restart zonash-frontend
fi
EOF

chmod +x health-check.sh

# Add to crontab for regular checks
crontab -e
# Add: */5 * * * * /var/www/m.zonash.com/health-check.sh
```

## 🎯 Next Steps After Deployment

1. **Test all functionality**
2. **Configure monitoring alerts**
3. **Setup backup strategy**
4. **Plan for scaling**
5. **Document deployment process**

## 📞 Support

If you encounter any issues during deployment, check:
1. PM2 logs: `pm2 logs zonash-frontend`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. System logs: `sudo journalctl -u nginx`

---

**🎉 Your WooCommerce frontend is now ready for production deployment!**
