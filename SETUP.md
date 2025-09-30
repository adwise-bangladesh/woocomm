# Setup Instructions

## ✅ Project Successfully Created!

Your super-fast e-commerce frontend is ready! Here's what was built:

## 🏗️ Architecture

### Performance Strategy
- **ISR (Incremental Static Regeneration)** for Homepage & Product Pages (60s revalidation)
- **Client-side rendering** for Cart & Checkout (real-time updates)
- **Persistent cart** with localStorage + Zustand
- **Session-based** cart management with WooCommerce sessions
- **Optimized images** with Next.js Image component

### Tech Stack
- ✅ **Next.js 14** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for minimal, fast styling
- ✅ **Zustand** for lightweight state management
- ✅ **graphql-request** for GraphQL client
- ✅ **WPGraphQL + WooGraphQL** integration
- ✅ **Lucide React** for icons

## 📁 Project Structure

```
woocommerce-frontend/
├── app/
│   ├── page.tsx                    # Homepage - Product Grid (ISR)
│   ├── product/[slug]/page.tsx     # Product Details (ISR)
│   ├── cart/page.tsx               # Shopping Cart (Client)
│   ├── checkout/page.tsx           # Checkout (Client)
│   ├── layout.tsx                  # Root Layout with Header
│   └── not-found.tsx               # 404 Page
│
├── components/
│   ├── Header.tsx                  # Navigation with cart count
│   ├── ProductCard.tsx             # Product grid item
│   └── AddToCartButton.tsx         # Add to cart with mutations
│
├── lib/
│   ├── graphql-client.ts           # GraphQL client config
│   ├── queries.ts                  # All GraphQL queries
│   ├── mutations.ts                # All GraphQL mutations
│   ├── store.ts                    # Zustand cart store
│   └── types.ts                    # TypeScript interfaces
│
└── public/
    └── placeholder.png             # Fallback image
```

## 🚀 Getting Started

1. **Development Server**
```bash
cd woocommerce-frontend
npm run dev
```

2. **Open Browser**
- Visit: http://localhost:3000

3. **Build for Production**
```bash
npm run build
npm start
```

## 🎯 Features Implemented

### ✅ Homepage (`/`)
- Responsive product grid (1-4 columns based on screen size)
- Product images with lazy loading
- Price display with sale prices
- Stock status indicators
- ISR with 60-second revalidation

### ✅ Product Page (`/product/[slug]`)
- Product gallery with main image
- Full product details & description
- Price display with sale badges
- Stock status
- **Simple Products**: Direct add to cart
- **Variable Products**: Show all variations with individual add-to-cart buttons
- Variation attributes display
- ISR with 60-second revalidation

### ✅ Cart Page (`/cart`)
- View all cart items with images
- Update quantities (+/-)
- Remove items
- Real-time total calculation
- Persistent cart (localStorage)
- Session-based cart sync with backend

### ✅ Checkout Page (`/checkout`)
- Billing address form (all fields)
- Order summary sidebar
- Payment method selection (COD)
- Form validation
- Order placement with WooCommerce
- Success notification with order number

### ✅ Design
- Clean, minimal design
- Fully responsive (mobile + desktop)
- Smooth transitions and hover effects
- Loading states
- Error handling
- Empty state messages

## 🔧 Configuration

### GraphQL Endpoint
Located in `.env.local`:
```
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
```

### Image Optimization
Configured in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'backend.zonash.com',
      pathname: '/**',
    },
  ],
}
```

### ISR Revalidation
To change revalidation time, edit in page files:
```typescript
export const revalidate = 60; // seconds
```

## 📊 GraphQL Operations

### Queries
- `GET_PRODUCTS` - Homepage product list
- `GET_PRODUCT_BY_SLUG` - Single product details
- `GET_CART` - Current cart contents
- `GET_CUSTOMER` - Customer billing/shipping

### Mutations
- `ADD_TO_CART` - Add product to cart
- `REMOVE_FROM_CART` - Remove items from cart
- `UPDATE_CART_ITEM` - Update item quantities
- `CHECKOUT` - Complete order

## 🎨 Customization

### Colors
Edit Tailwind classes in components:
- Primary: `blue-600`
- Sale/Error: `red-600`
- Success: `green-600`

### Typography
Using Inter font (from next/font/google)

### Layout
- Container: `container mx-auto px-4`
- Max width: Tailwind default
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`

## 🔐 Session Management

The app handles WooCommerce sessions:
1. Cart mutations return session tokens
2. Tokens stored in Zustand + localStorage
3. Tokens sent with subsequent requests
4. Cart persists across page reloads

## ⚡ Performance Tips

1. **Images**: All product images optimized with Next.js Image
2. **ISR**: Product pages cached and revalidated every 60s
3. **Code Splitting**: Automatic with App Router
4. **Client Components**: Only where needed (cart, checkout)
5. **Server Components**: Default for better performance

## 🐛 Troubleshooting

### Products not showing?
- Check GraphQL endpoint in `.env.local`
- Verify WooGraphQL plugin is active
- Check browser console for errors

### Cart not working?
- Clear localStorage: `localStorage.clear()`
- Check WooCommerce session settings
- Verify mutations in Network tab

### Images not loading?
- Check `next.config.ts` remote patterns
- Verify image URLs from backend
- Check browser console for errors

## 📝 Next Steps

1. **Styling**: Customize colors, fonts, and layouts
2. **Features**: Add product search, filters, categories
3. **Auth**: Add user login/registration
4. **Payment**: Integrate payment gateways
5. **SEO**: Add metadata, schema markup
6. **Analytics**: Add Google Analytics, tracking
7. **Reviews**: Add product reviews
8. **Wishlist**: Add wishlist functionality

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
Works on any platform supporting Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Docker

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [WPGraphQL Docs](https://www.wpgraphql.com/docs)
- [WooGraphQL Docs](https://woographql.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Built with ❤️ using Next.js, WPGraphQL, and WooCommerce**
