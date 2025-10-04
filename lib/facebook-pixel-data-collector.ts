// Facebook Pixel Data Collector - Collects and enhances user data for better event quality
export interface UserDataForPixel {
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
  clickId?: string;
}

export class FacebookPixelDataCollector {
  private userData: UserDataForPixel = {};

  constructor() {
    this.initializeBasicData();
  }

  private initializeBasicData() {
    // Get basic browser data
    this.userData.userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    this.userData.country = 'BD'; // Default for Bangladesh
    
    // Try to get Facebook Pixel browser ID
    this.getFacebookBrowserId();
    
    // Try to get click ID from URL parameters
    this.getClickIdFromUrl();
  }

  private getFacebookBrowserId() {
    if (typeof window === 'undefined') return;
    
    // Facebook Pixel automatically sets _fbp cookie
    const fbpCookie = this.getCookie('_fbp');
    if (fbpCookie) {
      this.userData.browserId = fbpCookie;
    }
  }

  private getClickIdFromUrl() {
    if (typeof window === 'undefined') return;
    
    // Check for Facebook click ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fbc = urlParams.get('fbclid');
    if (fbc) {
      this.userData.clickId = fbc;
    }
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Update user data from checkout form
  public updateFromCheckoutForm(formData: any) {
    // Parse full name into first and last
    const nameParts = formData.fullName?.split(' ') || [];
    this.userData.firstName = nameParts[0] || '';
    this.userData.lastName = nameParts.slice(1).join(' ') || '';
    
    // Phone and email
    this.userData.phone = formData.phone || '';
    this.userData.email = `${formData.phone}@customer.${process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'zoansh.com'}`;
    
    // Location data
    this.userData.city = formData.city || this.extractCityFromAddress(formData.address);
    this.userData.zipCode = formData.zipCode || this.extractZipFromAddress(formData.address);
    this.userData.state = formData.deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka';
    
    // Demographics
    this.userData.gender = formData.gender || '';
    this.userData.dateOfBirth = formData.dateOfBirth || '';
  }

  private extractCityFromAddress(address: string): string {
    if (!address) return '';
    
    // Simple city extraction - can be enhanced
    const dhakaKeywords = ['dhaka', 'dhanmondi', 'gulshan', 'banani', 'uttara', 'mohammadpur', 'rampura'];
    const lowerAddress = address.toLowerCase();
    
    for (const keyword of dhakaKeywords) {
      if (lowerAddress.includes(keyword)) {
        return 'Dhaka';
      }
    }
    
    return 'Other';
  }

  private extractZipFromAddress(address: string): string {
    if (!address) return '';
    
    // Extract ZIP code from address (Bangladesh format)
    const zipMatch = address.match(/\b\d{4}\b/);
    return zipMatch ? zipMatch[0] : '';
  }

  // Set external ID (e.g., from order)
  public setExternalId(id: string) {
    this.userData.externalId = id;
  }

  // Set IP address (from server)
  public setIpAddress(ip: string) {
    this.userData.ipAddress = ip;
  }

  // Get enhanced event data for Facebook Pixel
  public getEnhancedEventData(baseEventData: Record<string, unknown>): Record<string, unknown> {
    return {
      ...baseEventData,
      // User identification (hashed for privacy)
      em: this.hashEmail(this.userData.email),
      ph: this.hashPhone(this.userData.phone),
      fn: this.hashString(this.userData.firstName),
      ln: this.hashString(this.userData.lastName),
      
      // Location data
      country: this.userData.country,
      st: this.userData.state,
      ct: this.userData.city,
      zp: this.userData.zipCode,
      
      // Demographics
      ge: this.userData.gender,
      db: this.userData.dateOfBirth,
      
      // Technical data
      client_ip_address: this.userData.ipAddress,
      client_user_agent: this.userData.userAgent,
      fbp: this.userData.browserId,
      fbc: this.userData.clickId,
      
      // External ID (use phone number as fallback)
      external_id: this.userData.externalId || this.userData.phone,
    };
  }

  // Hash email for privacy (Facebook requires hashed emails)
  private hashEmail(email?: string): string {
    if (!email) return '';
    // In production, use proper SHA-256 hashing
    // For now, using base64 encoding (replace with proper hashing)
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

  // Get current user data
  public getUserData(): UserDataForPixel {
    return { ...this.userData };
  }

  // Get data quality score
  public getDataQualityScore(): number {
    let score = 0;
    const maxScore = 12; // Total possible points
    
    if (this.userData.email) score++;
    if (this.userData.phone) score++;
    if (this.userData.firstName) score++;
    if (this.userData.lastName) score++;
    if (this.userData.city) score++;
    if (this.userData.zipCode) score++;
    if (this.userData.state) score++;
    if (this.userData.country) score++;
    if (this.userData.gender) score++;
    if (this.userData.dateOfBirth) score++;
    if (this.userData.browserId) score++;
    if (this.userData.clickId) score++;
    
    return Math.round((score / maxScore) * 100);
  }
}

// Create singleton instance
export const facebookPixelDataCollector = new FacebookPixelDataCollector();
