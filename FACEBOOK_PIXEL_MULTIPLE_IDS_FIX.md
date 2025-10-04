# 🔧 Facebook Pixel Multiple IDs Fix

## 🚨 **Current Issue**
You added another pixel ID to `.env` production but it's not working. Let's fix this!

## 🔍 **Check Current Environment Variables**

### **1. Check Your .env File**
```bash
# Check if your .env file has the correct format
cat .env.local

# Or check production .env
cat .env.production
```

### **2. Expected Format**
```bash
# Multiple pixel IDs (comma-separated)
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,123456789012345

# Or single pixel ID (backward compatibility)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
```

## 🔧 **Fix Multiple Pixel IDs**

### **1. Update Environment Variables**
```bash
# Create/update .env.local for development
echo "NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,123456789012345" > .env.local

# Create/update .env.production for production
echo "NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,123456789012345" > .env.production
```

### **2. Clear Cache and Restart**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Rebuild application
npm run build

# Restart PM2
pm2 restart zonash-frontend
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Environment Variables Not Loading**
```bash
# Check if variables are loaded
node -e "console.log('PIXEL_IDS:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS)"

# If not loaded, restart the application
pm2 restart zonash-frontend
```

### **Issue 2: Duplicate Pixel Initialization**
```bash
# Check browser console for duplicate pixel warnings
# Look for: "Duplicate Pixel ID: [ID]"

# Clear browser cache
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### **Issue 3: Pixel Not Loading in Production**
```bash
# Check if environment variables are set in production
echo $NEXT_PUBLIC_FACEBOOK_PIXEL_IDS

# If not set, add to your production environment
export NEXT_PUBLIC_FACEBOOK_PIXEL_IDS="939261277872914,123456789012345"
```

## 🔧 **Debug Multiple Pixel IDs**

### **1. Add Debug Logging**
```bash
# Add this to your .env.local for debugging
echo "NEXT_PUBLIC_DEBUG_PIXEL=true" >> .env.local
```

### **2. Check Pixel Loading**
```bash
# Open browser console and check:
# 1. Are both pixels loaded?
# 2. Any duplicate pixel warnings?
# 3. Are events firing for both pixels?
```

## 🚨 **Production Deployment Fix**

### **1. Update Production Environment**
```bash
# SSH into your production server
ssh root@your-server

# Navigate to your app directory
cd /home/zonash-mobile/htdocs/m.zonash.com

# Create/update .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,123456789012345
NEXT_PUBLIC_STORE_ID=your-store-id
NEXT_PUBLIC_STORE_NAME=your-store-name
NEXT_PUBLIC_SITE_URL=https://m.zonash.com
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
EOF
```

### **2. Restart Production Application**
```bash
# Stop PM2
pm2 stop zonash-frontend

# Clear cache
rm -rf .next node_modules

# Reinstall and rebuild
npm install
npm run build

# Start PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

## 🔍 **Verify Multiple Pixels**

### **1. Check Browser Console**
```javascript
// Open browser console and run:
console.log('Facebook Pixel IDs:', window.fbq);

// Check if both pixels are loaded
// Look for: "Facebook Pixel [ID] initialized"
```

### **2. Test Pixel Events**
```javascript
// Test if both pixels are tracking
fbq('track', 'PageView');
fbq('track', 'ViewContent', {content_ids: ['test']});
```

## 🚨 **Emergency Fix**

### **Complete Reset**
```bash
# Stop everything
pm2 kill

# Clear all caches
rm -rf .next node_modules package-lock.json
npm cache clean --force

# Update environment variables
echo "NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,123456789012345" > .env.local

# Reinstall and rebuild
npm install
npm run build

# Start fresh
pm2 start ecosystem.config.js
pm2 save

# Test
curl http://localhost:3000
```

## 🔧 **Quick Commands**

### **One-Line Fix**
```bash
# Complete fix for multiple pixel IDs
pm2 kill && rm -rf .next node_modules && npm cache clean --force && echo "NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,123456789012345" > .env.local && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

### **Check Status**
```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs zonash-frontend

# Check environment variables
node -e "console.log('PIXEL_IDS:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS)"
```

## 🎯 **What to Do Next**

1. **Check your .env file format** (comma-separated pixel IDs)
2. **Clear all caches** (Next.js, npm, PM2)
3. **Restart the application** (PM2 restart)
4. **Test in browser** (check console for both pixels)
5. **Verify events are firing** (use Facebook Pixel Helper)

---

**🔧 Fix the multiple pixel IDs issue with the commands above!**
