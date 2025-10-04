# 🔧 Environment Variables Configuration

## 📋 Production Environment Variables

Create a `.env.production` file on your server with the following variables:

```bash
# ===========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ===========================================

# Application Environment
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://m.zonash.com

# GraphQL Backend Configuration
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql

# Store Configuration
NEXT_PUBLIC_STORE_ID=your_store_id_here
NEXT_PUBLIC_STORE_NAME=Zonash

# Facebook Pixel Configuration
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914

# Facebook Business Integration
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_AD_ACCOUNT_ID=your_ad_account_id_here
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_CATALOG_ID=your_catalog_id_here

# Facebook Advanced Features
FACEBOOK_CATALOG_SYNC_INTERVAL=3600
FACEBOOK_CATALOG_AUTO_SYNC=true
FACEBOOK_CATALOG_BATCH_SIZE=100

# Cross-Domain Tracking
NEXT_PUBLIC_CROSS_DOMAIN_DOMAINS=m.zonash.com,zonash.com
NEXT_PUBLIC_COOKIE_DOMAIN=.zonash.com
NEXT_PUBLIC_ENABLE_CROSS_DOMAIN=true

# Security Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://m.zonash.com

# Performance Configuration
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

## 🔐 How to Get Your Values

### 1. **Store Configuration**
```bash
# Get from your WooCommerce backend
NEXT_PUBLIC_STORE_ID=1  # Your WooCommerce store ID
NEXT_PUBLIC_STORE_NAME=Zonash  # Your store name
```

### 2. **Facebook Pixel Configuration**
```bash
# Your Facebook Pixel ID (already provided)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914
```

### 3. **Facebook Business Integration**
To get these values, you need to:

#### A. Facebook App Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Get your App ID and App Secret

#### B. Access Token
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Generate a long-lived access token
4. Use this token for `FACEBOOK_ACCESS_TOKEN`

#### C. Business Manager Setup
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Get your Ad Account ID
3. Get your Page ID
4. Create a Product Catalog and get Catalog ID

### 4. **Security Configuration**
```bash
# Generate a secure secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://m.zonash.com
```

## 📝 Step-by-Step Setup

### 1. **Create Environment File**
```bash
# On your server, create the environment file
cd /var/www/m.zonash.com
nano .env.production
```

### 2. **Add Variables One by One**
Copy and paste each section, replacing placeholder values:

```bash
# Basic Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://m.zonash.com
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
NEXT_PUBLIC_STORE_ID=1
NEXT_PUBLIC_STORE_NAME=Zonash

# Facebook Pixel (already configured)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914

# Add your Facebook credentials here
FACEBOOK_ACCESS_TOKEN=your_token_here
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_AD_ACCOUNT_ID=your_ad_account_here
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_CATALOG_ID=your_catalog_id_here

# Cross-domain settings
NEXT_PUBLIC_CROSS_DOMAIN_DOMAINS=m.zonash.com,zonash.com
NEXT_PUBLIC_COOKIE_DOMAIN=.zonash.com
NEXT_PUBLIC_ENABLE_CROSS_DOMAIN=true

# Security
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=https://m.zonash.com
```

### 3. **Set File Permissions**
```bash
# Secure the environment file
chmod 600 .env.production
chown www-data:www-data .env.production
```

### 4. **Test Configuration**
```bash
# Test if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SITE_URL)"
```

## 🔍 Verification Steps

### 1. **Check Environment Variables**
```bash
# Verify variables are loaded
npm run build
# Should complete without errors
```

### 2. **Test GraphQL Connection**
```bash
# Test backend connection
curl -X POST https://backend.zonash.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

### 3. **Test Facebook Pixel**
```bash
# Check if pixel is configured
curl -s https://m.zonash.com | grep -i "facebook\|pixel"
```

## 🚨 Common Issues

### 1. **Variables Not Loading**
```bash
# Check file exists and has correct permissions
ls -la .env.production
cat .env.production
```

### 2. **Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next/
npm run build
```

### 3. **Facebook Pixel Not Working**
- Verify `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` is set
- Check browser console for errors
- Verify domain is added to Facebook Pixel settings

## 📊 Environment Validation

### 1. **Required Variables Checklist**
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL=https://m.zonash.com`
- [ ] `NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql`
- [ ] `NEXT_PUBLIC_STORE_ID` (your store ID)
- [ ] `NEXT_PUBLIC_STORE_NAME=Zonash`
- [ ] `NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914`

### 2. **Optional Variables Checklist**
- [ ] `FACEBOOK_ACCESS_TOKEN` (for advanced features)
- [ ] `FACEBOOK_APP_ID` (for business integration)
- [ ] `FACEBOOK_APP_SECRET` (for business integration)
- [ ] `FACEBOOK_AD_ACCOUNT_ID` (for advertising)
- [ ] `FACEBOOK_PAGE_ID` (for page integration)
- [ ] `FACEBOOK_CATALOG_ID` (for product catalog)

### 3. **Security Checklist**
- [ ] Environment file has correct permissions (600)
- [ ] File is owned by www-data
- [ ] No sensitive data in version control
- [ ] SSL certificate is valid

## 🎯 Production Ready Checklist

### Before Deployment
- [ ] All environment variables set
- [ ] Backend API accessible
- [ ] Facebook Pixel configured
- [ ] SSL certificate ready
- [ ] Domain DNS configured

### After Deployment
- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Facebook Pixel events firing
- [ ] API calls working
- [ ] No console errors

---

**🔧 Your environment is now configured for production!**

**Next Steps:**
1. Set up your environment variables
2. Test the configuration
3. Deploy your application
4. Verify everything works
5. Monitor performance
