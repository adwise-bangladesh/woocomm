# 🌐 CloudPanel Setup Guide for m.zonash.com

## 📋 CloudPanel Configuration Steps

### 1. **Login to CloudPanel**
- Access your CloudPanel dashboard
- Navigate to the main control panel

### 2. **Create New Website**

#### A. Add Website
1. Go to **"Websites"** in the left sidebar
2. Click **"Add Website"**
3. Fill in the following details:
   - **Domain**: `m.zonash.com`
   - **Document Root**: `/var/www/m.zonash.com`
   - **PHP Version**: Not needed (Node.js app)
   - **SSL**: Enable SSL certificate
   - **Redirect HTTP to HTTPS**: Yes

#### B. Website Settings
```
Domain: m.zonash.com
Document Root: /var/www/m.zonash.com
PHP Version: None (Node.js)
SSL: Enabled
HTTP to HTTPS Redirect: Enabled
```

### 3. **Configure SSL Certificate**

#### A. Let's Encrypt SSL
1. Go to **"SSL"** tab in your website settings
2. Click **"Let's Encrypt"**
3. Enter email for certificate notifications
4. Click **"Request Certificate"**
5. Wait for certificate to be issued

#### B. SSL Configuration
```
Certificate Type: Let's Encrypt
Auto-renewal: Enabled
Force HTTPS: Enabled
HSTS: Enabled (optional)
```

### 4. **Configure Nginx (Custom Configuration)**

#### A. Access Nginx Configuration
1. Go to **"Nginx"** tab in your website settings
2. Click **"Edit Configuration"**
3. Replace the default configuration with:

```nginx
server {
    listen 80;
    server_name m.zonash.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name m.zonash.com;
    
    # SSL Configuration (CloudPanel managed)
    ssl_certificate /etc/letsencrypt/live/m.zonash.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/m.zonash.com/privkey.pem;
    
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
```

#### B. Save and Test Configuration
1. Click **"Save Configuration"**
2. Click **"Test Configuration"**
3. If test passes, click **"Reload Nginx"**

### 5. **File Manager Setup**

#### A. Upload Application Files
1. Go to **"File Manager"** in CloudPanel
2. Navigate to `/var/www/m.zonash.com`
3. Upload your project files:
   - All source files
   - `package.json`
   - `next.config.ts`
   - `.env.production`

#### B. Set File Permissions
1. Right-click on project folder
2. Select **"Permissions"**
3. Set permissions to:
   - **Owner**: Read, Write, Execute
   - **Group**: Read, Execute
   - **Others**: Read, Execute

### 6. **Terminal Access (SSH)**

#### A. Access Terminal
1. Go to **"Terminal"** in CloudPanel
2. Navigate to your project directory:
   ```bash
   cd /var/www/m.zonash.com
   ```

#### B. Install Dependencies and Build
```bash
# Install Node.js dependencies
npm install --production

# Build the application
npm run build

# Verify build
ls -la .next/
```

### 7. **Process Management Setup**

#### A. Install PM2
```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
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

#### B. Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided
```

### 8. **Database Configuration**

#### A. Backend Domain Setup
1. Ensure `backend.zonash.com` is properly configured
2. Verify GraphQL endpoint is accessible
3. Test API connectivity from your server

#### B. CORS Configuration
- Add `m.zonash.com` to your backend's CORS allowed origins
- Ensure API endpoints are accessible

### 9. **Monitoring and Logs**

#### A. Setup Log Rotation
```bash
# Create log directory
sudo mkdir -p /var/log/pm2

# Setup log rotation
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

### 10. **Security Configuration**

#### A. Firewall Setup
```bash
# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### B. File Security
```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/m.zonash.com

# Set secure permissions
sudo chmod -R 755 /var/www/m.zonash.com
sudo chmod -R 644 /var/www/m.zonash.com/.next/static/
```

## 🧪 Testing Your Setup

### 1. **Application Tests**
```bash
# Test local application
curl http://localhost:3000

# Test through Nginx
curl https://m.zonash.com

# Test API endpoints
curl https://m.zonash.com/api/health
```

### 2. **SSL Certificate Test**
- Visit: https://www.ssllabs.com/ssltest/
- Enter your domain: `m.zonash.com`
- Verify SSL rating is A or A+

### 3. **Performance Test**
- Use Google PageSpeed Insights
- Test mobile and desktop performance
- Verify Core Web Vitals scores

## 🚨 Troubleshooting

### Common CloudPanel Issues

#### 1. **Website Not Loading**
- Check PM2 status: `pm2 status`
- Check Nginx configuration: `sudo nginx -t`
- Restart services: `pm2 restart zonash-frontend && sudo systemctl restart nginx`

#### 2. **SSL Certificate Issues**
- Check certificate status in CloudPanel
- Renew certificate if needed
- Verify domain DNS settings

#### 3. **Permission Issues**
- Check file ownership: `ls -la /var/www/m.zonash.com`
- Fix permissions: `sudo chown -R www-data:www-data /var/www/m.zonash.com`

#### 4. **Build Issues**
- Clear cache: `rm -rf .next/`
- Rebuild: `npm run build`
- Check Node.js version: `node --version`

## 📊 CloudPanel Monitoring

### 1. **Resource Monitoring**
- Monitor CPU usage in CloudPanel dashboard
- Check memory usage
- Monitor disk space

### 2. **Log Monitoring**
- Access logs through CloudPanel file manager
- Check PM2 logs: `pm2 logs zonash-frontend`
- Monitor Nginx logs

### 3. **Performance Monitoring**
- Use CloudPanel's built-in monitoring
- Set up alerts for high resource usage
- Monitor application uptime

## 🎯 Post-Deployment Checklist

### Immediate Tasks
- [ ] Test website loads correctly
- [ ] Verify SSL certificate is working
- [ ] Check all pages are accessible
- [ ] Test Facebook Pixel events
- [ ] Verify API connectivity

### Short-term Tasks
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Performance optimization
- [ ] Security hardening

### Long-term Tasks
- [ ] Analytics setup
- [ ] A/B testing framework
- [ ] Scaling preparation
- [ ] Feature development

---

**🎉 Your CloudPanel setup is complete!**

**Next Steps:**
1. Follow the deployment guide
2. Test all functionality
3. Monitor performance
4. Set up alerts
5. Plan for scaling
