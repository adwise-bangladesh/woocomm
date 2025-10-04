# 🔧 Fix TypeScript Build Error

## 📍 **Current Issue**
The build is failing because TypeScript is not installed. Let's fix this:

### **1. Install TypeScript and Development Dependencies**
```bash
# Install TypeScript and other dev dependencies
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Or install all dependencies (including dev dependencies)
npm install
```

### **2. Alternative: Convert to JavaScript Config**
If you want to avoid TypeScript dependencies, convert the config to JavaScript:

```bash
# Rename the TypeScript config to JavaScript
mv next.config.ts next.config.js

# Edit the JavaScript config (remove TypeScript syntax)
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@woocommerce/woocommerce-rest-api']
  },
  images: {
    domains: ['backend.zonash.com'],
    unoptimized: false
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://backend.zonash.com/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF
```

### **3. Try Building Again**
```bash
# Try building again
npm run build
```

### **4. If Still Failing, Install All Dependencies**
```bash
# Install all dependencies (including dev dependencies)
npm install

# Try building again
npm run build
```

### **5. Alternative: Use Production Build Script**
```bash
# Create a production build script
cat > build-production.sh << 'EOF'
#!/bin/bash

# Install all dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
EOF

chmod +x build-production.sh
./build-production.sh
```

## 🚨 **Quick Fix Commands**

### **Option 1: Install TypeScript (Recommended)**
```bash
# Install TypeScript and dev dependencies
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Build again
npm run build
```

### **Option 2: Convert to JavaScript Config**
```bash
# Convert TypeScript config to JavaScript
mv next.config.ts next.config.js

# Edit the config to remove TypeScript syntax
nano next.config.js

# Build again
npm run build
```

### **Option 3: Install All Dependencies**
```bash
# Install all dependencies (including dev)
npm install

# Build again
npm run build
```

## 🔧 **If Build Still Fails**

### **Check Node.js Version**
```bash
# Check Node.js version
node --version
npm --version

# If Node.js is too old, update it
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Clear Cache and Rebuild**
```bash
# Clear all caches
rm -rf node_modules
rm -rf .next
rm package-lock.json

# Reinstall everything
npm install

# Build again
npm run build
```

### **Check for Missing Dependencies**
```bash
# Check if all required packages are installed
npm list

# Install missing packages
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

## 🎯 **Recommended Solution**

Run these commands in order:

```bash
# 1. Install TypeScript and dev dependencies
npm install --save-dev typescript @types/node @types/react @types/react-dom

# 2. Try building
npm run build

# 3. If successful, start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🚨 **Emergency Fallback**

If nothing works, use the JavaScript config:

```bash
# Convert to JavaScript
mv next.config.ts next.config.js

# Edit the config file
nano next.config.js

# Remove TypeScript syntax and make it plain JavaScript
# Then build
npm run build
```

---

**🔧 Fix the TypeScript issue and continue with deployment!**
