// Facebook Pixel Audience Manager for exclusions and value optimization
// import { facebookPixel } from './facebook-pixel';

export interface CustomerValue {
  customerId: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

export class FacebookAudienceManager {
  private excludedUsers = new Set<string>();
  private highValueUsers = new Set<string>();
  private customerValues = new Map<string, CustomerValue>();

  constructor() {
    this.loadExcludedUsers();
    this.loadHighValueUsers();
    this.loadCustomerValues();
  }

  // Load excluded users from localStorage
  private loadExcludedUsers() {
    if (typeof window !== 'undefined') {
      const excluded = localStorage.getItem('facebook_excluded_users');
      if (excluded) {
        try {
          const users = JSON.parse(excluded);
          users.forEach((userId: string) => this.excludedUsers.add(userId));
        } catch (error) {
          console.error('Error loading excluded users:', error);
        }
      }
    }
  }

  // Load high-value users from localStorage
  private loadHighValueUsers() {
    if (typeof window !== 'undefined') {
      const highValue = localStorage.getItem('facebook_high_value_users');
      if (highValue) {
        try {
          const users = JSON.parse(highValue);
          users.forEach((userId: string) => this.highValueUsers.add(userId));
        } catch (error) {
          console.error('Error loading high-value users:', error);
        }
      }
    }
  }

  // Load customer values from localStorage
  private loadCustomerValues() {
    if (typeof window !== 'undefined') {
      const values = localStorage.getItem('facebook_customer_values');
      if (values) {
        try {
          const customerValues = JSON.parse(values);
          Object.entries(customerValues).forEach(([id, value]) => {
            this.customerValues.set(id, value as CustomerValue);
          });
        } catch (error) {
          console.error('Error loading customer values:', error);
        }
      }
    }
  }

  // Check if user should be excluded
  shouldExcludeUser(userId: string): boolean {
    return this.excludedUsers.has(userId);
  }

  // Check if user is high-value
  isHighValueUser(userId: string): boolean {
    return this.highValueUsers.has(userId);
  }

  // Get customer value data
  getCustomerValue(userId: string): CustomerValue | null {
    return this.customerValues.get(userId) || null;
  }

  // Add user to exclusions
  addToExclusions(userId: string, _reason: string = 'converted') {
    this.excludedUsers.add(userId);
    this.saveExcludedUsers();
  }

  // Remove user from exclusions
  removeFromExclusions(userId: string) {
    this.excludedUsers.delete(userId);
    this.saveExcludedUsers();
    console.log(`Facebook Pixel: User ${userId} removed from exclusions`);
  }

  // Add user to high-value list
  addToHighValue(userId: string, customerValue: CustomerValue) {
    this.highValueUsers.add(userId);
    this.customerValues.set(userId, customerValue);
    this.saveHighValueUsers();
    this.saveCustomerValues();
    console.log(`Facebook Pixel: User ${userId} added to high-value list (CLV: ${customerValue.customerLifetimeValue})`);
  }

  // Update customer value
  updateCustomerValue(userId: string, orderValue: number) {
    const existing = this.customerValues.get(userId);
    if (existing) {
      const updated: CustomerValue = {
        ...existing,
        totalSpent: existing.totalSpent + orderValue,
        orderCount: existing.orderCount + 1,
        lastOrderDate: new Date().toISOString(),
        averageOrderValue: (existing.totalSpent + orderValue) / (existing.orderCount + 1),
        customerLifetimeValue: existing.customerLifetimeValue + orderValue
      };
      this.customerValues.set(userId, updated);
    } else {
      const newValue: CustomerValue = {
        customerId: userId,
        totalSpent: orderValue,
        orderCount: 1,
        lastOrderDate: new Date().toISOString(),
        averageOrderValue: orderValue,
        customerLifetimeValue: orderValue
      };
      this.customerValues.set(userId, newValue);
    }
    this.saveCustomerValues();
  }

  // Get enhanced event data with audience exclusions
  getEnhancedEventData(baseEventData: Record<string, unknown>, userId: string) {
    // Check if user should be excluded
    if (this.shouldExcludeUser(userId)) {
      return null;
    }

    // Get customer value data
    const customerValue = this.getCustomerValue(userId);
    const isHighValue = this.isHighValueUser(userId);

    // Enhance event data with customer value
    const enhancedData = {
      ...baseEventData,
      // Add customer value information
      customer_lifetime_value: customerValue?.customerLifetimeValue || 0,
      customer_order_count: customerValue?.orderCount || 0,
      customer_average_order_value: customerValue?.averageOrderValue || 0,
      is_high_value_customer: isHighValue,
      // Add audience exclusions
      exclude_from_audiences: this.shouldExcludeUser(userId),
      // Add value optimization data
      value_optimization_score: this.calculateValueScore(customerValue),
    };

    return enhancedData;
  }

  // Calculate value optimization score
  private calculateValueScore(customerValue: CustomerValue | null): number {
    if (!customerValue) return 0;

    let score = 0;
    
    // Order count score (0-30 points)
    score += Math.min(customerValue.orderCount * 5, 30);
    
    // Total spent score (0-40 points)
    score += Math.min(customerValue.totalSpent / 100, 40);
    
    // Average order value score (0-20 points)
    score += Math.min(customerValue.averageOrderValue / 50, 20);
    
    // Recency score (0-10 points)
    const daysSinceLastOrder = Math.floor((Date.now() - new Date(customerValue.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 10 - daysSinceLastOrder);

    return Math.min(score, 100);
  }

  // Save excluded users to localStorage
  private saveExcludedUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('facebook_excluded_users', JSON.stringify([...this.excludedUsers]));
    }
  }

  // Save high-value users to localStorage
  private saveHighValueUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('facebook_high_value_users', JSON.stringify([...this.highValueUsers]));
    }
  }

  // Save customer values to localStorage
  private saveCustomerValues() {
    if (typeof window !== 'undefined') {
      const values = Object.fromEntries(this.customerValues);
      localStorage.setItem('facebook_customer_values', JSON.stringify(values));
    }
  }

  // Get audience insights
  getAudienceInsights() {
    return {
      totalExcludedUsers: this.excludedUsers.size,
      totalHighValueUsers: this.highValueUsers.size,
      totalCustomers: this.customerValues.size,
      averageCustomerValue: this.calculateAverageCustomerValue(),
      topCustomers: this.getTopCustomers(10)
    };
  }

  // Calculate average customer value
  private calculateAverageCustomerValue(): number {
    if (this.customerValues.size === 0) return 0;
    
    const totalValue = Array.from(this.customerValues.values())
      .reduce((sum, value) => sum + value.customerLifetimeValue, 0);
    
    return totalValue / this.customerValues.size;
  }

  // Get top customers by value
  private getTopCustomers(limit: number): CustomerValue[] {
    return Array.from(this.customerValues.values())
      .sort((a, b) => b.customerLifetimeValue - a.customerLifetimeValue)
      .slice(0, limit);
  }

  // Clear all data
  clearAllData() {
    this.excludedUsers.clear();
    this.highValueUsers.clear();
    this.customerValues.clear();
    this.saveExcludedUsers();
    this.saveHighValueUsers();
    this.saveCustomerValues();
    console.log('Facebook Pixel: Cleared all audience data');
  }
}

// Create singleton instance
export const facebookAudienceManager = new FacebookAudienceManager();
