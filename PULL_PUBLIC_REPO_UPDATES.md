# 🚀 Pull Updates from Public Repository

## ✅ **Repository is Now Public**
Since your repository `woocomm` is now public, you can pull updates without authentication issues.

## 🔧 **Pull Updates from Public Repository**

### **Step 1: Check Current Status**
```bash
# Check current branch
git branch

# Check remote configuration
git remote -v

# Check if there are any uncommitted changes
git status
```

### **Step 2: Pull Latest Updates**
```bash
# Pull from main branch (or master if that's the default)
git pull origin main

# If main doesn't work, try master
git pull origin master
```

### **Step 3: Install Dependencies and Rebuild**
```bash
# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Restart PM2
pm2 restart zonash-frontend
pm2 save
```

## 🔧 **Complete Update Process**

### **One-Line Update Command**
```bash
# Complete update in one command
git pull origin main && npm install && npm run build && pm2 restart zonash-frontend && pm2 save
```

### **Full Reset Update (If Needed)**
```bash
# Full reset with cache clearing
pm2 stop zonash-frontend && git pull origin main && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

## 🔍 **Verify Updates**

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

# Check PM2 logs
pm2 logs zonash-frontend --lines 20

# Test application
curl http://localhost:3000
```

## 🚨 **If Still Having Issues**

### **Check Branch Name**
```bash
# Check what branches are available
git ls-remote --heads origin

# Check default branch
git remote show origin
```

### **Force Pull**
```bash
# Force pull if needed
git fetch origin main
git reset --hard origin/main
```

### **Clone Fresh (Last Resort)**
```bash
# Navigate to parent directory
cd /home/zonash-mobile/htdocs

# Backup current directory
mv m.zonash.com m.zonash.com.backup

# Clone fresh repository
git clone https://github.com/adwise-bangladesh/woocomm.git m.zonash.com

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

## 🎯 **Recommended Commands**

### **Quick Update**
```bash
git pull origin main && npm install && npm run build && pm2 restart zonash-frontend && pm2 save
```

### **Full Reset Update**
```bash
pm2 stop zonash-frontend && git pull origin main && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

## 🔧 **Check What's New**

### **See Recent Changes**
```bash
# Check recent commits
git log --oneline -10

# Check what files changed
git diff HEAD~5 --name-only
```

### **Check Facebook Pixel Fixes**
```bash
# Check if Facebook Pixel duplicate fix is included
git log --oneline -10 | grep -i "pixel\|facebook\|duplicate"
```

---

**🚀 Now you can pull updates from your public repository!**
