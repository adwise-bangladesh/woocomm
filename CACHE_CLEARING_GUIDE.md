# 🧹 Cache Clearing Guide - Show Updated Products

## 🚨 **Quick Cache Clear Commands**

### **1. Clear Next.js Build Cache**
```bash
# Remove .next build cache
rm -rf .next

# Remove node_modules cache
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Rebuild application
npm run build
```

### **2. Clear Browser Cache**
```bash
# Clear browser cache (run in browser console)
localStorage.clear();
sessionStorage.clear();

# Or hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **3. Clear PM2 Cache**
```bash
# Restart PM2 application
pm2 restart zonash-frontend

# Or stop and start
pm2 stop zonash-frontend
pm2 start ecosystem.config.js

# Clear PM2 logs
pm2 flush
```

## 🔧 **Complete Cache Clear Process**

### **Step 1: Stop Application**
```bash
# Stop PM2 application
pm2 stop zonash-frontend

# Kill all PM2 processes
pm2 kill
```

### **Step 2: Clear All Caches**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Clear package-lock.json
rm -f package-lock.json
```

### **Step 3: Reinstall and Rebuild**
```bash
# Reinstall dependencies
npm install

# Rebuild application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### **Step 4: Test Application**
```bash
# Test application
curl http://localhost:3000

# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs zonash-frontend --lines 20
```

## 🌐 **Clear CloudPanel/Nginx Cache**

### **1. Clear Nginx Cache**
```bash
# Clear Nginx cache
sudo rm -rf /var/cache/nginx/*

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

### **2. Clear CloudPanel Cache**
```bash
# Clear CloudPanel cache
sudo systemctl restart cloudpanel

# Clear PHP-FPM cache
sudo systemctl restart php8.1-fpm
```

## 🔄 **Force Revalidation**

### **1. Clear ISR Cache (Next.js)**
```bash
# Clear ISR cache
rm -rf .next/cache

# Restart application
pm2 restart zonash-frontend
```

### **2. Clear GraphQL Cache**
```bash
# Clear GraphQL cache
rm -rf .next/cache/graphql

# Restart application
pm2 restart zonash-frontend
```

## 🚨 **Emergency Cache Clear**

### **Complete System Cache Clear**
```bash
# Stop everything
pm2 kill
sudo systemctl stop nginx

# Clear all caches
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Clear system caches
sudo rm -rf /var/cache/nginx/*
sudo rm -rf /tmp/*

# Reinstall and rebuild
npm install
npm run build

# Start everything
pm2 start ecosystem.config.js
pm2 save
sudo systemctl start nginx

# Test
curl http://localhost:3000
```

## 🔍 **Verify Cache Clear**

### **1. Check Application Status**
```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs zonash-frontend

# Check Nginx status
sudo systemctl status nginx

# Check if port 3000 is running
netstat -tlnp | grep 3000
```

### **2. Test Product Updates**
```bash
# Test if products are updated
curl http://localhost:3000/api/products

# Check specific product
curl http://localhost:3000/product/[product-slug]
```

## 🎯 **Quick Fix Commands**

### **One-Line Cache Clear**
```bash
# Complete cache clear and restart
pm2 kill && rm -rf .next node_modules && npm cache clean --force && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
```

### **Browser Cache Clear**
```bash
# Clear browser cache (run in browser console)
localStorage.clear(); sessionStorage.clear(); location.reload(true);
```

## 🔧 **Prevent Cache Issues**

### **1. Disable Caching in Development**
```bash
# Add to next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
}
```

### **2. Force Revalidation**
```bash
# Add revalidation to API routes
export const revalidate = 0;
```

## 🚨 **Troubleshooting**

### **If Products Still Not Updated**
```bash
# Check if backend is updated
curl https://backend.zonash.com/wp-json/wc/v3/products

# Check GraphQL endpoint
curl -X POST https://backend.zonash.com/graphql -H "Content-Type: application/json" -d '{"query":"{ products { nodes { id name } } }"}'
```

### **If Application Won't Start**
```bash
# Check PM2 logs
pm2 logs zonash-frontend

# Check system logs
sudo journalctl -u nginx

# Check if port is in use
netstat -tlnp | grep 3000
```

---

**🧹 Run the cache clearing commands to show updated products!**
