# 🚀 LIVE Production Deployment Guide

## **Ready to Deploy Your WooCommerce Frontend to Production!**

### **📋 Pre-Deployment Checklist ✅**

- [x] **Build Test**: Application builds successfully (`npm run build`)
- [x] **Dependencies**: All packages installed and compatible
- [x] **Environment**: Production configuration ready
- [x] **Scripts**: Deployment scripts prepared
- [x] **Performance**: Optimized for production

### **🎯 Current Status**
- **Build Status**: ✅ Successful (17.7s compile time)
- **Warnings**: Minor ESLint warnings (non-blocking)
- **Bundle Size**: Optimized (102kB shared JS)
- **Static Pages**: 19 pages generated
- **Performance**: Production-ready

---

## **🚀 Deployment Options**

### **Option 1: Automated Deployment (Recommended)**

#### **Step 1: Upload Files to Server**
```bash
# Upload your project files to the server
# You can use:
# - SCP: scp -r . user@server:/home/zonash-mobile/htdocs/m.zonash.com/
# - SFTP: Use FileZilla or similar
# - Git: Clone directly on server
```

#### **Step 2: Run Deployment Script**
```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to your app directory
cd /home/zonash-mobile/htdocs/m.zonash.com

# Make script executable (if needed)
chmod +x deploy-production-live.sh

# Run the deployment
./deploy-production-live.sh
```

### **Option 2: Manual Deployment**

#### **Step 1: Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

#### **Step 2: Upload and Setup**
```bash
# Create app directory
sudo mkdir -p /home/zonash-mobile/htdocs/m.zonash.com
sudo chown -R $USER:$USER /home/zonash-mobile/htdocs/m.zonash.com

# Upload your files (replace with your method)
# Option A: Git clone
cd /home/zonash-mobile/htdocs/m.zonash.com
git clone https://github.com/adwise-bangladesh/woocomm.git .

# Option B: Upload via CloudPanel file manager
# Option C: SCP/SFTP upload
```

#### **Step 3: Install Dependencies**
```bash
cd /home/zonash-mobile/htdocs/m.zonash.com
npm install --production
```

#### **Step 4: Create Environment File**
```bash
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
```

#### **Step 5: Build Application**
```bash
npm run build
```

#### **Step 6: Setup PM2**
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'zonash-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/zonash-mobile/htdocs/m.zonash.com',
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

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## **🔧 CloudPanel Configuration**

### **Domain Setup**
1. **Login to CloudPanel**
2. **Go to "Websites"**
3. **Add Website**: `m.zonash.com`
4. **Document Root**: `/home/zonash-mobile/htdocs/m.zonash.com`
5. **Enable SSL**: Let's Encrypt certificate
6. **Node.js**: Enable Node.js support

### **Nginx Configuration**
```nginx
server {
    listen 443 ssl http2;
    server_name m.zonash.com;
    
    # SSL Configuration (CloudPanel handles this)
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Static files caching
    location /_next/static/ {
        alias /home/zonash-mobile/htdocs/m.zonash.com/.next/static/;
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

---

## **📊 Post-Deployment Verification**

### **1. Test Application**
```bash
# Check PM2 status
pm2 status

# Test local connection
curl http://localhost:3000

# Test public URL
curl https://m.zonash.com
```

### **2. Monitor Logs**
```bash
# View application logs
pm2 logs zonash-frontend

# Monitor in real-time
pm2 monit
```

### **3. Performance Testing**
- **Homepage**: Should load in < 2 seconds
- **Category Pages**: Should load in < 1 second
- **Product Pages**: Should load in < 1.5 seconds
- **Mobile**: Should be responsive and fast

---

## **🔍 Troubleshooting**

### **Common Issues & Solutions**

#### **1. Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next/
rm -rf node_modules/
npm install
npm run build
```

#### **2. PM2 Issues**
```bash
# Restart PM2
pm2 restart zonash-frontend

# Check logs
pm2 logs zonash-frontend --lines 50

# Delete and restart
pm2 delete zonash-frontend
pm2 start ecosystem.config.js
```

#### **3. Port Issues**
```bash
# Check if port 3000 is in use
netstat -tulpn | grep :3000

# Kill process if needed
sudo kill -9 $(lsof -t -i:3000)
```

#### **4. Permission Issues**
```bash
# Fix permissions
sudo chown -R www-data:www-data /home/zonash-mobile/htdocs/m.zonash.com
sudo chmod -R 755 /home/zonash-mobile/htdocs/m.zonash.com
```

---

## **📈 Performance Monitoring**

### **Key Metrics to Monitor**
- **Response Time**: < 500ms average
- **Memory Usage**: < 1GB per instance
- **CPU Usage**: < 80% average
- **Error Rate**: < 1%

### **Monitoring Commands**
```bash
# Check PM2 status
pm2 status

# Monitor resources
pm2 monit

# View logs
pm2 logs zonash-frontend --lines 100

# Check system resources
htop
free -h
df -h
```

---

## **🎯 Next Steps After Deployment**

1. **✅ Test all functionality**
   - Homepage loads correctly
   - Category pages work
   - Product pages display properly
   - Cart and checkout flow works
   - Facebook Pixel fires correctly

2. **✅ Performance optimization**
   - Monitor Core Web Vitals
   - Check Lighthouse scores
   - Optimize images if needed

3. **✅ Security verification**
   - SSL certificate working
   - Security headers present
   - No console errors

4. **✅ Backup strategy**
   - Database backups
   - Code repository backups
   - Environment file backups

---

## **🚨 Emergency Procedures**

### **If Application Goes Down**
```bash
# Quick restart
pm2 restart zonash-frontend

# Check status
pm2 status

# View error logs
pm2 logs zonash-frontend --err
```

### **If Build Fails**
```bash
# Clear everything and rebuild
rm -rf .next/ node_modules/ package-lock.json
npm install
npm run build
pm2 restart zonash-frontend
```

### **If Memory Issues**
```bash
# Increase memory limit
pm2 restart zonash-frontend --node-args="--max-old-space-size=4096"
```

---

## **📞 Support Commands**

```bash
# Check application health
curl -I https://m.zonash.com

# Test API endpoints
curl https://m.zonash.com/api/health

# Monitor logs in real-time
pm2 logs zonash-frontend --follow

# Check system resources
top
htop
free -h
```

---

**🎉 Your WooCommerce frontend is ready for production deployment!**

**Next**: Run the deployment script on your server to go live! 🚀
