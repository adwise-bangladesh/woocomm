# 🚀 Pull Updates from Master Branch

## ✅ **Issue Identified**
The repository has a `master` branch, not `main`. The local branch is also configured for `master`.

## 🔧 **Pull Updates from Master Branch**

### **Step 1: Pull from Master Branch**
```bash
# Pull from master branch (the correct branch)
git pull origin master
```

### **Step 2: Check if Updates Were Pulled**
```bash
# Check git status
git status

# Check recent commits
git log --oneline -5
```

### **Step 3: Install Dependencies and Rebuild**
```bash
# Install any new dependencies
npm install

# Rebuild the application
npm run build
```

### **Step 4: Restart PM2**
```bash
# Restart PM2 application
pm2 restart zonash-frontend

# Save PM2 configuration
pm2 save

# Check PM2 status
pm2 status
```

## 🔧 **Complete Update Process**

### **One-Line Update Command**
```bash
# Complete update in one command
git pull origin master && npm install && npm run build && pm2 restart zonash-frontend && pm2 save
```

### **Full Reset Update (If Needed)**
```bash
# Full reset with cache clearing
pm2 stop zonash-frontend && git pull origin master && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
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

### **Check for Conflicts**
```bash
# Check if there are any merge conflicts
git status

# If there are conflicts, reset to remote
git reset --hard origin/master
```

### **Force Pull**
```bash
# Force pull if needed
git fetch origin master
git reset --hard origin/master
```

## 🎯 **Recommended Commands**

### **Quick Update**
```bash
git pull origin master && npm install && npm run build && pm2 restart zonash-frontend && pm2 save
```

### **Full Reset Update**
```bash
pm2 stop zonash-frontend && git pull origin master && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
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

**🚀 Now you can pull updates from the master branch!**
