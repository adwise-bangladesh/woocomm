# 🔧 Convert TypeScript Config to JavaScript

## 📍 **Current Issue**
Next.js is having trouble with the TypeScript config. Let's convert it to JavaScript for production deployment.

### **1. Convert TypeScript Config to JavaScript**
```bash
# Rename the TypeScript config to JavaScript
mv next.config.ts next.config.js

# Create a JavaScript version of the config
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

### **2. Try Building Again**
```bash
# Build the application
npm run build
```

### **3. If Build Succeeds, Start with PM2**
```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🚨 **Alternative: Install TypeScript Properly**

If you want to keep TypeScript:

```bash
# Remove the problematic config
rm next.config.ts

# Install TypeScript globally
sudo npm install -g typescript

# Install TypeScript locally
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Create a new TypeScript config
cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

export default nextConfig;
EOF

# Try building again
npm run build
```

## 🎯 **Recommended Solution (JavaScript Config)**

```bash
# Convert to JavaScript (simpler for production)
mv next.config.ts next.config.js

# Create the JavaScript config
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

# Build again
npm run build
```

## 🔧 **Quick Commands**

```bash
# Convert to JavaScript config
mv next.config.ts next.config.js

# Create JavaScript config
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

# Build again
npm run build
```

---

**🔧 Convert the config to JavaScript and continue with deployment!**
