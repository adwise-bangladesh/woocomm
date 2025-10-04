# Timeout and Progress Debugging Implementation

## 🔧 **Enhanced Debugging Features:**

### **1. Request Timeout (30 seconds):**
```javascript
// Add timeout to prevent hanging requests
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch(endpoint, {
  method: 'POST',
  headers,
  body: JSON.stringify({ query, variables }),
  signal: controller.signal,
});
```

### **2. Progress Indicators:**
```javascript
// Add a progress indicator
const progressInterval = setInterval(() => {
  console.log('⏳ Still processing order...');
}, 5000);

// Add timeout wrapper
const orderPromise = fetchWithSession(PLACE_ORDER, { input: checkoutInput }, sessionToken);
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Order placement timeout after 30 seconds')), 30000);
});

result = await Promise.race([orderPromise, timeoutPromise]);
```

### **3. Detailed Request/Response Logging:**
```javascript
console.log('🔑 Using session token:', sessionToken.substring(0, 10) + '...');
console.log('📤 Request headers:', headers);
console.log('📤 Request body:', JSON.stringify({ query, variables }, null, 2));
console.log('📥 Response status:', response.status);
console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
console.log('📥 Response data:', JSON.stringify(data, null, 2));
```

## 🚀 **Expected Debug Output:**

**✅ Successful Order:**
```
🛒 Placing order with session...
⏱️ Starting order placement...
🔄 This may take a few moments...
🔑 Using session token: eyJ0eXAiOi...
📤 Request headers: { "Content-Type": "application/json", "woocommerce-session": "Session eyJ0eXAiOi..." }
📥 Response status: 200
📥 Response data: { "data": { "checkout": { "order": { "id": "123", "orderNumber": "456" } } } }
✅ Order placement completed
```

**⏳ Long Processing:**
```
🛒 Placing order with session...
⏱️ Starting order placement...
🔄 This may take a few moments...
⏳ Still processing order...
⏳ Still processing order...
📥 Response status: 200
✅ Order placement completed
```

**❌ Timeout:**
```
🛒 Placing order with session...
⏱️ Starting order placement...
🔄 This may take a few moments...
⏳ Still processing order...
⏳ Still processing order...
⏳ Still processing order...
❌ Order placement timeout after 30 seconds
```

## 🎯 **Key Benefits:**

1. **✅ Timeout Protection** - Prevents hanging requests
2. **✅ Progress Feedback** - Shows request is being processed
3. **✅ Detailed Logging** - Shows exactly what's happening
4. **✅ Error Handling** - Catches timeout and network issues
5. **✅ Session Validation** - Ensures session is working

## 🧪 **Test Now:**

1. **Add items to cart**
2. **Go to checkout**
3. **Fill out form**
4. **Click "Place Order"**
5. **Watch console logs** - Should see progress indicators and detailed request/response info

This enhanced approach will show us exactly what's happening with the request and prevent hanging! 🚀
