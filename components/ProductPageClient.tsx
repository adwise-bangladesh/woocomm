'use client';

import { useState, useCallback, useMemo } from 'react';
import { Product, ProductVariation } from '@/lib/types';
import VariantSelector from './VariantSelector';
import ProductImageGallery from './ProductImageGallery';
import AddToCartButton from './AddToCartButton';
import AnimatedOrderButton from './AnimatedOrderButton';
import ShareButton from './ShareButton';
import { Phone, Star, Package, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePriceFormatter, useDiscountCalculator, logger } from '@/lib/utils/performance';
import { sanitizeHtml } from '@/lib/utils/sanitizer';

interface ProductPageClientProps {
  product: Product;
  discount: number | null;
  reviewStats: { rating: number; count: number };
}

export default function ProductPageClient({
  product,
  reviewStats,
}: ProductPageClientProps) {
  // Use memoized price formatter
  const formatPrice = usePriceFormatter();
  const calculateDiscount = useDiscountCalculator();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const isVariableProduct = product.type === 'VARIABLE';
  
  // Use variation data if available, otherwise use product data
  const currentProduct = selectedVariation || product;
  const currentPrice = currentProduct.salePrice || currentProduct.price || currentProduct.regularPrice;
  const currentRegularPrice = currentProduct.regularPrice;
  const currentSalePrice = currentProduct.salePrice;
  const currentStockStatus = currentProduct.stockStatus || 'OUT_OF_STOCK';

  // Memoize expensive calculations
  const stockInfo = useMemo(() => {
    const isInStock = currentStockStatus === 'IN_STOCK';
    const isBackordersAllowed = currentStockStatus === 'ON_BACKORDER';
    const isPreOrder = currentStockStatus === 'OUT_OF_STOCK';
    const canOrder = isInStock || isBackordersAllowed || isPreOrder; // Allow all three statuses
    
    return { isInStock, isBackordersAllowed, isPreOrder, canOrder };
  }, [currentStockStatus]);

  const { isInStock, isBackordersAllowed, isPreOrder, canOrder } = stockInfo;
  
  // Debug logging (development only)
  logger.debug('Stock status debug', {
    currentStockStatus,
    isInStock,
    isBackordersAllowed,
    canOrder,
    isVariableProduct,
    selectedVariation: selectedVariation?.databaseId,
    selectedAttributes,
    buttonDisabled: isVariableProduct && !selectedVariation
  });

  // Calculate discount for current variation/product (memoized)
  const displayDiscount = useMemo(() => {
    return calculateDiscount(currentSalePrice, currentRegularPrice);
  }, [calculateDiscount, currentSalePrice, currentRegularPrice]);

  const handleVariantChange = useCallback((variation: ProductVariation | null, attrs: Record<string, string>) => {
    logger.debug('handleVariantChange called', { variation: variation?.databaseId, attrs });
    setSelectedVariation(variation);
    setSelectedAttributes(attrs);
  }, []);

  // Get the product ID and variation ID for cart operations
  const productIdForCart = product.databaseId || 0;
  const variationIdForCart = isVariableProduct && selectedVariation 
    ? selectedVariation.databaseId 
    : undefined;

  // Get variation image if available
  const currentImage = selectedVariation?.image || product.image;

  return (
    <>
      <div className="container mx-auto px-2 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white sticky top-4">
              <ProductImageGallery
                mainImage={currentImage || { sourceUrl: '/placeholder.png', altText: product.name }}
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
                {product.name} {currentStockStatus === 'OUT_OF_STOCK' && <span className="text-red-600">(Pre-Order)</span>}
              </h1>

              {/* Reviews Count */}
              <div className="flex items-center gap-2 mb-2">
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
                <span className="text-xs text-gray-600">
                  {reviewStats.rating} ({reviewStats.count.toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(currentPrice)}
                  </span>
                  {currentSalePrice && currentRegularPrice && currentSalePrice !== currentRegularPrice && (
                    <>
                      <span className="text-base text-gray-400 line-through">
                        {formatPrice(currentRegularPrice)}
                      </span>
                      {displayDiscount && (
                        <span className="text-sm font-semibold text-white bg-red-600 px-2 py-0.5 rounded">
                          -{displayDiscount}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Variant Selector for Variable Products */}
              {isVariableProduct && (
                <div className="mb-4 pb-4 border-b">
                  <VariantSelector product={product} onVariantChange={handleVariantChange} />
                </div>
              )}

              {/* Short Description */}
              {product.shortDescription && (
                <div
                  className="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-200 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.shortDescription) }}
                />
              )}

              {/* Stock Status & Delivery */}
              <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  {isInStock ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-semibold">Stock Available</span>
                    </>
                  ) : isBackordersAllowed ? (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-600 font-semibold">Stock Available</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-semibold">Pre-Order Available</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${
                    isInStock ? 'text-green-600' : 
                    isBackordersAllowed ? 'text-orange-600' : 
                    'text-red-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isInStock ? 'text-green-600' : 
                    isBackordersAllowed ? 'text-orange-600' : 
                    'text-red-600'
                  }`}>
                    {isInStock ? 'Fast Delivery (1-3 days)' : 
                     isBackordersAllowed ? 'Regular Delivery (3-5 days)' : 
                     'Global Delivery (10-15 days)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mb-4">
                <AnimatedOrderButton
                  productId={productIdForCart}
                  variationId={variationIdForCart}
                  disabled={isVariableProduct && !selectedVariation}
                />
                <AddToCartButton
                  productId={productIdForCart}
                  variationId={variationIdForCart}
                  disabled={isVariableProduct && !selectedVariation}
                />
              </div>

              {/* Contact Options */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <a
                  href="tel:01926644575"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Call: 01926644575</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/8801926644575?text=Hi, I'm interested in ${encodeURIComponent(product.name)} (Product Code: ${product.databaseId || product.id})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>

                  <a
                    href="https://m.me/zonash.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.11C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
                    </svg>
                    <span className="text-sm font-medium">Messenger</span>
                  </a>
                </div>
              </div>

              {/* Courier Charges */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Delivery Charges</h3>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inside Dhaka:</span>
                    <span className="font-semibold text-gray-900">Tk 80</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outside Dhaka:</span>
                    <span className="font-semibold text-gray-900">Tk 130</span>
                  </div>
                </div>
              </div>

              {/* Product Code & Share */}
              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <span>
                  Product Code: <strong className="text-gray-900">{product.databaseId || product.id}</strong>
                </span>
                <ShareButton />
              </div>

              {/* Important Note */}
              <div
                onClick={() => setShowPolicyModal(true)}
                className="block mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <p className="text-xs text-orange-900 font-medium mb-1">⚠️ Important Note:</p>
                <p className="text-xs text-orange-800 leading-relaxed">
                  {isBackordersAllowed
                    ? '50% advance payment required. Delivery: 10-15 days. Imported products are non-refundable once ordered. Click for details.'
                    : 'Please ensure 100% certainty before ordering. Refusal to accept matching products will incur delivery charges. Click for details.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isBackordersAllowed ? 'Pre-Order Policy' : 'Return Policy'}
                </h3>
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              {isBackordersAllowed ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Payment:</strong> 50% or full advance payment required</p>
                  <p><strong>Delivery Time:</strong> 10-15 working days</p>
                  <p><strong>Product Source:</strong> Imported from China</p>
                  <p><strong>Cancellation:</strong> Orders cannot be cancelled once confirmed</p>
                  <p><strong>Returns:</strong> Pre-order products are non-refundable</p>
                  <p><strong>Quality:</strong> Products are checked before shipping</p>
                  <p className="text-orange-600 font-medium">
                    ⚠️ Please be 100% sure before placing a pre-order as these items cannot be returned or exchanged.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  <p><strong>Order Confirmation:</strong> Please ensure 100% certainty before ordering</p>
                  <p><strong>Delivery Charges:</strong> If you refuse to accept a matching product, you must pay delivery charges directly to the delivery person</p>
                  <p><strong>Return Process:</strong> Products must be returned immediately upon refusal</p>
                  <p><strong>Late Complaints:</strong> Returns/complaints after acceptance will not be entertained</p>
                  <p><strong>Order Responsibility:</strong> Avoid unnecessary orders as your details are tracked</p>
                  <p className="text-orange-600 font-medium">
                    ⚠️ Your mobile number, address, and device IP are visible to prevent fraudulent orders.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

