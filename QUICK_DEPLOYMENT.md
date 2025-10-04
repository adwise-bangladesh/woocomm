# ⚡ Quick Deployment Guide

## 🚀 Fast Track Deployment (30 minutes)

### 1. **Server Preparation (5 minutes)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/m.zonash.com
sudo chown -R $USER:$USER /var/www/m.zonash.com
cd /var/www/m.zonash.com
```

### 2. **Upload Application (5 minutes)**
```bash
# Upload your project files to /var/www/m.zonash.com
# Use SCP, SFTP, or CloudPanel file manager

# Example with SCP:
# scp -r ./woocommerce-frontend/* user@your-server:/var/www/m.zonash.com/
```

### 3. **Install and Build (5 minutes)**
```bash
cd /var/www/m.zonash.com

# Install dependencies
npm install --production

# Create environment file
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://m.zonash.com
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
NEXT_PUBLIC_STORE_ID=1
NEXT_PUBLIC_STORE_NAME=Zonash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914
NEXT_PUBLIC_CROSS_DOMAIN_DOMAINS=m.zonash.com,zonash.com
NEXT_PUBLIC_COOKIE_DOMAIN=.zonash.com
NEXT_PUBLIC_ENABLE_CROSS_DOMAIN=true
EOF

# Build application
npm run build
```

### 4. **Start Application (2 minutes)**
```bash
# Create PM2 config
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
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. **Configure CloudPanel (10 minutes)**

#### A. Add Website in CloudPanel
1. Login to CloudPanel
2. Go to "Websites" → "Add Website"
3. Domain: `m.zonash.com`
4. Document Root: `/var/www/m.zonash.com`
5. Enable SSL

#### B. Configure Nginx
1. Go to "Nginx" tab
2. Replace configuration with:

```nginx
server {
    listen 80;
    server_name m.zonash.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name m.zonash.com;
    
    # SSL managed by CloudPanel
    
    # Static files caching
    location /_next/static/ {
        alias /var/www/m.zonash.com/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
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
    }
}
```

3. Save and reload Nginx

### 6. **Test Deployment (3 minutes)**
```bash
# Test application
curl -I https://m.zonash.com

# Check PM2 status
pm2 status

# View logs
pm2 logs zonash-frontend
```

## 🎯 Essential Commands

### Application Management
```bash
# Start application
pm2 start zonash-frontend

# Stop application
pm2 stop zonash-frontend

# Restart application
pm2 restart zonash-frontend

# View logs
pm2 logs zonash-frontend

# Monitor resources
pm2 monit
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Application Health
```bash
# Check if running
curl http://localhost:3000

# Check through Nginx
curl https://m.zonash.com

# Test API
curl https://m.zonash.com/api/health
```

## 🚨 Quick Troubleshooting

### Application Not Starting
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart zonash-frontend

# Check logs
pm2 logs zonash-frontend --lines 50
```

### Website Not Loading
```bash
# Check Nginx
sudo nginx -t
sudo systemctl restart nginx

# Check if port 3000 is accessible
netstat -tlnp | grep 3000
```

### SSL Issues
```bash
# Check SSL certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew --force-renewal
```

## 📊 Post-Deployment Checklist

### Immediate Tests
- [ ] Website loads: https://m.zonash.com
- [ ] Homepage displays correctly
- [ ] Product pages work
- [ ] Cart functionality works
- [ ] Checkout process works

### Facebook Pixel Tests
- [ ] Open browser dev tools
- [ ] Check for Facebook Pixel events
- [ ] Verify no duplicate events
- [ ] Test on mobile

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive
- [ ] SSL certificate valid
- [ ] No console errors

## 🔧 Maintenance Commands

### Daily Maintenance
```bash
# Check application status
pm2 status

# View recent logs
pm2 logs zonash-frontend --lines 20

# Check disk space
df -h
```

### Weekly Maintenance
```bash
# Update dependencies
npm update

# Rebuild application
npm run build
pm2 restart zonash-frontend

# Check SSL certificate
sudo certbot certificates
```

### Monthly Maintenance
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clean logs
pm2 flush

# Check security updates
sudo apt list --upgradable
```

## 🎉 Success Indicators

### ✅ Deployment Successful When:
- Website loads at https://m.zonash.com
- All pages are accessible
- Facebook Pixel events are firing
- No console errors
- SSL certificate is valid
- Mobile responsive design works

### 📈 Performance Targets:
- Page load time < 3 seconds
- SSL rating A or A+
- Mobile PageSpeed > 90
- No JavaScript errors
- All images loading

---

**🚀 Your application is now live!**

**Next Steps:**
1. Test all functionality
2. Monitor performance
3. Set up alerts
4. Plan for scaling
5. Develop additional features
