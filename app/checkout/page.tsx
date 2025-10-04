'use client';

import { useCartStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, Clock, Plus, Minus, Trash2, AlertTriangle, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { verifyCustomerHistory } from '@/lib/utils/courierVerification';
import { graphqlClient, fetchWithSession } from '@/lib/graphql-client';
import { PLACE_ORDER, CREATE_CUSTOMER_SESSION, ADD_TO_CART_SIMPLE } from '@/lib/mutations';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';
import { facebookPixelDataCollector } from '@/lib/facebook-pixel-data-collector';
import { facebookEventBatcher } from '@/lib/facebook-event-batcher';
import { facebookAudienceManager } from '@/lib/facebook-audience-manager';
import { facebookCustomEvents } from '@/lib/facebook-custom-events';

export default function CheckoutPage() {
  const { items, isEmpty, clearCart, setCart } = useCartStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'processing' | 'placing_order' | 'success' | 'error'>('idle');
  const [localItems, setLocalItems] = useState(items);
  const { trackCheckout, trackOrder, trackCustom, trackViewCheckout } = useFacebookPixel();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    deliveryZone: 'outside', // Default to outside Dhaka
    paymentMethod: 'cod',
  });
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ allowed: boolean; reason: string } | null>(null);
  
  // Rate limiting state
  const [submitAttempts, setSubmitAttempts] = useState<number[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Load saved customer info from localStorage on mount
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo);
        setFormData((prev) => ({
          ...prev,
          fullName: parsedInfo.fullName || '',
          phone: parsedInfo.phone || '',
          address: parsedInfo.address || '',
          deliveryZone: parsedInfo.deliveryZone || 'outside',
        }));
      } catch (error) {
        console.error('Error loading saved customer info:', error);
      }
    }
    setIsFormLoaded(true);
    
    // Mobile-specific optimizations
    if (typeof window !== 'undefined') {
      // Prevent zoom on input focus for mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }, []);


  // Sync localItems with items from store
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Track InitiateCheckout event when checkout page loads (user starts checkout process)
  useEffect(() => {
    if (localItems.length > 0) {
      const totalValue = localItems.reduce((sum, item) => {
        const itemTotal = parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0');
        return sum + itemTotal;
      }, 0);
      
      // Track InitiateCheckout event when user starts checkout process
      trackCheckout(localItems, totalValue);
      console.log('Facebook Pixel: InitiateCheckout tracked with', localItems.length, 'items, value:', totalValue);
    }
  }, [localItems, trackCheckout]);

  // Smart verification system - instant for autofill, debounced for manual typing
  useEffect(() => {
    // Skip verification on initial load when form is being populated from localStorage
    if (!isFormLoaded) return;

    const verifyPhone = async () => {
      const phoneError = validatePhone(formData.phone);
      
      // Only verify if phone is valid
      if (!phoneError && formData.phone) {
        const formattedPhone = formatPhoneNumber(formData.phone);
        
        try {
          const result = await verifyCustomerHistory(formattedPhone);
          setVerificationResult(result);
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationResult({ allowed: true, reason: 'Verification unavailable' });
        }
      } else {
        setVerificationResult(null);
      }
    };

    // Smart verification logic
    const phoneLength = formData.phone.length;
    
    // Instant verification for complete phone numbers (likely autofill)
    if (phoneLength === 11 && validatePhone(formData.phone) === '') {
        verifyPhone();
      return;
    }
    
    // For partial numbers, use shorter debounce for better UX
    if (phoneLength >= 10) {
      const debounceTime = phoneLength === 10 ? 500 : 1000; // Faster for almost complete numbers
      const timeoutId = setTimeout(() => {
        verifyPhone();
      }, debounceTime);

    return () => clearTimeout(timeoutId);
    } else {
      // Clear verification for incomplete numbers
      setVerificationResult(null);
    }
  }, [formData.phone, isFormLoaded]);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const validateName = (name: string) => {
    if (!name || name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }
    if (name.length > 100) {
      return 'Name is too long (max 100 characters)';
    }
    // Basic XSS prevention
    if (/<script|javascript:|data:|vbscript:/i.test(name)) {
      return 'Invalid characters in name';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Remove leading +88 or 88 if present
    let cleanedDigits = digits;
    if (digits.startsWith('88')) {
      cleanedDigits = digits.substring(2);
    }
    
    // Add leading 0 if starts with 1
    if (cleanedDigits.startsWith('1') && cleanedDigits.length === 10) {
      cleanedDigits = '0' + cleanedDigits;
    }
    
    // Check if it's a valid BD number (starts with 01 and 11 digits total)
    if (cleanedDigits.length !== 11 || !cleanedDigits.startsWith('01')) {
      return 'Invalid Bangladesh phone number';
    }
    
    return '';
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Remove leading +88 or 88 if present
    let cleanedDigits = digits;
    if (digits.startsWith('88')) {
      cleanedDigits = digits.substring(2);
    }
    
    // Ensure it starts with 0
    if (cleanedDigits.startsWith('1') && cleanedDigits.length === 10) {
      cleanedDigits = '0' + cleanedDigits;
    }
    
    return cleanedDigits;
  };

  const validateAddress = (address: string) => {
    if (!address || address.trim().length < 10) {
      return 'Please enter your complete address';
    }
    if (address.length > 500) {
      return 'Address is too long (max 500 characters)';
    }
    // Basic XSS prevention
    if (/<script|javascript:|data:|vbscript:/i.test(address)) {
      return 'Invalid characters in address';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input to prevent XSS
    const sanitizedValue = value.replace(/<script[^>]*>.*?<\/script>/gi, '')
                               .replace(/javascript:/gi, '')
                               .replace(/on\w+\s*=/gi, '');
    
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user types
    if (name === 'fullName' || name === 'phone' || name === 'address') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Update Facebook Pixel data collector in real-time
    facebookPixelDataCollector.updateFromCheckoutForm({ ...formData, [name]: sanitizedValue });
  };

  const getDeliveryCharge = () => {
    return formData.deliveryZone === 'dhaka' ? 80 : 130;
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
      isEmpty: updatedItems.length === 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check (max 3 attempts per 10 minutes)
    const now = Date.now();
    const tenMinutesAgo = now - (10 * 60 * 1000);
    const recentAttempts = submitAttempts.filter(timestamp => timestamp > tenMinutesAgo);
    
    if (recentAttempts.length >= 3) {
      setIsRateLimited(true);
      alert('Too many checkout attempts. Please wait 10 minutes before trying again.');
      return;
    }

    // Add current attempt timestamp
    setSubmitAttempts([...recentAttempts, now]);

    // Validate name
    const nameError = validateName(formData.fullName);
    if (nameError) {
      setErrors((prev) => ({ ...prev, fullName: nameError }));
      return;
    }

    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors((prev) => ({ ...prev, phone: phoneError }));
      return;
    }

    // Validate address
    const addressError = validateAddress(formData.address);
    if (addressError) {
      setErrors((prev) => ({ ...prev, address: addressError }));
      return;
    }

    const formattedPhone = formatPhoneNumber(formData.phone);

    // Check if customer is already verified and blocked
    if (verificationResult && !verificationResult.allowed) {
      setBlockedReason(verificationResult.reason);
      setShowBlockedModal(true);
      return;
    }

    setIsLoading(true);
    setCheckoutStep('processing');

    try {
      // If not already verified, verify now
      if (!verificationResult) {
        const result = await verifyCustomerHistory(formattedPhone);
        
        // If customer is blocked, show modal and stop
        if (!result.allowed) {
          setIsLoading(false);
          setBlockedReason(result.reason);
          setShowBlockedModal(true);
          return;
        }
      }
      
      // Prepare checkout input for GraphQL using your exact structure
      const [firstName, ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      // Determine shipping method based on delivery zone (hardcoded)
      const shippingMethod = formData.deliveryZone === 'dhaka' 
        ? { methodId: 'flat_rate:1', methodTitle: 'Inside Dhaka', total: '80' }
        : { methodId: 'flat_rate:2', methodTitle: 'Outside Dhaka', total: '130' };
      
      const checkoutInput = {
        clientMutationId: `placeOrder${Date.now()}`,
        paymentMethod: formData.paymentMethod,
        isPaid: formData.paymentMethod === 'bKash', // Only paid if bKash, pending for COD
        billing: {
          firstName,
          lastName,
          address1: formData.address,
          city: '', // Keep blank as requested
          postcode: '', // Keep blank as requested
          country: 'BD',
          email: `${formattedPhone}@customer.${process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'zoansh.com'}`,
          phone: formattedPhone,
        },
        shipping: {
          firstName,
          lastName,
          address1: formData.address,
          city: '', // Keep blank as requested
          postcode: '', // Keep blank as requested
          country: 'BD',
        },
        // Use shippingMethod as a string (just the ID) as shown in your working query
        shippingMethod: shippingMethod.methodId,
        // Add custom metadata to order
        metaData: [
          { key: 'store_name', value: process.env.NEXT_PUBLIC_STORE_NAME || 'Zoansh Store' },
          { key: 'store_id', value: process.env.NEXT_PUBLIC_STORE_ID || '1' },
          { key: 'payment_method', value: formData.paymentMethod },
          { key: 'order_origin', value: process.env.NEXT_PUBLIC_SITE_URL || 'https://zoansh.com' }
        ]
      };

      // Get or create session and add cart items to it
      let sessionToken: string | null = localStorage.getItem('woocommerce-session-token');
      
      // If no session, create one with minimal query
      if (!sessionToken) {
        try {
          const sessionResult = await fetchWithSession(
            `query { __typename }`,
            {},
            undefined
          );
          sessionToken = sessionResult.sessionToken;
          if (sessionToken) {
            localStorage.setItem('woocommerce-session-token', sessionToken);
          }
        } catch (sessionError) {
          throw new Error('Failed to create session');
        }
      }
      
      // Fast sequential processing with optimized delays
      setCheckoutStep('placing_order');
      let currentSessionToken = sessionToken;
      
      try {
        // Process items in small batches to balance speed and reliability
        const batchSize = 3; // Process 3 items at a time
        const batches = [];
        
        for (let i = 0; i < localItems.length; i += batchSize) {
          batches.push(localItems.slice(i, i + batchSize));
        }
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          
          // Process batch items in parallel
          const batchPromises = batch.map(async (item, itemIndex) => {
            const variationId = item.variation?.node?.databaseId;
            
            try {
              let result;
              if (variationId) {
                result = await fetchWithSession(
                  ADD_TO_CART_SIMPLE,
                  {
                    input: {
                      productId: item.product.node.databaseId,
                      variationId: variationId,
                      quantity: item.quantity
                    }
                  },
                  currentSessionToken || undefined
                );
              } else {
                result = await fetchWithSession(
                  ADD_TO_CART_SIMPLE,
                  {
                    input: {
                      productId: item.product.node.databaseId,
                      quantity: item.quantity
                    }
                  },
                  currentSessionToken || undefined
                );
              }
              
              return { success: true, sessionToken: result.sessionToken };
            } catch (error) {
              return { success: false, error };
            }
          });

          // Wait for batch to complete
          const batchResults = await Promise.allSettled(batchPromises);
          
          // Update session token from any successful result in this batch
          const successfulResult = batchResults.find(r => 
            r.status === 'fulfilled' && r.value.success && r.value.sessionToken
          );
          if (successfulResult && successfulResult.status === 'fulfilled') {
            currentSessionToken = successfulResult.value.sessionToken || currentSessionToken;
          }
          
          // Small delay between batches to prevent session conflicts
          if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Update the session token if it changed
        if (currentSessionToken && currentSessionToken !== sessionToken) {
          sessionToken = currentSessionToken;
          localStorage.setItem('woocommerce-session-token', currentSessionToken);
        }
        
        // Quick verification that we have items in the session
        try {
          const cartCheck = await fetchWithSession(
            `query { cart { contents { nodes { key } } } }`,
            {},
            currentSessionToken || undefined
          );
          const sessionItems = (cartCheck.data as any)?.cart?.contents?.nodes || [];
          if (sessionItems.length === 0) {
            throw new Error('No items found in session after processing');
          }
        } catch (verifyError) {
          console.warn('Session verification failed:', verifyError);
        }
        
      } catch (cartError) {
        // Continue with checkout even if cart processing fails
      }
      
      // Place the order with the session that has cart items
      let result: any;
      
      // Use the updated session token
      const finalSessionToken = currentSessionToken || sessionToken;
      
      if (!finalSessionToken) {
        throw new Error('No session token available for checkout');
      }
      
      
      try {
        // Add timeout wrapper for order placement with retry logic
        const orderPromise = fetchWithSession(
          PLACE_ORDER,
          { input: checkoutInput },
          finalSessionToken
        );
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Order placement timeout after 10 seconds')), 10000);
        });
        
        result = await Promise.race([orderPromise, timeoutPromise]);
      } catch (orderError) {
        // Retry logic for timeout errors
        if (orderError instanceof Error && orderError.message.includes('timeout')) {
          try {
            result = await fetchWithSession(
              PLACE_ORDER,
              { input: checkoutInput },
              finalSessionToken
            );
          } catch (retryError) {
            throw retryError;
          }
        } else {
          throw orderError;
        }
      }
      
      // Save session token if we got a new one
      if (result.sessionToken) {
        localStorage.setItem('woocommerce-session-token', result.sessionToken);
      }
      
       // Handle response and verify order
       const orderData = result.data?.checkout?.order || result.checkout?.order;
       if (orderData) {
         const order = orderData;
         const orderNumber = order.orderNumber;
         const totalAmount = parseFloat(order.total);
         const deliveryCharge = parseFloat(order.shippingTotal || '0');
         
         // Verify order was actually created
         if (!orderNumber || orderNumber === 'N/A') {
           throw new Error('Order creation failed - no order number received');
         }
         
         if (!totalAmount || totalAmount <= 0) {
           throw new Error('Order creation failed - invalid total amount');
         }
      
      // Save customer info to localStorage for future orders
      const customerInfo = {
        fullName: formData.fullName,
        phone: formattedPhone,
        address: formData.address,
        deliveryZone: formData.deliveryZone,
      };
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
       
       // Save ordered items for thank you page with delivery time info
       const itemsWithDeliveryTime = localItems.map(item => {
         const variationStock = (item.variation?.node as any)?.stockStatus;
         const productStock = (item.product?.node as any)?.stockStatus;
         const stockStatus = variationStock || productStock || 'IN_STOCK';
         
         // Get delivery time info from the original getDeliveryTime function
         const deliveryInfo = getDeliveryTime(stockStatus);
         
         return {
           ...item,
           deliveryTime: deliveryInfo
         };
       });
       
       // Save to multiple storage locations for backup
       try {
         localStorage.setItem('lastOrderItems', JSON.stringify(itemsWithDeliveryTime));
         localStorage.setItem('lastOrderBackup', JSON.stringify(itemsWithDeliveryTime));
         sessionStorage.setItem('lastOrderItems', JSON.stringify(itemsWithDeliveryTime));
       } catch (storageError) {
         console.warn('Storage failed, using fallback:', storageError);
         // Fallback: store in memory
         (window as any).lastOrderItems = itemsWithDeliveryTime;
       }
      
       // Determine order status based on payment method
       const orderStatus = formData.paymentMethod === 'bKash' ? 'confirmed' : 'pending';
      
      // Build thank you page URL
       const thankYouUrl = `/thank-you?orderNumber=${orderNumber}&name=${encodeURIComponent(formData.fullName)}&phone=${formattedPhone}&address=${encodeURIComponent(formData.address)}&total=${totalAmount.toFixed(0)}&delivery=${deliveryCharge}&items=${localItems.length}&status=${orderStatus}`;
      
        // Update data collector with form data
        facebookPixelDataCollector.updateFromCheckoutForm(formData);
        facebookPixelDataCollector.setExternalId(order.orderNumber || order.id);
        
        // Track purchase with subtotal (excluding shipping)
        const subtotalForPixel = localItems.reduce((sum, item) => {
          const itemTotal = parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0');
          return sum + itemTotal;
        }, 0);
        
        // Create order data with subtotal for Facebook Pixel
        const orderForPixel = {
          ...order,
          total: subtotalForPixel.toString()
        };
        
        // Get customer ID for audience management
        const customerId = formData.phone || order.orderNumber || order.id;
        
        // Update customer value in audience manager
        facebookAudienceManager.updateCustomerValue(customerId, subtotalForPixel);
        
        // Add to exclusions if this is a conversion
        facebookAudienceManager.addToExclusions(customerId, 'converted');
        
        // Get enhanced event data with audience exclusions
        const enhancedEventData = facebookAudienceManager.getEnhancedEventData({
          content_ids: localItems.map(item => item.product.node.databaseId?.toString() || item.product.node.id),
          content_type: 'product',
          contents: localItems.map(item => ({
            id: item.product.node.databaseId?.toString() || item.product.node.id,
            quantity: item.quantity,
            item_price: parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0') / item.quantity
          })),
          currency: 'BDT',
          value: subtotalForPixel,
          num_items: localItems.length
        }, customerId);
        
        // Track purchase with enhanced system
        if (enhancedEventData) {
          facebookEventBatcher.addEvent('Purchase', {
            ...orderForPixel,
            items: localItems,
            enhancedData: enhancedEventData
          }, 'high');
        }
        
        // Also track purchase directly for immediate tracking
        trackOrder(orderForPixel, localItems);
        
        // Track custom business events
        facebookCustomEvents.trackBusinessEvent('OrderCompleted', {
          order_id: order.orderNumber || order.id,
          customer_id: customerId,
          order_value: subtotalForPixel,
          payment_method: formData.paymentMethod,
          delivery_zone: formData.deliveryZone
        });
        
        
        // Clear cart and navigate to thank you page
      setCheckoutStep('success');
      clearCart();
      router.replace(thankYouUrl);
      } else {
        throw new Error('Order placement failed - No order in response');
      }
    } catch (error) {
      console.error('Checkout error:', error);
       setCheckoutStep('error');
       
       if (error instanceof Error) {
         // Specific error handling based on error type
         if (error.message.includes('Order creation failed')) {
           alert('Order creation failed. Please try again or contact support if the issue persists.');
         } else if (error.message.includes('Network') || error.message.includes('fetch')) {
           alert('Network error. Please check your internet connection and try again.');
         } else if (error.message.includes('GraphQL') || error.message.includes('GraphQL')) {
           alert('Server error. Please try again in a few moments.');
         } else if (error.message.includes('timeout')) {
           alert('Request timed out. Please try again.');
         } else if (error.message.includes('session') || error.message.includes('Session')) {
           alert('Session expired. Please refresh the page and try again.');
         } else if (error.message.includes('payment') || error.message.includes('Payment')) {
           alert('Payment method error. Please try a different payment method.');
         } else if (error.message.includes('cart') || error.message.includes('Cart')) {
           alert('Cart error. Please refresh the page and try again.');
         } else {
           alert(`Checkout failed: ${error.message}`);
         }
       } else {
         alert('An unexpected error occurred. Please try again or contact support.');
       }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show empty state if we're currently processing the order
  if (!isLoading && (isEmpty || items.length === 0 || localItems.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            href="/"
            className="inline-block text-white px-8 py-3 rounded-[5px] font-semibold transition-colors shadow-sm"
            style={{ backgroundColor: '#fe6c06' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .animate-pulse-btn {
          animation: pulse 1100ms infinite;
          transform-origin: center;
        }
      `}</style>
    <div className="min-h-screen bg-gray-50">
      <div className="lg:container lg:mx-auto px-2 py-2 lg:py-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Customer Information Card */}
          <div className="bg-white rounded-[5px] p-4 mb-2 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Customer Information</h2>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  minLength={3}
                  maxLength={100}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm text-gray-900 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-500`}
                  placeholder="Enter your full name"
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  aria-invalid={errors.fullName ? "true" : "false"}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-xs text-red-600 mt-1" role="alert">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm text-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-500`}
                  placeholder="01XXXXXXXXX"
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                  {/* Verification Status Indicator */}
                  {formData.phone && formData.phone.length >= 10 && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {verificationResult === null ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      ) : verificationResult.allowed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p id="phone-error" className="text-xs text-red-600 mt-1" role="alert">{errors.phone}</p>
                )}
                {verificationResult && !verificationResult.allowed && (
                  <p className="text-xs text-red-600 mt-1">{verificationResult.reason}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                  Complete Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  maxLength={500}
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm text-gray-900 border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent resize-none placeholder:text-gray-500`}
                  placeholder="House/Flat no, Road, Area, Thana"
                  aria-describedby={errors.address ? "address-error" : undefined}
                  aria-invalid={errors.address ? "true" : "false"}
                />
                {errors.address && (
                  <p id="address-error" className="text-xs text-red-600 mt-1" role="alert">{errors.address}</p>
                )}
              </div>


              <div>
                <label htmlFor="deliveryZone" className="block text-xs font-medium text-gray-700 mb-1">
                  Delivery Area *
                </label>
                <select
                  id="deliveryZone"
                  name="deliveryZone"
                  required
                  value={formData.deliveryZone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                  aria-label="Select delivery area"
                >
                  <option value="outside">Outside Dhaka (Tk 130)</option>
                  <option value="dhaka">Inside Dhaka (Tk 80)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-[5px] p-4 mb-2 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="flex gap-2">
              {/* Cash on Delivery Button */}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-900 border rounded transition-all duration-200 ${
                  formData.paymentMethod === 'cod'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-orange-300'
                }`}
                aria-pressed={formData.paymentMethod === 'cod'}
                aria-label="Select Cash on Delivery payment method"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.23442 7.7087L17.0354 20.5097C17.1594 20.6337 17.3605 20.6337 17.4845 20.5097L24.6511 13.3431C24.7751 13.2191 24.7751 13.018 24.6511 12.894L11.8502 0.0930021C11.7262 -0.0310007 11.5251 -0.0310007 11.4011 0.0930021L4.23447 7.25965C4.11041 7.38365 4.11041 7.5847 4.23442 7.7087Z" fill="#0E5327"/>
                    <path d="M4.23544 7.25939L6.16594 5.32889L19.416 18.579L17.4855 20.5095C17.3615 20.6335 17.1605 20.6335 17.0365 20.5095L4.23544 7.70845C4.11143 7.58444 4.11143 7.3834 4.23544 7.25939Z" fill="#004D3F"/>
                    <path d="M21.8999 13.9493C21.6206 13.4326 21.6206 12.8038 21.8999 12.287C21.9373 12.2176 21.9265 12.1322 21.8707 12.0765L12.6668 2.87257C12.6111 2.8168 12.5257 2.80597 12.4563 2.84352C11.9397 3.12281 11.3109 3.12281 10.794 2.84346C10.7246 2.80597 10.6393 2.8168 10.5835 2.87252L7.01397 6.44205C6.9582 6.49782 6.94737 6.58319 6.98491 6.65256C7.26426 7.16936 7.26426 7.79808 6.98491 8.31488C6.94742 8.38425 6.95825 8.46962 7.01397 8.52539L16.2179 17.7294C16.2737 17.7851 16.3591 17.796 16.4284 17.7585C16.9452 17.4792 17.574 17.4792 18.0907 17.7585C18.1601 17.796 18.2454 17.7851 18.3012 17.7294L21.8707 14.1598C21.9265 14.1041 21.9373 14.0186 21.8999 13.9493Z" fill="#16A34A"/>
                    <path d="M6.98574 8.31504C7.26508 7.79824 7.26508 7.16952 6.98574 6.65273C6.94825 6.58335 6.95908 6.49798 7.01479 6.44221L9.07012 4.38689C9.43935 4.96032 9.43935 5.70385 9.07012 6.27729L18.4671 15.6742C19.0405 15.305 19.7841 15.3051 20.3574 15.6742L18.3021 17.7295C18.2463 17.7853 18.161 17.7961 18.0916 17.7586C17.5749 17.4793 16.9461 17.4793 16.4293 17.7586C16.3599 17.7961 16.2746 17.7853 16.2188 17.7295L7.01485 8.52556C6.95908 8.46984 6.94825 8.38441 6.98574 8.31504Z" fill="#00B795"/>
                    <path d="M12.5968 12.1467C11.5773 11.1272 11.5773 9.47421 12.5968 8.4547C13.6163 7.43519 15.2693 7.43519 16.2888 8.4547C17.3083 9.47421 17.3083 11.1272 16.2888 12.1467C15.2693 13.1662 13.6163 13.1662 12.5968 12.1467Z" fill="#F3E8D7"/>
                    <path d="M17.5396 16.5005L13.6008 12.5618C13.1469 12.1079 12.9539 11.5649 13.4078 11.1111C14.1232 10.2227 16.7346 10.9351 17.9734 12.1739C18.574 12.7745 19.2561 13.4567 19.632 13.8329C19.816 14.0169 20.0653 14.1203 20.3287 14.1203H20.3423C20.7768 14.1203 21.2859 13.6994 21.3979 13.2796L21.3982 9.63999L20.7483 8.99005L20.0342 8.27596L17.1981 5.43984C18.3649 5.30909 19.5251 5.23835 19.9752 5.18443C20.4756 5.12447 20.9024 5.3487 21.2907 5.66994L24.9215 8.53436C25.4339 8.95828 25.8033 9.52948 25.9802 10.1706C26.3766 11.6064 27.2116 14.1461 27.7415 15.1561L30.3887 17.8033L25.8056 22.3863L24.531 21.1117C24.2914 20.8721 23.9952 20.697 23.6698 20.6027L21.0078 19.7063C20.1715 19.4194 19.4353 18.8981 18.8869 18.2046L17.5396 16.5005Z" fill="#FCD7C3"/>
                    <path d="M18.8846 18.2046L17.5372 16.5005L13.5985 12.5618C13.1446 12.1079 12.9516 11.565 13.4055 11.1111C13.6684 10.7845 14.1876 10.6743 14.8007 10.727C15.6986 10.8042 16.5353 11.2147 17.1726 11.852L19.6792 14.3586L21.0266 16.0626C21.5749 16.7562 22.3111 17.2774 23.1474 17.5643L25.8095 18.4607C26.1348 18.555 26.4311 18.7301 26.6707 18.9697L27.9453 20.2443L25.8034 22.3863L24.5287 21.1117C24.2892 20.8721 23.9929 20.697 23.6676 20.6026L21.0055 19.7063C20.1692 19.4193 19.433 18.898 18.8846 18.2046Z" fill="#FFCDAC"/>
                    <path d="M26.5481 23.8525L31.8526 18.548C32.0491 18.3514 32.0491 18.0327 31.8526 17.8361L30.9191 16.9027C30.7225 16.7061 30.4038 16.7061 30.2072 16.9027L24.9027 22.2071C24.7062 22.4037 24.7062 22.7224 24.9027 22.919L25.8362 23.8524C26.0328 24.0491 26.3515 24.0491 26.5481 23.8525Z" fill="#475569"/>
                    <path d="M24.9032 22.2072L26.7023 20.4081L28.3477 22.0535L26.5486 23.8526C26.352 24.0492 26.0333 24.0492 25.8367 23.8526L24.9033 22.9191C24.7066 22.7226 24.7066 22.4038 24.9032 22.2072Z" fill="#0F172A"/>
                    <path d="M13.7557 12.439C14.2785 11.9163 15.126 11.9163 15.6488 12.439L16.2435 13.0337C16.5126 13.3028 16.5126 13.7391 16.2435 14.0082L15.6451 14.6066L13.6166 12.5782L13.7557 12.439Z" fill="#0F172A"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">Cash on Delivery</span>
              </button>

              {/* bKash Button */}
              <button
                type="button"
                  disabled
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 bg-gray-50 cursor-not-allowed opacity-60 rounded"
                aria-label="bKash payment method (coming soon)"
                aria-disabled="true"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="800" width="1200" viewBox="-18.0015 -28.3525 156.013 170.115">
                    <g fill="none">
                      <path fill="#D12053" d="M96.58 62.45l-53.03-8.31 7.03 31.6z"/>
                      <path fill="#E2136E" d="M96.58 62.45L56.62 6.93 43.56 54.15z"/>
                      <path fill="#D12053" d="M42.32 53.51L.45 0l54.83 6.55z"/>
                      <path fill="#9E1638" d="M23.25 31.15L0 9.24h6.12z"/>
                      <path fill="#D12053" d="M107.89 35.46l-9.84 26.69L82.1 40.09z"/>
                      <path fill="#E2136E" d="M56.77 84.14l38.61-15.51L97 63.7z"/>
                      <path fill="#9E1638" d="M25.89 113.41l16.54-58.02 8.39 37.75z"/>
                      <path fill="#E2136E" d="M109.43 35.67l-4.06 11.02 14.64-.24z"/>
                    </g>
                  </svg>
                </div>
                <span className="text-sm font-medium">bKash</span>
                <span className="text-xs text-gray-400">Soon</span>
              </button>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={isLoading || localItems.length === 0 || isRateLimited}
            className="w-full text-white px-6 py-3 rounded-[5px] text-base font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none animate-pulse-btn"
            style={{ backgroundColor: isRateLimited ? '#dc2626' : '#fe6c06' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && !isRateLimited && (e.currentTarget.style.backgroundColor = '#e55a00')}
            onMouseLeave={(e) => !e.currentTarget.disabled && !isRateLimited && (e.currentTarget.style.backgroundColor = '#fe6c06')}
            aria-label={isLoading ? "Processing order..." : isRateLimited ? "Rate limited, please wait" : "Place your order"}
            aria-describedby={isRateLimited ? "rate-limit-message" : undefined}
          >
            <div className="flex items-center justify-center gap-2">
              {isRateLimited ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="text-xs">!</span>
                  </div>
                  <span>Rate Limited - Wait 10 min</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {checkoutStep === 'processing' && 'Verifying...'}
                    {checkoutStep === 'placing_order' && 'Placing Order...'}
                    {checkoutStep === 'success' && 'Success!'}
                    {checkoutStep === 'error' && 'Error - Retry'}
                    {!checkoutStep && 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Place Order</span>
                </>
              )}
            </div>
          </button>

          {/* Order Summary Card */}
          <div className="bg-white rounded-[5px] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Order Summary</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {localItems.length} {localItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {localItems.map((item: CartItem) => {
                // Get stock status from variation or product
                const variationStock = item.variation?.node?.stockStatus;
                const productStock = item.product?.node?.stockStatus;
                const stockStatus = variationStock || productStock || 'IN_STOCK';
                const deliveryInfo = getDeliveryTime(stockStatus);
                
                return (
                  <div key={item.key} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex gap-3">
                      {/* Product Image with Border */}
                      <div className="w-20 h-20 border-[3px] border-gray-200 rounded-[5px] overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.node.image?.sourceUrl || '/placeholder.png'}
                          alt={item.product.node.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Product Title & Delete Button */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-2">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
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

            {/* Price Breakdown */}
            <div className="space-y-2 pt-3 border-t-2 border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  Tk {localItems.reduce((sum, item) => sum + parseFloat(item.total.replace(/[^0-9.-]+/g, '')), 0).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600">Delivery Charge</span>
                </div>
                <span className="font-medium text-gray-900">Tk {getDeliveryCharge()}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-red-600">
                  Tk {(localItems.reduce((sum, item) => sum + parseFloat(item.total.replace(/[^0-9.-]+/g, '')), 0) + getDeliveryCharge()).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Blocked Customer Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Order Blocked
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                {blockedReason}
              </p>
              
              <div className="space-y-2 w-full">
                <button
                  onClick={() => setShowBlockedModal(false)}
                  className="w-full text-white px-6 py-3 rounded-[5px] font-semibold transition-colors"
                  style={{ backgroundColor: '#fe6c06' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55a00'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#fe6c06'}
                >
                  Understood
                </button>
                
                <a
                  href="tel:01926644575"
                  className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-[5px] font-semibold hover:bg-gray-200 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
