# 🔧 Fix Git Ownership Issue

## 🚨 **Current Issue**
Git is detecting "dubious ownership" in the repository directory. This is a security feature in newer Git versions.

## 🔧 **Quick Fix**

### **Step 1: Add Safe Directory**
```bash
# Add the directory to Git's safe directories
git config --global --add safe.directory /home/zonash-mobile/htdocs/m.zonash.com
```

### **Step 2: Verify Git Status**
```bash
# Check if Git is working now
git status

# Check remote configuration
git remote -v
```

### **Step 3: Pull Updates**
```bash
# Now try pulling updates
git pull origin main
```

## 🔧 **Alternative Fix (If Above Doesn't Work)**

### **Method 1: Change Directory Ownership**
```bash
# Change ownership of the directory to root
chown -R root:root /home/zonash-mobile/htdocs/m.zonash.com

# Try git pull again
git pull origin main
```

### **Method 2: Clone Fresh Repository**
```bash
# Navigate to parent directory
cd /home/zonash-mobile/htdocs

# Backup current directory
mv m.zonash.com m.zonash.com.backup

# Clone fresh repository
git clone https://github.com/adwise-bangladesh/woocomm.git m.zonash.com

# Copy environment files from backup
cp m.zonash.com.backup/.env.local m.zonash.com/
cp m.zonash.com.backup/.env.production m.zonash.com/
cp m.zonash.com.backup/ecosystem.config.js m.zonash.com/

# Navigate to new directory
cd m.zonash.com

# Install dependencies
npm install

# Rebuild application
npm run build

# Start PM2
pm2 start ecosystem.config.js
pm2 save
```

## 🔧 **Complete Fix Commands**

### **One-Line Fix**
```bash
# Fix ownership and pull updates
git config --global --add safe.directory /home/zonash-mobile/htdocs/m.zonash.com && git pull origin main && npm install && npm run build && pm2 restart zonash-frontend
```

### **Full Reset Fix**
```bash
# Complete fix with cache clearing
git config --global --add safe.directory /home/zonash-mobile/htdocs/m.zonash.com && pm2 stop zonash-frontend && git pull origin main && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

## 🚨 **If Still Having Issues**

### **Check Git Configuration**
```bash
# Check Git safe directories
git config --global --get-all safe.directory

# Check Git version
git --version

# Check repository status
git status
```

### **Force Pull**
```bash
# Force pull if needed
git fetch origin main
git reset --hard origin/main
```

## 🎯 **Recommended Solution**

### **Step 1: Fix Git Ownership**
```bash
git config --global --add safe.directory /home/zonash-mobile/htdocs/m.zonash.com
```

### **Step 2: Pull Updates**
```bash
git pull origin main
```

### **Step 3: Install and Rebuild**
```bash
npm install
npm run build
```

### **Step 4: Restart PM2**
```bash
pm2 restart zonash-frontend
pm2 save
```

## 🔍 **Verify Fix**

### **Check Git Status**
```bash
# Should show clean working directory
git status

# Should show latest commit
git log --oneline -5
```

### **Check Application**
```bash
# Check PM2 status
pm2 status

# Test application
curl http://localhost:3000
```

---

**🔧 Run the fix commands above to resolve the Git ownership issue!**
