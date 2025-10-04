'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, MapPin, Phone, CreditCard, User } from 'lucide-react';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Get order details from URL params with validation
  const orderNumber = searchParams.get('orderNumber') || 'N/A';
  const orderId = searchParams.get('orderId') || 'N/A';
  const total = searchParams.get('total') || '0';
  const status = searchParams.get('status') || 'processing';
  
  // For backward compatibility, try to get old params with validation
  const customerName = searchParams.get('name') || 'Customer';
  const phone = searchParams.get('phone') || 'N/A';
  const address = searchParams.get('address') || 'N/A';
  const deliveryCharge = searchParams.get('delivery') || '0';
  const itemCount = searchParams.get('items') || '0';
  
  // Validate critical data
  const hasValidOrderData = orderNumber !== 'N/A' && total !== '0';
  const hasValidCustomerData = customerName !== 'Customer' && phone !== 'N/A' && address !== 'N/A';
  
  // Get ordered items from localStorage (stored during checkout)
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  
  // Memoize expensive calculations
  const calculatedSubtotal = useMemo(() => {
    return orderedItems.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0');
      return sum + itemTotal;
    }, 0);
  }, [orderedItems]);
  
  // Use calculated subtotal if available, otherwise use URL params
  const subtotal = useMemo(() => {
    return calculatedSubtotal > 0 ? calculatedSubtotal : (parseFloat(total?.replace(/[^0-9.-]+/g, '') || '0') - parseFloat(deliveryCharge?.replace(/[^0-9.-]+/g, '') || '0'));
  }, [calculatedSubtotal, total, deliveryCharge]);
  
  // Memoized function to get delivery time for an item with colors from original data
  const getDeliveryTimeForItem = useCallback((item: any) => {
    // Check if delivery time info is stored in the item
    if (item.deliveryTime) {
      return item.deliveryTime;
    }
    
    // Check if it's in metadata
    if (item.metaData) {
      const deliveryMeta = item.metaData.find((meta: any) => meta.key === 'delivery_time');
      if (deliveryMeta) {
        return deliveryMeta.value;
      }
    }
    
    // Fallback to stock status
    const variationStock = item.variation?.node?.stockStatus;
    const productStock = item.product?.node?.stockStatus;
    const stockStatus = variationStock || productStock || 'IN_STOCK';
    
    switch (stockStatus) {
      case 'FAST_DELIVERY':
      case 'IN_STOCK':
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
      case 'REGULAR_DELIVERY':
      case 'ON_BACKORDER':
        return { text: 'Regular Delivery (3-5 days)', color: 'text-blue-600' };
      case 'OUT_OF_STOCK':
        return { text: 'Out of Stock', color: 'text-red-600' };
      default:
        return { text: 'Fast Delivery (1-3 days)', color: 'text-green-600' };
    }
  }, []);
  
  useEffect(() => {
    // Try to get ordered items from multiple storage locations
    const loadItems = async () => {
      try {
        let storedItems = null;
        
        // Try localStorage first
        try {
          storedItems = localStorage.getItem('lastOrderItems');
        } catch (e) {
          // Try backup storage
          storedItems = localStorage.getItem('lastOrderBackup');
        }
        
        // Try sessionStorage if localStorage failed
        if (!storedItems) {
          try {
            storedItems = sessionStorage.getItem('lastOrderItems');
          } catch (e) {
            // Try memory fallback
            storedItems = (window as any).lastOrderItems ? JSON.stringify((window as any).lastOrderItems) : null;
          }
        }
        
        if (storedItems) {
          setOrderedItems(JSON.parse(storedItems));
        }
      } catch (error) {
        // Silently handle error - items will show fallback message
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    loadItems();
  }, [total, deliveryCharge, itemCount]);

  // Purchase event is tracked on checkout page when order is successfully placed
  // No need to track on thank you page

  useEffect(() => {
    // Play success sound (using a data URL for the sound)
    const playSuccessSound = () => {
      try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        // Silently handle audio failure
      }
    };

    playSuccessSound();

    // Show animation
    setTimeout(() => setShowAnimation(true), 100);
    
    // Mobile-specific optimizations
    if (typeof window !== 'undefined') {
      // Prevent zoom on mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" role="main" aria-label="Order confirmation page">
      <div className="max-w-2xl mx-auto">
        {/* Order Details Card */}
        <div className="bg-white rounded-[5px] p-6 shadow-sm mb-4" role="region" aria-label="Order details">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="text-xl font-bold text-gray-900" id="order-number">#{orderNumber}</p>
              </div>
              <div className={`px-4 py-2 rounded-[5px] text-sm font-semibold ${
                status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                status === 'completed' ? 'bg-green-100 text-green-700' :
                status === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {status === 'processing' ? 'Processing' : 
                 status === 'completed' ? 'Completed' : 
                 status === 'confirmed' ? 'Confirmed' :
                 'Pending'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Customer Name</p>
                <p className="text-sm font-medium text-gray-900">{customerName}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-sm font-medium text-gray-900">{phone}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="text-sm font-medium text-gray-900">{address}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex items-start gap-3">
              <Package className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Order Summary</p>
                <p className="text-sm font-medium text-gray-900">{itemCount} {itemCount === '1' ? 'item' : 'items'}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="bg-white rounded-[5px] p-6 shadow-sm mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ordered Items</h3>
          {isLoadingItems ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading items...</p>
            </div>
          ) : orderedItems.length > 0 ? (
            <div className="space-y-3">
              {orderedItems.map((item, index) => (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-[5px]">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-[5px] flex items-center justify-center flex-shrink-0">
                    {item.product?.node?.image?.sourceUrl ? (
                      <img 
                        src={item.product.node.image.sourceUrl} 
                        alt={item.product.node.name}
                        className="w-full h-full object-cover rounded-[5px]"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    {/* First line: Attributes only */}
                    <div className="mb-1">
                      <div className="flex items-center gap-1">
                        {/* Attributes */}
                        {(() => {
                          let attributes = [];
                          
                          // Try multiple attribute locations
                          if (item.variation?.node?.attributes?.nodes) {
                            attributes = item.variation.node.attributes.nodes;
                          } else if (item.variation?.node?.attributes) {
                            attributes = item.variation.node.attributes;
                          } else if (item.variation?.node?.metaData) {
                            attributes = item.variation.node.metaData.filter((meta: any) => 
                              meta.key && (meta.key.includes('attribute') || meta.key.includes('pa_'))
                            );
                          }
                          
                          if (attributes && attributes.length > 0) {
                            return attributes.map((attr: any, attrIndex: number) => (
                              <span key={attrIndex} className="text-xs text-gray-600">
                                {attrIndex > 0 && ', '}
                                {attr.value || attr.name}
                              </span>
                            ));
                          }
                          
                          // Fallback: show variation name if different
                          if (item.variation?.node?.name && item.variation.node.name !== item.product?.node?.name) {
                            return <span className="text-xs  text-gray-900">{item.variation.node.name}</span>;
                          }
                          
                            return <span className="text-xs text-gray-600">No attributes</span>;
                        })()}
                      </div>
                    </div>
                    
                    {/* Second line: Qty and Price */}
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-xs font-semibold text-gray-900">Tk {parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0').toFixed(0)}</span>
                    </div>
                    
                    {/* Third line: Delivery time */}
                    <p className={`text-xs font-medium ${getDeliveryTimeForItem(item).color}`}>
                      {getDeliveryTimeForItem(item).text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Item details not available</p>
              <p className="text-xs text-gray-400">Total items: {itemCount}</p>
              {!hasValidOrderData && (
                <p className="text-xs text-red-500 mt-2">⚠️ Order data may be incomplete</p>
              )}
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-[5px] p-6 shadow-sm mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">Tk {subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="font-medium text-gray-900">Tk {parseFloat(deliveryCharge?.replace(/[^0-9.-]+/g, '') || '0').toFixed(0)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-base font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-red-600">Tk {(subtotal + parseFloat(deliveryCharge?.replace(/[^0-9.-]+/g, '') || '0')).toFixed(0)}</span>
            </div>
          </div>
        </div>


        {/* Order Number Reminder */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
           Thank you for your purchase
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <ThankYouContent />
    </Suspense>
  );
}

