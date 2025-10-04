'use client';

import { useEffect, useState } from 'react';
import { facebookPixel } from '@/lib/facebook-pixel';

export default function FacebookPixelDebug() {
  const [pixelStatus, setPixelStatus] = useState<string>('Checking...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_FACEBOOK_PIXEL_ID: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
      NEXT_PUBLIC_FACEBOOK_PIXEL_IDS: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS,
      NODE_ENV: process.env.NODE_ENV,
    });

    // Check if fbq is available
    const checkPixel = () => {
      if (typeof window !== 'undefined') {
        if (window.fbq && facebookPixel.isReady()) {
          setPixelStatus('✅ Facebook Pixel loaded successfully');
        } else if (window.fbq) {
          setPixelStatus('⚠️ fbq loaded but not initialized');
        } else {
          setPixelStatus('❌ Facebook Pixel not loaded');
        }
      }
    };

    // Check immediately and after delays
    checkPixel();
    setTimeout(checkPixel, 1000);
    setTimeout(checkPixel, 3000);
    setTimeout(checkPixel, 5000);
  }, []);

  const testPixel = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test multiple events
      window.fbq('track', 'PageView');
      window.fbq('track', 'ViewContent', {
        content_name: 'Test Product',
        content_category: 'Test Category',
        content_ids: ['test-123'],
        content_type: 'product',
        value: 10.00,
        currency: 'BDT'
      });
      console.log('Test events sent: PageView, ViewContent');
    } else {
      console.log('fbq not available for testing');
    }
  };

  const initializePixel = async () => {
    try {
      await facebookPixel.initialize();
      console.log('Manual pixel initialization attempted');
      // Refresh status after initialization
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          if (window.fbq && facebookPixel.isReady()) {
            setPixelStatus('✅ Facebook Pixel loaded successfully');
          } else if (window.fbq) {
            setPixelStatus('⚠️ fbq loaded but not initialized');
          } else {
            setPixelStatus('❌ Facebook Pixel not loaded');
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize pixel:', error);
    }
  };

  const testPixelHelper = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Send a test event that should be visible in Meta Pixel Helper
      window.fbq('track', 'PageView');
      window.fbq('track', 'ViewContent', {
        content_name: 'Debug Test Product',
        content_category: 'Debug Test',
        content_ids: ['debug-test-123'],
        content_type: 'product',
        value: 25.00,
        currency: 'BDT'
      });
      window.fbq('track', 'AddToCart', {
        content_name: 'Debug Test Product',
        content_category: 'Debug Test',
        content_ids: ['debug-test-123'],
        content_type: 'product',
        value: 25.00,
        currency: 'BDT'
      });
      console.log('Test events sent for Meta Pixel Helper');
      alert('Test events sent! Check Meta Pixel Helper extension.');
    }
  };

  const testStandardPixel = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test with standard Facebook Pixel events
      window.fbq('track', 'PageView');
      window.fbq('track', 'ViewContent', {
        content_name: 'Standard Test Product',
        content_category: 'Electronics',
        content_ids: ['standard-test-456'],
        content_type: 'product',
        value: 50.00,
        currency: 'BDT'
      });
      window.fbq('track', 'InitiateCheckout', {
        content_ids: ['standard-test-456'],
        content_type: 'product',
        value: 50.00,
        currency: 'BDT',
        num_items: 1
      });
      console.log('Standard Facebook Pixel events sent');
      alert('Standard pixel events sent! Check Meta Pixel Helper.');
    }
  };

  const testSearchEvent = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test search event specifically
      window.fbq('track', 'Search', {
        search_string: 'test search query'
      });
      console.log('Search event sent');
      alert('Search event sent! Check Meta Pixel Helper.');
    }
  };

  const clearTrackedProducts = () => {
    facebookPixel.clearTrackedProducts();
    alert('Cleared tracked products! You can now test ViewContent again.');
  };

  const clearTrackedCheckouts = () => {
    facebookPixel.clearTrackedCheckouts();
    alert('Cleared tracked checkouts! You can now test ViewCheckout again.');
  };

  const clearAllTracked = () => {
    facebookPixel.clearAllTracked();
    alert('Cleared all tracked events! You can now test all events again.');
  };

  const clearTrackedInitiateCheckouts = () => {
    facebookPixel.clearTrackedInitiateCheckouts();
    alert('Cleared tracked initiate checkouts! You can now test InitiateCheckout again.');
  };

  const clearTrackedPurchases = () => {
    facebookPixel.clearTrackedPurchases();
    alert('Cleared tracked purchases! You can now test Purchase again.');
  };

  const clearTrackedPageViews = () => {
    facebookPixel.clearTrackedPageViews();
    alert('Cleared tracked page views! You can now test PageView again.');
  };

  const testRealProductId = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test with enhanced product data including all important fields
      window.fbq('track', 'ViewContent', {
        content_ids: ['14215'], // Real WooCommerce product ID
        content_type: 'product',
        contents: [{
          id: '14215',
          quantity: 1,
          item_price: 1390
        }],
        currency: 'BDT',
        value: 1390,
        // Enhanced fields for better Facebook tracking
        content_name: 'Test Product Name',
        content_category: 'Electronics',
        product_price: 1390,
        post_id: '14215',
        post_type: 'product',
        page_title: 'Test Product - Your Store',
        user_role: 'guest'
      });
      console.log('Enhanced product data test sent');
      alert('Enhanced product data test sent! Check Meta Pixel Helper.');
    }
  };

  const testAddToCartComplete = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test AddToCart with complete product data
      window.fbq('track', 'AddToCart', {
        content_ids: ['1126'],
        content_type: 'product',
        contents: [{
          id: '1126',
          quantity: 1,
          item_price: 32.5
        }],
        currency: 'BDT',
        value: 32.5,
        // Enhanced fields for better Facebook tracking
        content_name: 'Torque Power Short',
        content_category: 'Clothing',
        product_price: 32.5,
        post_id: '1126',
        post_type: 'product',
        page_title: 'Torque Power Short | Zonash',
        user_role: 'guest'
      });
      console.log('Complete AddToCart test sent');
      alert('Complete AddToCart test sent! Check Meta Pixel Helper.');
    }
  };

  const testCartEvents = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test ViewCart event
      window.fbq('track', 'ViewCart', {
        content_ids: ['1126', '14215'],
        content_type: 'product',
        contents: [
          { id: '1126', quantity: 1, item_price: 32.5 },
          { id: '14215', quantity: 2, item_price: 1390 }
        ],
        currency: 'BDT',
        value: 2812.5,
        num_items: 2
      });
      
      // Test InitiateCheckout event
      window.fbq('track', 'InitiateCheckout', {
        content_ids: ['1126', '14215'],
        content_type: 'product',
        contents: [
          { id: '1126', quantity: 1, item_price: 32.5 },
          { id: '14215', quantity: 2, item_price: 1390 }
        ],
        currency: 'BDT',
        value: 2812.5,
        num_items: 2
      });
      
      console.log('Cart events test sent');
      alert('Cart events test sent! Check Meta Pixel Helper.');
    }
  };

  const testCheckoutEvents = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test InitiateCheckout event (from checkout page)
      window.fbq('track', 'InitiateCheckout', {
        content_ids: ['1126', '14215'],
        content_type: 'product',
        contents: [
          { id: '1126', quantity: 1, item_price: 32.5 },
          { id: '14215', quantity: 2, item_price: 1390 }
        ],
        currency: 'BDT',
        value: 2812.5,
        num_items: 2
      });
      
      // Test Purchase event (from successful order)
      window.fbq('track', 'Purchase', {
        content_ids: ['1126', '14215'],
        content_type: 'product',
        contents: [
          { id: '1126', quantity: 1, item_price: 32.5 },
          { id: '14215', quantity: 2, item_price: 1390 }
        ],
        currency: 'BDT',
        value: 2812.5,
        num_items: 2
      });
      
      console.log('Checkout events test sent');
      alert('Checkout events test sent! Check Meta Pixel Helper.');
    }
  };

  const testPurchaseEvent = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test Purchase event only (subtotal without shipping)
      window.fbq('track', 'Purchase', {
        content_ids: ['1126', '14215'],
        content_type: 'product',
        contents: [
          { id: '1126', quantity: 1, item_price: 32.5 },
          { id: '14215', quantity: 2, item_price: 1390 }
        ],
        currency: 'BDT',
        value: 2812.5, // Subtotal without shipping
        num_items: 2
      });
      
      console.log('Purchase event test sent (subtotal without shipping)');
      alert('Purchase event test sent (subtotal without shipping)! Check Meta Pixel Helper.');
    }
  };

  const testCategoryEvent = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Test Category View event
      window.fbq('track', 'ViewContent', {
        content_category: 'Electronics',
        content_ids: ['electronics'],
        content_type: 'category'
      });
      
      console.log('Category event test sent');
      alert('Category event test sent! Check Meta Pixel Helper.');
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Facebook Pixel Debug</h4>
      <p><strong>Status:</strong> {pixelStatus}</p>
      <p><strong>Pixel ID:</strong> {envVars.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || 'Not set'}</p>
      <p><strong>Pixel IDs:</strong> {envVars.NEXT_PUBLIC_FACEBOOK_PIXEL_IDS || 'Not set'}</p>
      <p><strong>NODE_ENV:</strong> {envVars.NODE_ENV || 'Not set'}</p>
      <p><strong>fbq available:</strong> {typeof window !== 'undefined' && window.fbq ? 'Yes' : 'No'}</p>
      <p><strong>Pixel ready:</strong> {facebookPixel.isReady() ? 'Yes' : 'No'}</p>
      <p><strong>Loaded pixels:</strong> {facebookPixel.getPixelIds().join(', ') || 'None'}</p>
      <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
        <button 
          onClick={testPixel}
          style={{
            background: '#1877f2',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Pixel
        </button>
        <button 
          onClick={initializePixel}
          style={{
            background: '#42b883',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Init Pixel
        </button>
        <button 
          onClick={testPixelHelper}
          style={{
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Helper
        </button>
        <button 
          onClick={testStandardPixel}
          style={{
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Standard Test
        </button>
        <button 
          onClick={testSearchEvent}
          style={{
            background: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Search
        </button>
        <button 
          onClick={clearTrackedProducts}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear Products
        </button>
        <button 
          onClick={clearTrackedCheckouts}
          style={{
            background: '#e91e63',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear Checkouts
        </button>
        <button 
          onClick={clearTrackedInitiateCheckouts}
          style={{
            background: '#ff9800',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear Initiate
        </button>
        <button 
          onClick={clearTrackedPurchases}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear Purchases
        </button>
        <button 
          onClick={clearTrackedPageViews}
          style={{
            background: '#607d8b',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear PageViews
        </button>
        <button 
          onClick={clearAllTracked}
          style={{
            background: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear All
        </button>
        <button 
          onClick={testRealProductId}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Real ID Test
        </button>
        <button 
          onClick={testAddToCartComplete}
          style={{
            background: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test AddToCart
        </button>
        <button 
          onClick={testCartEvents}
          style={{
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Cart
        </button>
        <button 
          onClick={testCheckoutEvents}
          style={{
            background: '#ff5722',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Checkout
        </button>
        <button 
          onClick={testPurchaseEvent}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Purchase
        </button>
        <button 
          onClick={testCategoryEvent}
          style={{
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Test Category
        </button>
      </div>
    </div>
  );
}
