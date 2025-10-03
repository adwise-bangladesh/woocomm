/**
 * Rate Limiting Utilities
 * Prevents abuse and ensures fair usage of resources
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator: (identifier: string) => string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = this.config.keyGenerator(identifier);
    const requestData = this.requests.get(key);
    
    if (!requestData || now > requestData.resetTime) {
      // Reset window or create new entry
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    if (requestData.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestData.resetTime
      };
    }
    
    requestData.count++;
    this.requests.set(key, requestData);
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// GraphQL API rate limiter: 60 requests per minute per IP
export const graphqlRateLimiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (ip: string) => `graphql:${ip}`
});

// Category page rate limiter: 10 requests per minute per IP  
export const categoryPageLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (ip: string) => `category:${ip}`
});

// Memory cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    graphqlRateLimiter.cleanup();
    categoryPageLimiter.cleanup();
  }, 5 * 60 * 1000);
}
