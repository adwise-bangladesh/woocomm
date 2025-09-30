import { graphqlClient } from '@/lib/graphql-client';
import { GET_PRODUCT_BY_SLUG } from '@/lib/queries';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/AddToCartButton';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductReviews from '@/components/ProductReviews';
import { notFound } from 'next/navigation';
import { Share2, Heart, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

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

  const isInStock = product.stockStatus === 'IN_STOCK';
  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-4 sticky top-4">
              <ProductImageGallery
                mainImage={product.image || { sourceUrl: '/placeholder.png', altText: product.name }}
                galleryImages={product.galleryImages}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            {/* Product Details Card */}
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                {product.salePrice ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-red-600">
                        {formatPrice(product.salePrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    </div>
                    {discount && (
                      <span className="inline-block bg-red-500 text-white px-3 py-1 text-sm font-bold rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price || product.regularPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isInStock ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-semibold">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Add to Cart */}
              <div className="mb-4">
                <AddToCartButton 
                  productId={product.databaseId || 0} 
                  disabled={!isInStock} 
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Wishlist</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Free Delivery on orders over Tk 500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <span>7 Days Return Policy</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>100% Authentic Product</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Reviews */}
        <div className="mt-6 bg-white rounded-lg p-6">
          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Reviews */}
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
