/**
 * Enhanced Caching Utilities
 * Provides Redis-like caching for server-side operations
 */

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum entries
  cleanupInterval: number; // Cleanup frequency
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(private config: CacheConfig) {
    this.startCleanup();
  }

  set(key: string, value: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const now = Date.now();
    
    this.cache.set(key, {
      value,
      expiresAt: now + ttl,
      createdAt: now,
      hits: 0
    });

    // Enforce max size
    if (this.cache.size > this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup(); // Cleanup before returning size
    return this.cache.size;
  }

  stats(): { size: number; maxSize: number; hitRate: number } {
    this.cleanup();
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    
    const hitRate = this.cache.size > 0 ? totalHits / this.cache.size : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: Number(hitRate.toFixed(2))
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cache.delete(key));
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Category data cache: 5 minutes TTL, 1000 items max
export const categoryCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  cleanupInterval: 60 * 1000 // 1 minute cleanup
});

// Product data cache: 3 minutes TTL, 5000 items max  
export const productCache = new MemoryCache({
  ttl: 3 * 60 * 1000, // 3 minutes
  maxSize: 5000,
  cleanupInterval: 60 * 1000 // 1 minute cleanup
});

// Cache key generators
export const generateCategoryKey = (slug: string, page: number = 1): string => 
  `category:${slug}:page:${page}`;

export const generateProductKey = (id: string): string => 
  `product:${id}`;

export const generateProductsByCategoryKey = (slug: string, first: number, after?: string): string => 
  `products:category:${slug}:first:${first}:after:${after || 'null'}`;

// Cache warming utilities
export const warmCategoryCache = async (slug: string, data: unknown): Promise<void> => {
  const key = generateCategoryKey(slug, 1);
  categoryCache.set(key, data, 5 * 60 * 1000); // 5 minutes
};

export const warmProductCache = async (products: unknown[]): Promise<void> => {
  // Cache individual products for faster lookups
  if (Array.isArray(products)) {
    products.forEach((product) => {
      if (product && typeof product === 'object' && 'id' in product) {
        const productRecord = product as Record<string, unknown>;
        if (typeof productRecord.id === 'string') {
          const key = generateProductKey(productRecord.id);
          productCache.set(key, product, 3 * 60 * 1000); // 3 minutes
        }
      }
    });
  }
};
