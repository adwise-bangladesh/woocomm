# 🚀 GitHub to VPS Deployment Guide

## 📍 **Current Setup**
- **Code**: GitHub repository (`https://github.com/adwise-bangladesh/woocomm`)
- **Live Server**: VPS with CloudPanel
- **Directory**: `/home/zonash-mobile/htdocs/m.zonash.com`

## 🔧 **Method 1: SSH into VPS and Pull Updates**

### **Step 1: SSH into Your VPS**
```bash
# SSH into your VPS server
ssh root@your-vps-ip

# Navigate to your project directory
cd /home/zonash-mobile/htdocs/m.zonash.com
```

### **Step 2: Pull Updates from GitHub**
```bash
# Stop PM2 application
pm2 stop zonash-frontend

# Pull latest changes from GitHub
git pull origin main

# Check if there are any new changes
git status
```

### **Step 3: Install Dependencies and Rebuild**
```bash
# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Start PM2 application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check PM2 status
pm2 status
```

## 🔧 **Method 2: Automated Deployment Script**

### **Step 1: Create Deployment Script**
```bash
# Create deployment script
cat > deploy-update.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting deployment from GitHub..."

# Navigate to project directory
cd /home/zonash-mobile/htdocs/m.zonash.com

# Stop PM2 application
echo "⏹️ Stopping PM2 application..."
pm2 stop zonash-frontend

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Rebuild application
echo "🔨 Rebuilding application..."
npm run build

# Start PM2 application
echo "▶️ Starting PM2 application..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check PM2 status
echo "✅ Checking PM2 status..."
pm2 status

echo "🎉 Deployment completed successfully!"
EOF

# Make script executable
chmod +x deploy-update.sh
```

### **Step 2: Run Deployment Script**
```bash
# Run the deployment script
./deploy-update.sh
```

## 🔧 **Method 3: One-Line Deployment**

### **Quick Update Command**
```bash
# One-line command to update from GitHub
cd /home/zonash-mobile/htdocs/m.zonash.com && pm2 stop zonash-frontend && git pull origin main && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save && pm2 status
```

## 🔧 **Method 4: GitHub Actions (Advanced)**

### **Step 1: Create GitHub Actions Workflow**
```bash
# Create .github/workflows directory
mkdir -p .github/workflows

# Create deployment workflow
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /home/zonash-mobile/htdocs/m.zonash.com
          pm2 stop zonash-frontend
          git pull origin main
          npm install
          npm run build
          pm2 start ecosystem.config.js
          pm2 save
          pm2 status
EOF
```

### **Step 2: Add Secrets to GitHub**
1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Add these secrets:
   - `VPS_HOST`: Your VPS IP address
   - `VPS_USERNAME`: Your VPS username (usually `root`)
   - `VPS_SSH_KEY`: Your SSH private key

## 🚨 **Troubleshooting**

### **Issue 1: Git Pull Fails**
```bash
# Check git status
git status

# If there are conflicts, reset to remote
git reset --hard origin/main

# Pull again
git pull origin main
```

### **Issue 2: Build Fails**
```bash
# Clear cache and try again
rm -rf .next node_modules
npm cache clean --force
npm install
npm run build
```

### **Issue 3: PM2 Won't Start**
```bash
# Check PM2 logs
pm2 logs zonash-frontend

# Kill all PM2 processes
pm2 kill

# Start fresh
pm2 start ecosystem.config.js
pm2 save
```

### **Issue 4: Port Already in Use**
```bash
# Check what's using port 3000
netstat -tlnp | grep 3000

# Kill the process
kill -9 $(lsof -t -i:3000)

# Start PM2 again
pm2 start ecosystem.config.js
```

## 🔍 **Verify Deployment**

### **1. Check Application Status**
```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs zonash-frontend --lines 20

# Test application
curl http://localhost:3000
```

### **2. Check Website**
```bash
# Test your live website
curl https://m.zonash.com

# Check if Facebook Pixel is working
# Open browser and check console for pixel events
```

## 🎯 **Recommended Workflow**

### **Daily Updates**
```bash
# Quick update command
cd /home/zonash-mobile/htdocs/m.zonash.com && pm2 stop zonash-frontend && git pull origin main && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

### **Major Updates**
```bash
# Full deployment with cache clearing
cd /home/zonash-mobile/htdocs/m.zonash.com && pm2 kill && rm -rf .next node_modules && git pull origin main && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

## 🚀 **Quick Commands Summary**

```bash
# Method 1: Manual update
ssh root@your-vps-ip
cd /home/zonash-mobile/htdocs/m.zonash.com
pm2 stop zonash-frontend
git pull origin main
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save

# Method 2: One-line update
cd /home/zonash-mobile/htdocs/m.zonash.com && pm2 stop zonash-frontend && git pull origin main && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save

# Method 3: Full reset update
cd /home/zonash-mobile/htdocs/m.zonash.com && pm2 kill && rm -rf .next node_modules && git pull origin main && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

---

**🚀 Choose the method that works best for you and deploy your updates!**
