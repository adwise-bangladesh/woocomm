# Facebook Pixel Environment Variables Setup

## 🔧 **Required Environment Variables**

Add these to your `.env.local` file:

```bash
# Facebook Pixel Configuration
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=939261277872914
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=939261277872914,ANOTHER_PIXEL_ID
NEXT_PUBLIC_SITE_URL=https://zoansh.com

# Facebook Conversions API (Server-Side Tracking)
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Store Configuration
NEXT_PUBLIC_STORE_ID=1
NEXT_PUBLIC_STORE_NAME=Zoansh Store
NEXT_PUBLIC_GRAPHQL_ENDPOINT=your_graphql_endpoint_here
```

## 🚀 **How to Get Facebook Access Token**

### **Step 1: Create Facebook App**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business" → "Continue"
3. Fill in app details:
   - **App Name**: Your Store Name
   - **App Contact Email**: Your email
   - **Business Account**: Select your business account
4. Click "Create App"

### **Step 2: Add Facebook Pixel**
1. In your app dashboard, go to "Add Products"
2. Find "Facebook Pixel" and click "Set Up"
3. Choose "Use an existing pixel" or "Create a new pixel"
4. Copy your Pixel ID

### **Step 3: Get Access Token**
1. Go to "Tools" → "Graph API Explorer"
2. Select your app
3. Generate a User Access Token with these permissions:
   - `ads_management`
   - `business_management`
   - `pixel_management`
4. Copy the access token

### **Step 4: Get App ID and Secret**
1. Go to "Settings" → "Basic"
2. Copy "App ID" and "App Secret"

## 🔐 **Security Best Practices**

### **1. Use Environment Variables**
```bash
# Never hardcode in your source code
FACEBOOK_ACCESS_TOKEN=your_token_here
```

### **2. Use Server-Side Only**
```typescript
// Server-side only (not exposed to client)
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
```

### **3. Rotate Tokens Regularly**
- Set up token rotation every 60 days
- Use Facebook's token refresh mechanism
- Monitor token expiration

## 📊 **Testing Your Setup**

### **1. Check Environment Variables**
```typescript
// Add to your debug component
console.log('Facebook Pixel ID:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
console.log('Facebook Access Token:', process.env.FACEBOOK_ACCESS_TOKEN ? 'Set' : 'Not Set');
```

### **2. Test Server-Side API**
```bash
# Test your API endpoint
curl -X POST http://localhost:3000/api/facebook-conversions \
  -H "Content-Type: application/json" \
  -d '{"eventName":"Test","eventData":{},"userData":{},"customData":{}}'
```

### **3. Check Facebook Events Manager**
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your pixel
3. Check "Test Events" tab
4. Verify events are being received

## 🎯 **Advanced Configuration**

### **1. Multiple Pixels**
```bash
# For multiple pixels
NEXT_PUBLIC_FACEBOOK_PIXEL_IDS=123456789,987654321,555666777
```

### **2. Different Environments**
```bash
# Development
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=dev_pixel_id

# Production
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=prod_pixel_id
```

### **3. Custom Domains**
```bash
# For custom domains
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Access Token Invalid"**
   - Check token permissions
   - Verify token hasn't expired
   - Ensure app is approved

2. **"Pixel Not Found"**
   - Verify pixel ID
   - Check pixel is active
   - Ensure proper permissions

3. **"Events Not Showing"**
   - Check network requests
   - Verify pixel is loaded
   - Check browser console for errors

### **Debug Commands:**
```bash
# Check if environment variables are loaded
npm run dev
# Look for console logs showing pixel status

# Test Facebook Pixel Helper
# Install Chrome extension and check events
```

## 📈 **Performance Monitoring**

### **1. Event Delivery Rate**
- Monitor in Facebook Events Manager
- Target: 95%+ delivery rate
- Check for failed events

### **2. Data Quality Score**
- Monitor in Facebook Events Manager
- Target: 85%+ quality score
- Check for missing data

### **3. Attribution Accuracy**
- Monitor conversion attribution
- Check for duplicate events
- Verify proper event sequencing

## 🚀 **Next Steps**

1. **Set up environment variables**
2. **Test the implementation**
3. **Monitor event delivery**
4. **Optimize based on results**
5. **Scale to production**

Your Facebook Pixel is now ready for advanced tracking! 🎯
