// Custom Facebook Pixel events for micro conversions and business-specific tracking
import { facebookPixel } from './facebook-pixel';
import { facebookPixelDataCollector } from './facebook-pixel-data-collector';

export class FacebookCustomEvents {
  private trackedEvents = new Set<string>();

  // Track scroll depth
  trackScrollDepth(scrollPercentage: number) {
    const eventKey = `scroll_${Math.floor(scrollPercentage / 25) * 25}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('ScrollDepth', {
        scroll_percentage: scrollPercentage,
        scroll_depth: Math.floor(scrollPercentage / 25) * 25
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: ScrollDepth ${scrollPercentage}% tracked`);
    }
  }

  // Track time on page
  trackTimeOnPage(timeSpent: number) {
    const eventKey = `time_${Math.floor(timeSpent / 30) * 30}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('TimeOnPage', {
        time_spent_seconds: timeSpent,
        time_spent_minutes: (timeSpent / 60).toFixed(2),
        engagement_level: timeSpent > 60 ? 'high' : timeSpent > 30 ? 'medium' : 'low'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: TimeOnPage ${timeSpent}s tracked`);
    }
  }

  // Track product image views
  trackProductImageView(productId: string, imageIndex: number) {
    const eventKey = `image_view_${productId}_${imageIndex}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('ProductImageView', {
        product_id: productId,
        image_index: imageIndex,
        content_type: 'product_image'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: ProductImageView tracked for product ${productId}, image ${imageIndex}`);
    }
  }

  // Track form interactions
  trackFormInteraction(formName: string, fieldName: string, action: string) {
    const eventKey = `form_${formName}_${fieldName}_${action}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('FormInteraction', {
        form_name: formName,
        field_name: fieldName,
        action: action,
        content_type: 'form'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: FormInteraction tracked - ${formName}.${fieldName}.${action}`);
    }
  }

  // Track search queries
  trackSearchQuery(query: string, resultsCount: number) {
    const eventKey = `search_${query.toLowerCase()}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('SearchQuery', {
        search_string: query,
        results_count: resultsCount,
        content_type: 'search'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: SearchQuery tracked - "${query}" with ${resultsCount} results`);
    }
  }

  // Track category filters
  trackCategoryFilter(categoryName: string, filterType: string, filterValue: string) {
    const eventKey = `filter_${categoryName}_${filterType}_${filterValue}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('CategoryFilter', {
        category_name: categoryName,
        filter_type: filterType,
        filter_value: filterValue,
        content_type: 'filter'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: CategoryFilter tracked - ${categoryName}.${filterType}.${filterValue}`);
    }
  }

  // Track wishlist actions
  trackWishlistAction(productId: string, action: 'add' | 'remove') {
    const eventKey = `wishlist_${productId}_${action}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('WishlistAction', {
        product_id: productId,
        action: action,
        content_type: 'wishlist'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: WishlistAction tracked - ${action} product ${productId}`);
    }
  }

  // Track newsletter signup
  trackNewsletterSignup(email: string) {
    const eventKey = `newsletter_${email}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('NewsletterSignup', {
        email: email,
        content_type: 'newsletter'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: NewsletterSignup tracked for ${email}`);
    }
  }

  // Track customer support interactions
  trackSupportInteraction(interactionType: string, topic: string) {
    const eventKey = `support_${interactionType}_${topic}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('SupportInteraction', {
        interaction_type: interactionType,
        topic: topic,
        content_type: 'support'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: SupportInteraction tracked - ${interactionType}.${topic}`);
    }
  }

  // Track mobile app interactions (if applicable)
  trackMobileAppAction(action: string, screen: string) {
    const eventKey = `mobile_${action}_${screen}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent('MobileAppAction', {
        action: action,
        screen: screen,
        content_type: 'mobile_app'
      });
      
      this.trackedEvents.add(eventKey);
      console.log(`Facebook Pixel: MobileAppAction tracked - ${action} on ${screen}`);
    }
  }

  // Track business-specific events
  trackBusinessEvent(eventName: string, eventData: any) {
    const eventKey = `business_${eventName}_${JSON.stringify(eventData).slice(0, 50)}`;
    
    if (!this.trackedEvents.has(eventKey)) {
      facebookPixel.trackCustomEvent(eventName, {
        ...eventData,
        content_type: 'business_event'
      });
      
      this.trackedEvents.add(eventKey);
    }
  }

  // Clear tracked events (for testing)
  clearTrackedEvents() {
    this.trackedEvents.clear();
    console.log('Facebook Pixel: Cleared all tracked custom events');
  }

  // Get tracked events count
  getTrackedEventsCount(): number {
    return this.trackedEvents.size;
  }
}

// Create singleton instance
export const facebookCustomEvents = new FacebookCustomEvents();
