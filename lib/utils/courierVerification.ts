// Courier verification utility for customer order history check

interface CourierData {
  'Total Parcels'?: number;
  'Total Delivery'?: number;
  'Delivered Parcels'?: number;
  'Successful Delivery'?: number;
  'Canceled Parcels'?: number;
  'Canceled Delivery'?: number;
  [key: string]: unknown;
}

interface CourierSummaries {
  [courierName: string]: CourierData;
}

interface NormalizedCourier {
  courier: string;
  total: number;
  delivered: number;
  canceled: number;
}

interface OrderTotals {
  totalParcels: number;
  totalDelivered: number;
  totalCanceled: number;
}

interface VerificationResult {
  allowed: boolean;
  reason: string;
  totals?: OrderTotals;
  successRate?: number;
}

// Admin/Test numbers that bypass verification (last 4 digits for privacy)
const BYPASS_NUMBERS = ['6644575', '0000000', '1111111']; // Add more as needed

// Cache for verification results (5 minutes TTL)
const verificationCache = new Map<string, { result: VerificationResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a phone number should bypass verification
 */
export function shouldBypassVerification(phone: string): boolean {
  return BYPASS_NUMBERS.some(bypass => phone.endsWith(bypass));
}

/**
 * Normalize courier data from different formats
 */
function normalizeData(summaries: CourierSummaries): NormalizedCourier[] {
  const normalized: NormalizedCourier[] = [];
  
  for (const [courier, data] of Object.entries(summaries)) {
    const totalParcels = data['Total Parcels'] || data['Total Delivery'] || 0;
    const deliveredParcels = data['Delivered Parcels'] || data['Successful Delivery'] || 0;
    const canceledParcels = data['Canceled Parcels'] || data['Canceled Delivery'] || 0;
    
    normalized.push({
      courier,
      total: totalParcels,
      delivered: deliveredParcels,
      canceled: canceledParcels
    });
  }
  
  return normalized;
}

/**
 * Calculate totals across all couriers
 */
function calculateTotals(normalized: NormalizedCourier[]): OrderTotals {
  return normalized.reduce((acc, courier) => ({
    totalParcels: acc.totalParcels + courier.total,
    totalDelivered: acc.totalDelivered + courier.delivered,
    totalCanceled: acc.totalCanceled + courier.canceled
  }), { totalParcels: 0, totalDelivered: 0, totalCanceled: 0 });
}

/**
 * Calculate success rate
 */
function calculateSuccessRate(totals: OrderTotals): number {
  if (totals.totalParcels === 0) return 100; // New customer = 100% eligible
  return (totals.totalDelivered / totals.totalParcels) * 100;
}

/**
 * Determine if customer can place order based on history
 */
function canPlaceOrder(totals: OrderTotals, successRate: number): VerificationResult {
  const { totalParcels } = totals;
  
  // Rule 1: New customer (0 orders) - ALLOW
  if (totalParcels === 0) {
    return { 
      allowed: true, 
      reason: 'New customer - Welcome!',
      totals,
      successRate
    };
  }
  
  // Rule 2: 1-3 orders, need 30%+ success rate
  if (totalParcels >= 1 && totalParcels <= 3) {
    if (successRate >= 30) {
      return { 
        allowed: true, 
        reason: `Verified customer - Success rate: ${successRate.toFixed(1)}%`,
        totals,
        successRate
      };
    } else {
      return { 
        allowed: false, 
        reason: `Your success rate is ${successRate.toFixed(1)}%. We require at least 30% for customers with 1-3 orders. Please contact support if you believe this is an error.`,
        totals,
        successRate
      };
    }
  }
  
  // Rule 3: 4+ orders, need 50%+ success rate
  if (totalParcels > 3) {
    if (successRate >= 50) {
      return { 
        allowed: true, 
        reason: `Verified customer - Success rate: ${successRate.toFixed(1)}%`,
        totals,
        successRate
      };
    } else {
      return { 
        allowed: false, 
        reason: `Your success rate is ${successRate.toFixed(1)}%. We require at least 50% for customers with 4+ orders. Due to repeated order cancellations, we cannot process your order at this time.`,
        totals,
        successRate
      };
    }
  }
  
  return { 
    allowed: false, 
    reason: 'Unable to verify order history. Please contact support.',
    totals,
    successRate
  };
}

/**
 * Get cached verification result
 */
function getCachedResult(phone: string): VerificationResult | null {
  const cached = verificationCache.get(phone);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    verificationCache.delete(phone);
    return null;
  }
  
  return cached.result;
}

/**
 * Set cached verification result
 */
function setCachedResult(phone: string, result: VerificationResult): void {
  verificationCache.set(phone, {
    result,
    timestamp: Date.now()
  });
}

/**
 * Main function to verify customer order history
 */
export async function verifyCustomerHistory(phone: string): Promise<VerificationResult> {
  try {
    // Check if number should bypass verification
    if (shouldBypassVerification(phone)) {
      return {
        allowed: true,
        reason: 'Verified account',
        totals: { totalParcels: 0, totalDelivered: 0, totalCanceled: 0 },
        successRate: 100
      };
    }
    
    // Check cache first
    const cached = getCachedResult(phone);
    if (cached) {
      return cached;
    }
    
    // Make API request
    const apiUrl = `https://dash.hoorin.com/api/courier/search.php?apiKey=41730dcec62d82e18a9788&searchTerm=${phone}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Courier API error:', response.status);
      // If API fails, allow the order
      return {
        allowed: true,
        reason: 'Verification unavailable - Order allowed',
        totals: { totalParcels: 0, totalDelivered: 0, totalCanceled: 0 },
        successRate: 100
      };
    }
    
    const data = await response.json();
    
    // Check if we have valid summaries
    if (!data.Summaries || typeof data.Summaries !== 'object') {
      console.warn('Invalid API response format');
      // Allow order if API response is invalid
      return {
        allowed: true,
        reason: 'New customer - Welcome!',
        totals: { totalParcels: 0, totalDelivered: 0, totalCanceled: 0 },
        successRate: 100
      };
    }
    
    // Process the data
    const normalized = normalizeData(data.Summaries);
    const totals = calculateTotals(normalized);
    const successRate = calculateSuccessRate(totals);
    const result = canPlaceOrder(totals, successRate);
    
    // Cache the result
    setCachedResult(phone, result);
    
    return result;
    
  } catch (error) {
    console.error('Error verifying customer history:', error);
    // If any error occurs, allow the order
    return {
      allowed: true,
      reason: 'Verification unavailable - Order allowed',
      totals: { totalParcels: 0, totalDelivered: 0, totalCanceled: 0 },
      successRate: 100
    };
  }
}

/**
 * Clear verification cache (useful for testing)
 */
export function clearVerificationCache(): void {
  verificationCache.clear();
}

