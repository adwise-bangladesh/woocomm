# 🔧 Fix Git Merge Conflict - Local Changes

## 🚨 **Current Issue**
You have local changes to `.env.local` that would be overwritten by the merge. We need to handle these local changes.

## 🔧 **Solution Options**

### **Option 1: Stash Local Changes (Recommended)**
```bash
# Stash your local changes
git stash

# Pull the updates
git pull origin master

# Apply your local changes back
git stash pop
```

### **Option 2: Commit Local Changes First**
```bash
# Add your local changes
git add .env.local

# Commit your changes
git commit -m "Save local environment changes"

# Pull the updates
git pull origin master
```

### **Option 3: Force Overwrite Local Changes**
```bash
# Reset local changes (WARNING: This will lose your local changes)
git reset --hard HEAD

# Pull the updates
git pull origin master
```

## 🔧 **Recommended Solution (Option 1)**

### **Step 1: Stash Local Changes**
```bash
# Stash your local changes
git stash
```

### **Step 2: Pull Updates**
```bash
# Pull the updates
git pull origin master
```

### **Step 3: Apply Local Changes Back**
```bash
# Apply your local changes back
git stash pop
```

### **Step 4: Handle Any Conflicts**
```bash
# If there are conflicts, resolve them
git status

# Check what files have conflicts
git diff
```

## 🔧 **Complete Update Process**

### **One-Line Command**
```bash
# Complete update with stash
git stash && git pull origin master && git stash pop && npm install && npm run build && pm2 restart zonash-frontend && pm2 save
```

### **Full Reset Update (If Needed)**
```bash
# Full reset with cache clearing
pm2 stop zonash-frontend && git reset --hard HEAD && git pull origin master && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
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

# If there are conflicts, resolve them
git diff
```

### **Force Pull (Last Resort)**
```bash
# Force pull if needed (WARNING: This will lose local changes)
git reset --hard origin/master
```

## 🎯 **Recommended Commands**

### **Quick Update with Stash**
```bash
git stash && git pull origin master && git stash pop && npm install && npm run build && pm2 restart zonash-frontend && pm2 save
```

### **Full Reset Update**
```bash
pm2 stop zonash-frontend && git reset --hard HEAD && git pull origin master && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
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

**🚀 Use the stash method to preserve your local changes while pulling updates!**
