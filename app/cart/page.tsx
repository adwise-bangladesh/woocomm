'use client';

import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, Product } from '@/lib/types';
import { createSessionClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

const GET_HOMEPAGE_PRODUCTS = gql`
  query GetHomepageProducts($first: Int!) {
    products(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        featured
        image {
          sourceUrl
          altText
        }
        ... on ProductWithPricing {
          price
          regularPrice
          salePrice
        }
        ... on InventoriedProduct {
          stockStatus
        }
      }
    }
  }
`;

export default function CartPage() {
  const { items, isEmpty, clearCart, setCart } = useCartStore();
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [homepageProducts, setHomepageProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; endCursor: string | null }>({
    hasNextPage: false,
    endCursor: null
  });
  
  // Facebook Pixel tracking
  const { trackCustom, trackCheckout } = useFacebookPixel();

  // Sync localItems with items from store
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Track ViewCart event when cart page loads with items
  useEffect(() => {
    if (localItems.length > 0) {
      const cartValue = localItems.reduce((sum, item) => {
        return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
      }, 0);
      
      const cartData = {
        content_ids: localItems.map(item => item.product.node.databaseId?.toString() || item.product.node.id),
        content_type: 'product',
        contents: localItems.map(item => ({
          id: item.product.node.databaseId?.toString() || item.product.node.id,
          quantity: item.quantity,
          item_price: parseFloat(item.total.replace(/[^0-9.-]+/g, '')) / item.quantity
        })),
        currency: 'BDT',
        value: cartValue,
        num_items: localItems.length
      };
      
      trackCustom('ViewCart', cartData);
      console.log('Facebook Pixel: ViewCart tracked with', localItems.length, 'items, value:', cartValue);
    }
  }, [localItems, trackCustom]);

  // Initial load - ensure we have the latest cart
  useEffect(() => {
    if (items.length > 0 && localItems.length === 0) {
      setLocalItems(items);
    }
  }, [items, localItems.length]);

  // Fetch homepage products when cart is empty
  useEffect(() => {
    const fetchHomepageProducts = async () => {
      if (isEmpty || items.length === 0) {
        setIsLoadingProducts(true);
        try {
          const client = createSessionClient();
          const data = await client.request(GET_HOMEPAGE_PRODUCTS, { first: 20 }) as { products: { nodes: Product[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };
          setHomepageProducts(data.products?.nodes || []);
          setPageInfo(data.products?.pageInfo || { hasNextPage: false, endCursor: null });
        } catch (error) {
          console.error('Error fetching homepage products:', error);
          setHomepageProducts([]);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };

    fetchHomepageProducts();
  }, [isEmpty, items.length]);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };


  const getDeliveryTime = (stockStatus?: string) => {
    if (!stockStatus) return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
    
    // Support both old and new stock status formats
    switch (stockStatus) {
      case 'FAST_DELIVERY':
      case 'IN_STOCK':
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
      case 'REGULAR_DELIVERY':
      case 'ON_BACKORDER':
        return { text: 'Regular Delivery (3-5 days)', color: 'text-orange-600' };
      case 'GLOBAL_DELIVERY':
      case 'OUT_OF_STOCK':
        return { text: 'Global Delivery (10-15 days)', color: 'text-red-600' };
      default:
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
    }
  };

  const updateQuantity = (itemKey: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = localItems.map(item => {
      if (item.key === itemKey) {
        const pricePerUnit = parseFloat(item.total.replace(/[^0-9.-]+/g, '')) / item.quantity;
        const newTotal = (pricePerUnit * newQuantity).toFixed(2);
        return {
          ...item,
          quantity: newQuantity,
          total: `${newTotal}৳ `,
        };
      }
      return item;
    });
    
    setLocalItems(updatedItems);
    
    // Update cart in store
    const newSubtotal = updatedItems.reduce((sum, item) => {
      return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
    }, 0);
    
    setCart({
      contents: { nodes: updatedItems },
      subtotal: `${newSubtotal.toFixed(2)}৳ `,
      total: `${newSubtotal.toFixed(2)}৳ `,
      isEmpty: false,
    });
  };

  const removeItem = (itemKey: string) => {
    const updatedItems = localItems.filter(item => item.key !== itemKey);
    setLocalItems(updatedItems);
    
    if (updatedItems.length === 0) {
      clearCart();
    } else {
      const newSubtotal = updatedItems.reduce((sum, item) => {
        return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
      }, 0);
      
      setCart({
        contents: { nodes: updatedItems },
        subtotal: `${newSubtotal.toFixed(2)}৳ `,
        total: `${newSubtotal.toFixed(2)}৳ `,
        isEmpty: false,
      });
    }
  };

  if (isEmpty || items.length === 0 || localItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Empty Cart Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-10">
            <div className="text-center max-w-xl mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" style={{ color: '#fe6c06' }} strokeWidth={1.5} />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
              <p className="text-sm text-gray-600 mb-6">Discover amazing products and start building your perfect cart!</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors shadow-lg"
                style={{ backgroundColor: '#fe6c06' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
              >
                <ShoppingBag className="w-4 h-4" />
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Products for You Section */}
        <div className="container mx-auto py-4">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[5px] gap-y-[4px] lg:gap-x-4 lg:gap-y-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-white overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-1 space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded" />
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-20" />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-3 h-3 bg-gray-200 animate-pulse rounded" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : homepageProducts.length > 0 ? (
            <InfiniteProductGrid
              initialProducts={homepageProducts}
              initialEndCursor={pageInfo.endCursor}
              initialHasNextPage={pageInfo.hasNextPage}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-4">Unable to load products. Please try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const subtotal = localItems.reduce((sum, item) => sum + parseFloat(item.total.replace(/[^0-9.-]+/g, '')), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:container lg:mx-auto px-2 py-2 lg:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[5px] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Items</h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {localItems.length} {localItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-3">
                  {localItems.map((item: CartItem) => {
                    const variationStock = item.variation?.node?.stockStatus;
                    const productStock = item.product?.node?.stockStatus;
                    const stockStatus = variationStock || productStock || 'IN_STOCK';
                    const deliveryInfo = getDeliveryTime(stockStatus);
                    
                    return (
                      <div key={item.key} className="pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex gap-3">
                          {/* Product Image with Border */}
                          <Link href={`/product/${item.product.node.slug}`}>
                            <div className="w-20 h-20 border-[3px] border-gray-200 rounded-[5px] overflow-hidden flex-shrink-0 cursor-pointer hover:border-teal-500 transition-colors">
                              <Image
                                src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                                alt={item.product.node.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            {/* Product Title & Delete Button */}
                            <div className="flex items-start justify-between mb-2">
                              <Link href={`/product/${item.product.node.slug}`}>
                                <div className="flex-1 pr-2">
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-teal-600 cursor-pointer">
                                    {item.product.node.name}
                                  </h4>
                                  {item.variation?.node?.name && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {(() => {
                                        const variationText = item.variation.node.name.replace(item.product.node.name + ' - ', '');
                                        const attributes = variationText.split(', ');
                                        
                                        // If we have exactly 2 attributes, assume they are Size and Color
                                        if (attributes.length === 2) {
                                          return `Size: ${attributes[0]} | Color: ${attributes[1]}`;
                                        }
                                        // Otherwise, try to detect attribute names from the variation data
                                        return variationText;
                                      })()}
                                    </p>
                                  )}
                                </div>
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeItem(item.key)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded-[5px] transition-colors flex-shrink-0"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Delivery Time Badge */}
                            <div className="flex items-center gap-1 mb-3">
                              <Clock className={`w-3 h-3 ${deliveryInfo.color}`} />
                              <span className={`text-xs ${deliveryInfo.color} font-medium`}>{deliveryInfo.text}</span>
                            </div>
                            
                            {/* Quantity Controls & Price */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-gray-100 rounded-full p-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                  <Minus className="w-4 h-4 text-gray-700" />
                                </button>
                                <span className="text-sm font-bold text-gray-900 w-10 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                                >
                                  <Plus className="w-4 h-4 text-gray-700" />
                                </button>
                              </div>
                              
                              <span className="text-base font-bold text-red-600">{formatPrice(item.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary - Sticky on Desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[5px] p-4 shadow-sm lg:sticky lg:top-4">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal ({localItems.length} items)</span>
                    <span className="font-medium text-gray-900">Tk {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Delivery</span>
                    <span className="text-xs text-gray-500">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold mb-4">
                  <span className="text-gray-900">Total</span>
                  <span className="text-red-600">Tk {subtotal.toFixed(0)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded-[5px] text-base font-bold transition-colors shadow-sm"
                  style={{ backgroundColor: '#fe6c06' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
                  onClick={() => {
                    // Track InitiateCheckout event
                    const cartValue = localItems.reduce((sum, item) => {
                      return sum + parseFloat(item.total.replace(/[^0-9.-]+/g, ''));
                    }, 0);
                    
                    const checkoutData = {
                      content_ids: localItems.map(item => item.product.node.databaseId?.toString() || item.product.node.id),
                      content_type: 'product',
                      contents: localItems.map(item => ({
                        id: item.product.node.databaseId?.toString() || item.product.node.id,
                        quantity: item.quantity,
                        item_price: parseFloat(item.total.replace(/[^0-9.-]+/g, '')) / item.quantity
                      })),
                      currency: 'BDT',
                      value: cartValue,
                      num_items: localItems.length
                    };
                    
                    trackCheckout(localItems, cartValue);
                    console.log('Facebook Pixel: InitiateCheckout tracked with', localItems.length, 'items, value:', cartValue);
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="block text-center text-sm text-gray-600 hover:text-orange-600 mt-3 font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
