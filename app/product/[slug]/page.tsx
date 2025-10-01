import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCT_BY_SLUG, GET_PRODUCTS } from '@/lib/queries';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/AddToCartButton';
import AnimatedOrderButton from '@/components/AnimatedOrderButton';
import ShareButton from '@/components/ShareButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductReviews from '@/components/ProductReviews';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { notFound } from 'next/navigation';
import { Phone, Star, Package, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 300; // ISR: Revalidate every 5 minutes

async function getProduct(slug: string) {
  try {
    const data = await graphqlClient.request(GET_PRODUCT_BY_SLUG, { slug }) as { product: Product };
    return data.product as Product;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching product:', error);
    }
    return null;
  }
}

async function getRelatedProducts() {
  try {
    const data = await graphqlClient.request(GET_PRODUCTS, { first: 30, after: null }) as {
      products: {
        nodes: Product[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
    return {
      products: data.products?.nodes || [],
      pageInfo: data.products?.pageInfo || { hasNextPage: false, endCursor: null },
    };
  } catch (error) {
    return {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, relatedData] = await Promise.all([
    getProduct(slug),
    getRelatedProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const calculateDiscount = () => {
    if (!product.salePrice || !product.regularPrice) return null;
    const regular = parseFloat(product.regularPrice.replace(/[^0-9.-]+/g, ''));
    const sale = parseFloat(product.salePrice.replace(/[^0-9.-]+/g, ''));
    return Math.round(((regular - sale) / regular) * 100);
  };

  // Allow orders for IN_STOCK and ON_BACKORDER products
  const isInStock = product.stockStatus === 'IN_STOCK';
  const isBackordersAllowed = product.stockStatus === 'ON_BACKORDER';
  const canOrder = isInStock || isBackordersAllowed;
  const discount = calculateDiscount();
  
  // Calculate expected delivery date (3-5 days from now)
  const expectedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Generate random review stats
  const generateReviewStats = () => {
    const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
    const count = 700 + (productIdHash % 1800);
    return { rating, count };
  };

  const reviewStats = generateReviewStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white sticky top-4">
              <ProductImageGallery
                mainImage={product.image || { sourceUrl: '/placeholder.png', altText: product.name }}
                galleryImages={product.galleryImages}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-2">
            {/* Product Details Card */}
            <div className="bg-white rounded-[5px] p-3 sticky top-4">
              {/* Title */}
              <h1 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">
                {product.name}
              </h1>

              {/* Reviews Count */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(reviewStats.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">{reviewStats.rating}</span>
                <span className="text-xs text-gray-500">({reviewStats.count.toLocaleString()} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-3">
                {product.salePrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-base text-gray-500 line-through">
                      {formatPrice(product.regularPrice)}
                    </span>
                    {discount && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-semibold">
                        -{discount}%
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(product.price || product.regularPrice)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <div 
                  className="text-sm text-gray-600 mb-2 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              )}

              {/* Order Now Button with Animation */}
              <div className="mb-2">
                <AnimatedOrderButton 
                  productId={product.databaseId || 0} 
                  disabled={!canOrder} 
                />
              </div>

              {/* Add to Cart */}
              <div className="mb-3">
                <AddToCartButton 
                  productId={product.databaseId || 0} 
                  disabled={!canOrder} 
                />
              </div>

              {/* Call, WhatsApp & Messenger Buttons */}
              <a
                href="tel:01926644575"
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-[5px] font-semibold hover:bg-green-700 transition-colors mb-2"
              >
                <Phone className="w-4 h-4" />
                Call 01926644575
              </a>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <a
                  href="https://wa.me/8801926644575"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-[5px] font-semibold hover:bg-[#20BD5A] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="https://m.me/YOUR_PAGE_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0084FF] text-white rounded-[5px] font-semibold hover:bg-[#0073E6] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                  </svg>
                  Messenger
                </a>
              </div>

              {/* Courier Charge Table */}
              <div className="mb-3 p-3 bg-gray-50 rounded-[5px]">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Charges</h3>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Inside Dhaka:</span>
                    <span className="font-semibold">Tk 80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outside Dhaka:</span>
                    <span className="font-semibold">Tk 130</span>
                  </div>
                  <div className="flex justify-between text-teal-600">
                    <span>Free Delivery:</span>
                    <span className="font-semibold">Orders over Tk 1,000</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-[5px]">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Product color & design may vary slightly due to photographic lighting or your device settings.
                </p>
              </div>

              {/* Product Code & Share */}
              <div className="flex items-center justify-between text-xs text-gray-600 mb-3 pb-3 border-b">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>Code: <strong>{product.databaseId || 'N/A'}</strong></span>
                </div>
                <ShareButton productId={product.databaseId || 0} />
              </div>

              {/* Stock Status & Delivery */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {isInStock ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-semibold">In Stock</span>
                    </>
                  ) : isBackordersAllowed ? (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-600 font-semibold">Pre-Order (Imported from China)</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-semibold">Out of Stock</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-xs">
                    Delivery: <strong>{isInStock ? '1-3 days' : '10-15 days'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mt-4 bg-white rounded-[5px] p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Product Description</h2>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Related Products */}
        <div className="mt-6">
          <InfiniteProductGrid
            initialProducts={relatedData.products}
            initialEndCursor={relatedData.pageInfo.endCursor}
            initialHasNextPage={relatedData.pageInfo.hasNextPage}
          />
        </div>
      </div>
    </div>
  );
}
