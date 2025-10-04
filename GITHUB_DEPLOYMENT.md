# 🚀 GitHub Deployment Guide for m.zonash.com

## 📋 Deploy from GitHub Repository

Your project is at: `https://github.com/adwise-bangladesh/woocomm`

### 🎯 **Quick Deployment Steps (15 minutes)**

#### **1. Server Preparation (2 minutes)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install git -y
```

#### **2. Clone Repository (2 minutes)**
```bash
# Create app directory
sudo mkdir -p /var/www/m.zonash.com
sudo chown -R $USER:$USER /var/www/m.zonash.com
cd /var/www/m.zonash.com

# Clone your repository
git clone https://github.com/adwise-bangladesh/woocomm.git .

# Check if cloned successfully
ls -la
```

#### **3. Install Dependencies (3 minutes)**
```bash
# Install production dependencies
npm install --production

# Verify installation
npm list --depth=0
```

#### **4. Create Environment File (2 minutes)**
```bash
# Create production environment file
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

# Set proper permissions
chmod 600 .env.production
```

#### **5. Build Application (3 minutes)**
```bash
# Build the application
npm run build

# Verify build
ls -la .next/
echo "Build completed successfully!"
```

#### **6. Create PM2 Configuration (2 minutes)**
```bash
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

#### **7. Start Application (1 minute)**
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

#### **8. Configure CloudPanel (5 minutes)**

##### A. Add Website in CloudPanel
1. Login to CloudPanel
2. Go to **"Websites"** → **"Add Website"**
3. **Domain**: `m.zonash.com`
4. **Document Root**: `/var/www/m.zonash.com`
5. **PHP Version**: None (Node.js)
6. **SSL**: Enable SSL certificate

##### B. Configure Nginx
1. Go to **"Nginx"** tab in your website settings
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
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
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

3. **Save** and **Test Configuration**
4. **Reload Nginx**

### 🧪 **Test Deployment (2 minutes)**
```bash
# Test application locally
curl http://localhost:3000

# Test through Nginx
curl -I https://m.zonash.com

# Check PM2 status
pm2 status

# View logs
pm2 logs zonash-frontend --lines 20
```

## 🔄 **Automated Deployment Script**

Create an automated deployment script for future updates:

```bash
# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /var/www/m.zonash.com

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart zonash-frontend

# Check status
echo "✅ Deployment completed!"
pm2 status
EOF

# Make script executable
chmod +x deploy.sh
```

## 🔧 **Future Updates**

### **Update Application (2 minutes)**
```bash
# Navigate to app directory
cd /var/www/m.zonash.com

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install --production

# Rebuild application
npm run build

# Restart PM2
pm2 restart zonash-frontend

# Check status
pm2 status
```

### **Or use the automated script:**
```bash
# Run deployment script
./deploy.sh
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### 1. **Git Clone Fails**
```bash
# Check if repository is public or you have access
git clone https://github.com/adwise-bangladesh/woocomm.git .

# If private repository, use SSH key or personal access token
git clone git@github.com:adwise-bangladesh/woocomm.git .
```

#### 2. **Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next/
npm run build

# Check for missing dependencies
npm install
```

#### 3. **Application Not Starting**
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart zonash-frontend

# Check logs
pm2 logs zonash-frontend --lines 50
```

#### 4. **Website Not Loading**
```bash
# Check Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check if port 3000 is accessible
netstat -tlnp | grep 3000
```

## 📊 **Monitoring Commands**

### **Application Health**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs zonash-frontend

# Monitor resources
pm2 monit

# Check application
curl -I https://m.zonash.com
```

### **System Health**
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## 🎯 **Post-Deployment Checklist**

### **Immediate Tests**
- [ ] Website loads: https://m.zonash.com
- [ ] Homepage displays correctly
- [ ] Product pages work
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Facebook Pixel events firing

### **Performance Tests**
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive
- [ ] SSL certificate valid
- [ ] No console errors

### **API Tests**
- [ ] GraphQL endpoint accessible
- [ ] Cart operations working
- [ ] Order placement working
- [ ] Customer verification working

## 🔄 **Automated Updates (Optional)**

### **Setup GitHub Webhook (Advanced)**
```bash
# Create webhook endpoint
cat > webhook-deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/m.zonash.com
git pull origin main
npm install --production
npm run build
pm2 restart zonash-frontend
EOF

chmod +x webhook-deploy.sh
```

## 🎉 **Success!**

Your application is now deployed from GitHub and ready for production!

### **Next Steps:**
1. Test all functionality
2. Monitor performance
3. Set up alerts
4. Plan for scaling
5. Develop additional features

---

**🚀 Your WooCommerce frontend is live at m.zonash.com!**
