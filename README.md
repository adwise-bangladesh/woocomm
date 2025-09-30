# Zonash Shop - Fast E-commerce Frontend

Modern, blazing-fast e-commerce frontend built with Next.js 14, WPGraphQL, and WooCommerce.

## 🚀 Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **WPGraphQL + WooGraphQL** for backend integration
- **Zustand** for state management
- **graphql-request** for GraphQL client
- **Lucide React** for icons

## 📦 Features

- ✅ Homepage with product grid (ISR - 60s revalidation)
- ✅ Individual product pages for simple & variable products (ISR)
- ✅ Shopping cart with persistent storage (localStorage)
- ✅ Checkout flow with order placement
- ✅ Responsive design (mobile + desktop)
- ✅ Session-based cart management
- ✅ Real-time cart updates
- ✅ Optimized images with Next.js Image

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Create .env.local with your GraphQL endpoint
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://backend.zonash.com/graphql
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
woocommerce-frontend/
├── app/
│   ├── page.tsx              # Homepage (product grid)
│   ├── product/[slug]/       # Product detail pages
│   ├── cart/                 # Shopping cart
│   ├── checkout/             # Checkout page
│   └── layout.tsx            # Root layout
├── components/
│   ├── Header.tsx            # Main navigation
│   ├── ProductCard.tsx       # Product card component
│   └── AddToCartButton.tsx   # Add to cart functionality
├── lib/
│   ├── graphql-client.ts     # GraphQL client setup
│   ├── queries.ts            # GraphQL queries
│   ├── mutations.ts          # GraphQL mutations
│   ├── store.ts              # Zustand store
│   └── types.ts              # TypeScript types
└── public/                   # Static assets
```

## 🎯 Performance Optimizations

- **ISR (Incremental Static Regeneration)** for product pages
- **Image optimization** with Next.js Image component
- **Persistent cart state** with localStorage
- **Minimal JavaScript bundle** with server components
- **Zustand** for lightweight state management

## 🔧 GraphQL Queries & Mutations

### Queries
- `GET_PRODUCTS` - Fetch products with pagination
- `GET_PRODUCT_BY_SLUG` - Fetch single product details
- `GET_CART` - Fetch current cart contents
- `GET_CUSTOMER` - Fetch customer data

### Mutations
- `ADD_TO_CART` - Add items to cart
- `REMOVE_FROM_CART` - Remove items from cart
- `UPDATE_CART_ITEM` - Update item quantities
- `CHECKOUT` - Complete order placement

## 📱 Pages

### Homepage (`/`)
- Displays all products in a responsive grid
- ISR with 60-second revalidation
- Clickable product cards

### Product Page (`/product/[slug]`)
- Product images and gallery
- Price and stock status
- Add to cart functionality
- Support for simple and variable products
- ISR with 60-second revalidation

### Cart Page (`/cart`)
- View all cart items
- Update quantities
- Remove items
- Proceed to checkout
- Client-side rendered for real-time updates

### Checkout Page (`/checkout`)
- Billing address form
- Order summary
- Payment method selection (COD)
- Order placement

## 🔐 Session Management

The app uses WooCommerce session tokens to maintain cart state across requests. Session tokens are:
- Stored in Zustand store
- Persisted in localStorage
- Sent with every cart mutation

## 🚀 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🎨 Customization

### Styling
Edit Tailwind classes in components or modify `tailwind.config.js`

### GraphQL Endpoint
Update `.env.local` with your WooCommerce GraphQL endpoint

### Revalidation Time
Change `revalidate` value in page components (default: 60 seconds)

## 📝 License

This project is built for demonstration purposes.

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [WPGraphQL](https://www.wpgraphql.com/)
- [WooGraphQL](https://woographql.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)