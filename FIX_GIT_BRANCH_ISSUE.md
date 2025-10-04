# 🔧 Fix Git Branch Issue

## 🚨 **Current Issue**
Git can't find the `main` branch. This could be because:
1. The default branch is `master` instead of `main`
2. The branch name is different
3. The remote repository doesn't exist or has different structure

## 🔧 **Quick Fix - Check Available Branches**

### **Step 1: Check Remote Branches**
```bash
# Check what branches are available on the remote
git branch -r

# Check all remote information
git remote show origin
```

### **Step 2: Check Local Branches**
```bash
# Check local branches
git branch

# Check current branch
git branch --show-current
```

## 🔧 **Common Solutions**

### **Solution 1: If Branch is `master`**
```bash
# Pull from master branch instead
git pull origin master
```

### **Solution 2: If Branch is Different**
```bash
# Check what branches exist
git ls-remote --heads origin

# Pull from the correct branch (replace 'develop' with actual branch name)
git pull origin develop
```

### **Solution 3: If Repository Structure is Different**
```bash
# Check remote URL
git remote -v

# If URL is wrong, update it
git remote set-url origin https://github.com/adwise-bangladesh/woocomm.git

# Try pulling again
git pull origin main
```

## 🔧 **Complete Fix Commands**

### **Check and Fix Remote**
```bash
# Check remote configuration
git remote -v

# If needed, update remote URL
git remote set-url origin https://github.com/adwise-bangladesh/woocomm.git

# Check available branches
git ls-remote --heads origin

# Pull from the correct branch
git pull origin main
```

### **Alternative: Clone Fresh Repository**
```bash
# Navigate to parent directory
cd /home/zonash-mobile/htdocs

# Backup current directory
mv m.zonash.com m.zonash.com.backup

# Clone fresh repository
git clone https://github.com/adwise-bangladesh/woocomm.git m.zonash.com

# Navigate to new directory
cd m.zonash.com

# Check branches
git branch -a

# Switch to correct branch if needed
git checkout main
# or
git checkout master
```

## 🚨 **Troubleshooting**

### **Check Repository Access**
```bash
# Test if you can access the repository
curl -I https://github.com/adwise-bangladesh/woocomm

# Check if repository exists
git ls-remote https://github.com/adwise-bangladesh/woocomm.git
```

### **Check Authentication**
```bash
# If using HTTPS, you might need to use token instead of password
# Go to GitHub → Settings → Developer settings → Personal access tokens
# Create a token and use it as password
```

## 🔧 **Quick Commands to Try**

### **Command 1: Check Branches**
```bash
git ls-remote --heads origin
```

### **Command 2: Try Master Branch**
```bash
git pull origin master
```

### **Command 3: Check Remote URL**
```bash
git remote -v
```

### **Command 4: Update Remote URL**
```bash
git remote set-url origin https://github.com/adwise-bangladesh/woocomm.git
```

## 🎯 **Recommended Solution**

### **Step 1: Check What's Available**
```bash
# Check remote branches
git ls-remote --heads origin
```

### **Step 2: Try Different Branch Names**
```bash
# Try master branch
git pull origin master

# Or try main branch
git pull origin main

# Or check what the default branch is
git remote show origin
```

### **Step 3: If Still Failing, Clone Fresh**
```bash
# Backup and clone fresh
cd /home/zonash-mobile/htdocs
mv m.zonash.com m.zonash.com.backup
git clone https://github.com/adwise-bangladesh/woocomm.git m.zonash.com
cd m.zonash.com
```

## 🔍 **Verify Fix**

### **Check Repository Status**
```bash
# Should show clean working directory
git status

# Should show latest commit
git log --oneline -5
```

### **Check Application**
```bash
# Install dependencies
npm install

# Rebuild application
npm run build

# Restart PM2
pm2 restart zonash-frontend
pm2 save
```

---

**🔧 Run the commands above to find the correct branch and pull your updates!**
