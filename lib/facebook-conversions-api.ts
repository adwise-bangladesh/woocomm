// Facebook Conversions API client for server-side tracking
import type { CartItem, ProductData, OrderData } from './facebook-pixel';

export interface ServerSideEventData {
  eventName: string;
  eventData: Record<string, unknown>;
  userData: Record<string, unknown>;
  customData: Record<string, unknown>;
  eventSourceUrl?: string;
  eventId?: string;
}

export class FacebookConversionsAPI {
  private pixelId: string;
  private accessToken: string;

  constructor() {
    this.pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
  }

  // Send event to server-side API
  async sendEvent(eventData: ServerSideEventData): Promise<boolean> {
    try {
      const response = await fetch('/api/facebook-conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Server-side tracking failed:', error);
      return false;
    }
  }

  // Track Purchase event server-side
  async trackPurchase(orderData: OrderData, items: CartItem[], userData: Record<string, unknown>) {
    const customData = {
      content_ids: items.map(item => item.product?.node?.databaseId?.toString() || item.id),
      content_type: 'product',
      contents: items.map(item => ({
        id: item.product?.node?.databaseId?.toString() || item.id,
        quantity: (item.quantity as number | undefined) ?? 1,
        item_price: parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0') / ((item.quantity as number) ?? 1)
      })),
      currency: 'BDT',
      value: parseFloat(orderData.total?.replace(/[^0-9.-]+/g, '') || '0'),
      num_items: items.length
    };

    return this.sendEvent({
      eventName: 'Purchase',
      eventData: orderData as Record<string, unknown>,
      userData,
      customData,
      eventSourceUrl: window.location.href,
      eventId: `purchase_${orderData.orderNumber || Date.now()}`
    });
  }

  // Track AddToCart event server-side
  async trackAddToCart(product: ProductData, quantity: number, userData: Record<string, unknown>) {
    const customData = {
      content_ids: [product.databaseId?.toString() || product.id],
      content_type: 'product',
      contents: [{
        id: product.databaseId?.toString() || product.id,
        quantity: quantity,
        item_price: parseFloat(product.price?.replace(/[^0-9.-]+/g, '') || '0')
      }],
      currency: 'BDT',
      value: parseFloat(product.price?.replace(/[^0-9.-]+/g, '') || '0') * quantity
    };

    return this.sendEvent({
      eventName: 'AddToCart',
      eventData: product as unknown as Record<string, unknown>,
      userData,
      customData,
      eventSourceUrl: window.location.href,
      eventId: `addtocart_${product.databaseId || product.id}_${Date.now()}`
    });
  }

  // Track ViewContent event server-side
  async trackViewContent(product: ProductData, userData: Record<string, unknown>) {
    const customData = {
      content_ids: [product.databaseId?.toString() || product.id],
      content_type: 'product',
      contents: [{
        id: product.databaseId?.toString() || product.id,
        quantity: 1,
        item_price: parseFloat(product.price?.replace(/[^0-9.-]+/g, '') || '0')
      }],
      currency: 'BDT',
      value: parseFloat(product.price?.replace(/[^0-9.-]+/g, '') || '0')
    };

    return this.sendEvent({
      eventName: 'ViewContent',
      eventData: product as unknown as Record<string, unknown>,
      userData,
      customData,
      eventSourceUrl: window.location.href,
      eventId: `viewcontent_${product.databaseId || product.id}_${Date.now()}`
    });
  }

  // Track InitiateCheckout event server-side
  async trackInitiateCheckout(items: CartItem[], totalValue: number, userData: Record<string, unknown>) {
    const customData = {
      content_ids: items.map(item => item.product?.node?.databaseId?.toString() || item.id),
      content_type: 'product',
      contents: items.map(item => ({
        id: item.product?.node?.databaseId?.toString() || item.id,
        quantity: (item.quantity as number | undefined) ?? 1,
        item_price: parseFloat(item.total?.replace(/[^0-9.-]+/g, '') || '0') / ((item.quantity as number) ?? 1)
      })),
      currency: 'BDT',
      value: totalValue,
      num_items: items.length
    };

    return this.sendEvent({
      eventName: 'InitiateCheckout',
      eventData: { items, totalValue },
      userData,
      customData,
      eventSourceUrl: window.location.href,
      eventId: `initiatecheckout_${Date.now()}`
    });
  }
}

// Create singleton instance
export const facebookConversionsAPI = new FacebookConversionsAPI();
