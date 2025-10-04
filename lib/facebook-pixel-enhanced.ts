// Enhanced Facebook Pixel data collection for better event quality
import { facebookPixel } from './facebook-pixel';

export interface EnhancedUserData {
  // Basic Info
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  
  // Location
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  
  // Demographics
  gender?: string;
  dateOfBirth?: string;
  
  // Technical
  ipAddress?: string;
  userAgent?: string;
  browserId?: string;
  externalId?: string;
  facebookLoginId?: string;
  clickId?: string;
}

export class FacebookPixelEnhanced {
  private userData: EnhancedUserData = {};

  constructor() {
    this.initializeUserData();
  }

  private initializeUserData() {
    // Get basic browser data
    this.userData.userAgent = navigator.userAgent;
    this.userData.country = 'BD'; // Default for Bangladesh
    
    // Try to get Facebook Pixel browser ID
    this.getFacebookBrowserId();
    
    // Try to get click ID from URL parameters
    this.getClickIdFromUrl();
  }

  private getFacebookBrowserId() {
    // Facebook Pixel automatically sets _fbp cookie
    const fbpCookie = this.getCookie('_fbp');
    if (fbpCookie) {
      this.userData.browserId = fbpCookie;
    }
  }

  private getClickIdFromUrl() {
    // Check for Facebook click ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fbc = urlParams.get('fbclid');
    if (fbc) {
      this.userData.clickId = fbc;
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Update user data from checkout form
  public updateUserData(formData: any) {
    // Parse full name into first and last
    const nameParts = formData.fullName?.split(' ') || [];
    this.userData.firstName = nameParts[0] || '';
    this.userData.lastName = nameParts.slice(1).join(' ') || '';
    
    // Phone and email
    this.userData.phone = formData.phone || '';
    this.userData.email = `${formData.phone}@customer.${process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'zoansh.com'}`;
    
    // Address parsing (basic)
    const address = formData.address || '';
    this.userData.city = this.extractCityFromAddress(address);
    this.userData.zipCode = this.extractZipFromAddress(address);
    
    // Delivery zone as state
    this.userData.state = formData.deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka';
  }

  private extractCityFromAddress(address: string): string {
    // Simple city extraction - can be enhanced
    const dhakaKeywords = ['dhaka', 'dhanmondi', 'gulshan', 'banani', 'uttara'];
    const lowerAddress = address.toLowerCase();
    
    for (const keyword of dhakaKeywords) {
      if (lowerAddress.includes(keyword)) {
        return 'Dhaka';
      }
    }
    
    return 'Other';
  }

  private extractZipFromAddress(address: string): string {
    // Extract ZIP code from address (Bangladesh format)
    const zipMatch = address.match(/\b\d{4}\b/);
    return zipMatch ? zipMatch[0] : '';
  }

  // Get enhanced event data for Facebook Pixel
  public getEnhancedEventData(baseEventData: any): any {
    return {
      ...baseEventData,
      // User identification
      em: this.hashEmail(this.userData.email),
      ph: this.hashPhone(this.userData.phone),
      fn: this.hashString(this.userData.firstName),
      ln: this.hashString(this.userData.lastName),
      
      // Location data
      country: this.userData.country,
      st: this.userData.state,
      ct: this.userData.city,
      zp: this.userData.zipCode,
      
      // Technical data
      client_ip_address: this.userData.ipAddress,
      client_user_agent: this.userData.userAgent,
      fbp: this.userData.browserId,
      fbc: this.userData.clickId,
      
      // External ID (can be phone number or order ID)
      external_id: this.userData.externalId || this.userData.phone,
    };
  }

  // Hash email for privacy (Facebook requires hashed emails)
  private hashEmail(email?: string): string {
    if (!email) return '';
    // In production, use proper SHA-256 hashing
    return btoa(email.toLowerCase().trim());
  }

  // Hash phone for privacy
  private hashPhone(phone?: string): string {
    if (!phone) return '';
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return btoa(cleanPhone);
  }

  // Hash string for privacy
  private hashString(str?: string): string {
    if (!str) return '';
    return btoa(str.toLowerCase().trim());
  }

  // Set external ID (e.g., from order)
  public setExternalId(id: string) {
    this.userData.externalId = id;
  }

  // Set IP address (from server)
  public setIpAddress(ip: string) {
    this.userData.ipAddress = ip;
  }

  // Get current user data
  public getUserData(): EnhancedUserData {
    return { ...this.userData };
  }
}

// Create singleton instance
export const facebookPixelEnhanced = new FacebookPixelEnhanced();
