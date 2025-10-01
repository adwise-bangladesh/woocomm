# Google Maps API Setup for Address Verification

## Overview
The checkout page uses Google Maps Geocoding API to verify customer addresses and automatically determine delivery charges (Inside Dhaka: Tk 80, Outside Dhaka: Tk 130).

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Geocoding API"
   - Click **Enable**
4. Create API credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **API Key**
   - Copy the generated API key

### 2. Configure API Key Restrictions (Important for Security)

1. Click on your API key to edit it
2. Under **Application restrictions**:
   - Select **HTTP referrers (websites)**
   - Add your domains:
     ```
     localhost:3000/*
     your-domain.com/*
     ```
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose only **Geocoding API**
4. Save changes

### 3. Add API Key to Your Project

Create a `.env.local` file in the `woocommerce-frontend` directory:

```env
# WooCommerce Backend
NEXT_PUBLIC_GRAPHQL_URL=https://backend.zonash.com/graphql

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

**Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

### 4. Restart Development Server

```bash
npm run dev
```

## How It Works

1. Customer enters their complete address
2. Customer clicks "Verify Address" button
3. System sends address to Google Maps Geocoding API
4. API returns location details including city/district
5. System checks if location is in Dhaka
6. Delivery charge is automatically set:
   - **Inside Dhaka:** Tk 80
   - **Outside Dhaka:** Tk 130

## API Usage & Costs

- **Free Tier:** $200 credit per month (approximately 40,000 requests)
- **Cost per request:** $0.005 (after free tier)
- **Typical usage:** ~1-2 requests per order

## Troubleshooting

### API Key Not Working
- Check if Geocoding API is enabled
- Verify API key restrictions allow your domain
- Check browser console for error messages

### Address Not Verified
- Ensure address is detailed (minimum 10 characters)
- Include area, city, and district
- Example: "123 Road 5, Gulshan, Dhaka"

### Rate Limiting
- If you exceed free tier, you'll be billed
- Consider implementing caching for repeated addresses
- Set up billing alerts in Google Cloud Console

## Alternative: Manual Selection (Fallback)

If Google Maps API is not available or fails, the system will:
1. Default to "Outside Dhaka" charge (Tk 130)
2. Admin can manually verify and adjust charges
3. Consider implementing a manual district selection dropdown as backup

## Security Best Practices

1. ✅ Use API key restrictions (domains + API types)
2. ✅ Never expose API key in client-side code (using NEXT_PUBLIC_ for client access is necessary but restricted)
3. ✅ Monitor API usage in Google Cloud Console
4. ✅ Set up billing alerts
5. ✅ Rotate API keys periodically

