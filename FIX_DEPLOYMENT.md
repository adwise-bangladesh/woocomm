# 🔧 Fix Deployment - Repository Structure

## 📍 **Current Situation**
Your repository was cloned into a subdirectory `woocomm` instead of the current directory. Let's fix this:

### **1. Move Files to Correct Location**
```bash
# You're currently in: /home/zonash-mobile/htdocs/m.zonash.com
# The files are in: /home/zonash-mobile/htdocs/m.zonash.com/woocomm

# Move all files from woocomm subdirectory to current directory
mv woocomm/* .
mv woocomm/.* . 2>/dev/null || true  # Move hidden files (like .git)

# Remove the empty woocomm directory
rmdir woocomm

# Verify files are now in the correct location
ls -la
```

### **2. Verify Repository Structure**
```bash
# Check if you have the main files
ls -la
# You should see: package.json, next.config.ts, app/, components/, lib/, etc.

# Check if .git directory exists
ls -la .git
```

### **3. Continue with Deployment**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install project dependencies
npm install --production
```

### **4. Create Environment File**
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

chmod 600 .env.production
```

### **5. Build Application**
```bash
# Build the application
npm run build

# Verify build
ls -la .next/
echo "Build completed successfully!"
```

### **6. Create PM2 Configuration**
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
```

### **7. Start Application**
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### **8. Test Application**
```bash
# Test application locally
curl http://localhost:3000

# Check PM2 status
pm2 status

# View logs
pm2 logs zonash-frontend --lines 20
```

## 🔧 **Alternative: Clean Start**

If you want to start fresh:

```bash
# Remove everything and start over
rm -rf woocomm
rm -rf .git

# Clone directly into current directory
git clone https://github.com/adwise-bangladesh/woocomm.git .

# Continue with deployment steps
```

## 🎯 **Quick Commands Summary**

```bash
# Fix the directory structure
mv woocomm/* .
mv woocomm/.* . 2>/dev/null || true
rmdir woocomm

# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
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

# Build and start
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🚨 **Troubleshooting**

### **If Files Don't Move:**
```bash
# Check what's in the woocomm directory
ls -la woocomm/

# Copy files instead of moving
cp -r woocomm/* .
cp -r woocomm/.* . 2>/dev/null || true
```

### **If Build Fails:**
```bash
# Clear cache and rebuild
rm -rf .next/
npm run build
```

### **If PM2 Fails:**
```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart zonash-frontend
```

---

**🔧 Fix the directory structure and continue with deployment!**
