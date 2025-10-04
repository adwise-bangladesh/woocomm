// Facebook Pixel Event Batcher for better performance
import { facebookPixel } from './facebook-pixel';
import { facebookConversionsAPI } from './facebook-conversions-api';
import { facebookPixelDataCollector } from './facebook-pixel-data-collector';
import type { CartItem, ProductData } from './facebook-pixel';

export interface BatchedEvent {
  eventName: string;
  eventData: Record<string, unknown>;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

export class FacebookEventBatcher {
  private eventQueue: BatchedEvent[] = [];
  private batchSize = 5;
  private batchTimeout = 2000; // 2 seconds
  private isProcessing = false;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Start batch processing
    this.startBatchProcessing();
  }

  // Add event to batch queue
  addEvent(eventName: string, eventData: Record<string, unknown>, priority: 'high' | 'medium' | 'low' = 'medium') {
    const event: BatchedEvent = {
      eventName,
      eventData,
      timestamp: Date.now(),
      priority
    };

    this.eventQueue.push(event);
    console.log(`Facebook Pixel: Event "${eventName}" added to batch queue (priority: ${priority})`);

    // Process immediately if high priority
    if (priority === 'high') {
      this.processBatch();
    }
  }

  // Start batch processing
  private startBatchProcessing() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.processBatch();
      }
    }, this.batchTimeout);
  }

  // Process batch of events
  private async processBatch() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Sort events by priority and timestamp
      const sortedEvents = this.eventQueue.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp - b.timestamp;
      });

      // Process events in batches
      const batches = [];
      for (let i = 0; i < sortedEvents.length; i += this.batchSize) {
        batches.push(sortedEvents.slice(i, i + this.batchSize));
      }

      for (const batch of batches) {
        await this.processEventBatch(batch);
      }

      // Clear processed events
      this.eventQueue = [];
      console.log(`Facebook Pixel: Processed ${sortedEvents.length} events in batch`);

    } catch (error) {
      console.error('Facebook Pixel: Batch processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process a single batch of events
  private async processEventBatch(events: BatchedEvent[]) {
    const userData = facebookPixelDataCollector.getUserData();

    for (const event of events) {
      try {
        // Send client-side event
        this.sendClientSideEvent(event.eventName, event.eventData);

        // Send server-side event (if available)
        if (facebookConversionsAPI) {
          await this.sendServerSideEvent(event.eventName, event.eventData, userData as Record<string, unknown>);
        }

        console.log(`Facebook Pixel: Event "${event.eventName}" processed successfully`);
      } catch (error) {
        console.error(`Facebook Pixel: Error processing event "${event.eventName}":`, error);
      }
    }
  }

  // Send client-side event
  private async sendClientSideEvent(eventName: string, eventData: Record<string, unknown>) {
    switch (eventName) {
      case 'Purchase':
        // Use the helper function that handles the data transformation
        const { trackPurchase } = await import('./facebook-pixel');
        trackPurchase(eventData as any, (eventData.items || []) as CartItem[]);
        break;
      case 'AddToCart':
        // Use the helper function that handles the data transformation
        const { trackAddToCart } = await import('./facebook-pixel');
        trackAddToCart(eventData.product as ProductData, eventData.quantity as number || 1);
        break;
      case 'ViewContent':
        // Use the helper function that handles the data transformation
        const { trackProductView } = await import('./facebook-pixel');
        trackProductView(eventData as unknown as ProductData);
        break;
      case 'InitiateCheckout':
        // Use the helper function that handles the data transformation
        const { trackCheckoutInitiated } = await import('./facebook-pixel');
        trackCheckoutInitiated((eventData.items || []) as CartItem[], eventData.totalValue as number || 0);
        break;
      default:
        facebookPixel.trackCustomEvent(eventName, eventData);
        break;
    }
  }

  // Send server-side event
  private async sendServerSideEvent(eventName: string, eventData: Record<string, unknown>, userData: Record<string, unknown>) {
    try {
      switch (eventName) {
        case 'Purchase':
          await facebookConversionsAPI.trackPurchase(eventData as any, (eventData.items || []) as CartItem[], userData);
          break;
        case 'AddToCart':
          await facebookConversionsAPI.trackAddToCart(eventData.product as ProductData, (eventData.quantity as number) || 1, userData);
          break;
        case 'ViewContent':
          await facebookConversionsAPI.trackViewContent(eventData as unknown as ProductData, userData);
          break;
        case 'InitiateCheckout':
          await facebookConversionsAPI.trackInitiateCheckout((eventData.items || []) as CartItem[], (eventData.totalValue as number) || 0, userData);
          break;
        default:
          // Send custom event server-side
          await facebookConversionsAPI.sendEvent({
            eventName,
            eventData,
            userData,
            customData: eventData,
            eventSourceUrl: window.location.href,
            eventId: `${eventName}_${Date.now()}`
          });
          break;
      }
    } catch (error) {
      console.error(`Facebook Pixel: Server-side event "${eventName}" failed:`, error);
    }
  }

  // Force process all events immediately
  async flushEvents() {
    if (this.eventQueue.length > 0) {
      await this.processBatch();
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      batchSize: this.batchSize,
      batchTimeout: this.batchTimeout
    };
  }

  // Update batch settings
  updateBatchSettings(batchSize: number, batchTimeout: number) {
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
    this.startBatchProcessing();
  }

  // Clear all events
  clearEvents() {
    this.eventQueue = [];
    console.log('Facebook Pixel: Cleared all queued events');
  }
}

// Create singleton instance
export const facebookEventBatcher = new FacebookEventBatcher();
