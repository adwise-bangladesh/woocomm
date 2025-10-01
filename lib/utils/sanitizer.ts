/**
 * HTML Sanitization Utilities
 * Provides secure HTML sanitization for user-generated content
 */

// Basic HTML sanitization - removes dangerous tags and attributes
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  return html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags and content
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Remove inline event handlers (onclick, onload, etc.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    // Remove data URLs (can contain scripts)
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, '')
    // Remove style attributes (can contain expressions)
    .replace(/style\s*=\s*["'][^"']*["']/gi, '');
}

// Sanitize text content - strips all HTML tags
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
}

// Validate and sanitize product slug
export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  
  // Only allow alphanumeric, hyphens, and underscores
  // Max length 200 characters
  const slugRegex = /^[a-zA-Z0-9-_]{1,200}$/;
  return slugRegex.test(slug);
}

// Validate product ID
export function validateProductId(id: unknown): number | null {
  if (typeof id === 'number' && id > 0 && Number.isInteger(id)) {
    return id;
  }
  
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  
  return null;
}

// Sanitize price string
export function sanitizePrice(price: string | null | undefined): string {
  if (!price) return '0';
  
  // Extract only numbers, decimal points, and minus signs
  const cleaned = price.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  
  // Return 0 for invalid or negative prices
  if (isNaN(num) || num < 0) return '0';
  
  return num.toFixed(2);
}
