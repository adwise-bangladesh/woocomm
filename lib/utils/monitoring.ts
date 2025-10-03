/**
 * Performance Monitoring Utilities
 * Tracks Core Web Vitals and custom metrics
 */

import { logger } from './performance';

interface WebVitalMetric {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay  
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  loadTime?: number; // Page load time
  memoryUsage?: number; // Memory usage
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface CacheMetrics {
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private isEnabled = typeof window !== 'undefined';

  constructor() {
    if (this.isEnabled) {
      this.observePerformanceMetrics();
    }
  }

  private observePerformanceMetrics(): void {
    // Observe Core Web Vitals
    const windowWithWebVital = window as typeof window & { 
      webVital?: {
        getLCP?: (callback: (metric: WebVitalMetric) => void) => void;
        getFID?: (callback: (metric: WebVitalMetric) => void) => void;
        getCLS?: (callback: (metric: WebVitalMetric) => void) => void;
        getTTFB?: (callback: (metric: WebVitalMetric) => void) => void;
        getFCP?: (callback: (metric: WebVitalMetric) => void) => void;
      };
    };
    
    if ('web-vital' in window && windowWithWebVital.webVital) {
      windowWithWebVital.webVital.getLCP?.(this.onLCP.bind(this));
      windowWithWebVital.webVital.getFID?.(this.onFID.bind(this));
      windowWithWebVital.webVital.getCLS?.(this.onCLS.bind(this));
      windowWithWebVital.webVital.getTTFB?.(this.onTTFB.bind(this));
      windowWithWebVital.webVital.getFCP?.(this.onFCP.bind(this));
    }

    // Custom metrics
    this.measurePageLoadTime();
    this.measureMemoryUsage();
  }

  private onLCP(metric: WebVitalMetric): void {
    this.metrics.lcp = metric.value;
    logger.debug('LCP measured', { value: metric.value, rating: metric.rating });
  }

  private onFID(metric: WebVitalMetric): void {
    this.metrics.fid = metric.value;
    logger.debug('FID measured', { value: metric.value, rating: metric.rating });
  }

  private onCLS(metric: WebVitalMetric): void {
    this.metrics.cls = metric.value;
    logger.debug('CLS measured', { value: metric.value, rating: metric.rating });
  }

  private onTTFB(metric: WebVitalMetric): void {
    this.metrics.ttfb = metric.value;
    logger.debug('TTFB measured', { value: metric.value, rating: metric.rating });
  }

  private onFCP(metric: WebVitalMetric): void {
    this.metrics.fcp = metric.value;
    logger.debug('CLS measured', { value: metric.value, rating: metric.rating });
  }

  private measurePageLoadTime(): void {
    if ('performance' in window && window.performance.timing) {
      window.addEventListener('load', () => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        this.metrics.loadTime = loadTime;
        
        logger.debug('Page load time measured', { 
          loadTime,
          navigationStart: timing.navigationStart,
          loadEventEnd: timing.loadEventEnd 
        });
      });
    }
  }

  private measureMemoryUsage(): void {
    if ('memory' in (performance as any)) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      
      logger.debug('Memory usage measured', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public trackCustomMetric(name: string, value: number, context?: Record<string, unknown>): void {
    logger.debug('Custom metric tracked', { 
      metric: name, 
      value, 
      context 
    });

    // Send to analytics (Google Analytics, etc.)
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as typeof window & { gtag?: (...args: unknown[]) => void };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'custom_metric', {
          custom_metric_name: name,
          custom_metric_value: value,
          ...context
        });
      }
    }
  }

  public trackCacheMetrics(cacheName: string, metrics: CacheMetrics): void {
    logger.debug('Cache metrics tracked', { 
      cache: cacheName, 
      ...metrics 
    });

    // Calculate cache performance grade
    const grade = metrics.hitRate >= 0.8 ? 'A' : 
                  metrics.hitRate >= 0.6 ? 'B' : 
                  metrics.hitRate >= 0.4 ? 'C' : 'D';

    this.trackCustomMetric('cache_performance', metrics.hitRate, {
      cache_name: cacheName,
      grade,
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses
    });
  }

  public generatePerformanceReport(): string {
    const metrics = this.getMetrics();
    const score = this.calculatePerformanceScore(metrics);
    
    const report = `
Performance Report - ${new Date().toISOString()}
=================================================
Core Web Vitals:
- LCP (Largest Contentful Paint): ${metrics.lcp?.toFixed(2)}ms
- FID (First Input Delay): ${metrics.fid?.toFixed(2)}ms  
- CLS (Cumulative Layout Shift): ${metrics.cls?.toFixed(4)}
- TTFB (Time to First Byte): ${metrics.ttfb?.toFixed(2)}ms
- FCP (First Contentful Paint): ${metrics.fcp?.toFixed(2)}ms

Additional Metrics:
- Page Load Time: ${metrics.loadTime?.toFixed(2)}ms
- Memory Usage: ${metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(2) : 'N/A'}MB

Performance Score: ${score}/100
Grade: ${score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D'}`.trim();

    logger.info('Performance report generated', { score });
    return report;
  }

  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;
    
    // Deduct points for poor metrics
    if (metrics.lcp && metrics.lcp > 2500) score -= 20;
    if (metrics.fid && metrics.fid > 100) score -= 20;
    if (metrics.cls && metrics.cls > 0.1) score -= 20;
    if (metrics.loadTime && metrics.loadTime > 3000) score -= 20;
    if (metrics.memoryUsage && metrics.memoryUsage > 50000000) score -= 20; // 50MB
    
    return Math.max(0, Math.min(100, score));
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for easy usage
export const trackMetric = (name: string, value: number, context?: Record<string, unknown>) => 
  performanceMonitor.trackCustomMetric(name, value, context);

export const trackCachePerformance = (cacheName: string, hits: number, misses: number) => 
  performanceMonitor.trackCacheMetrics(cacheName, {
    cacheHits: hits,
    cacheMisses: misses,
    hitRate: hits / (hits + misses)
  });

export const getPerformanceMetrics = () => performanceMonitor.getMetrics();

export const generateReport = () => performanceMonitor.generatePerformanceReport();

// Simple performance wrapper - use in components manually
export const createPerformanceTracer = (componentName: string) => {
  return {
    startTrace: () => performance.now(),
    endTrace: (startTime: number) => {
      const endTime = performance.now();
      trackMetric(`component_render_${componentName}`, endTime - startTime);
    }
  };
};
