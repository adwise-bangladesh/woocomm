'use client';

import { useEffect } from 'react';
import { useFacebookPixel } from '@/hooks/useFacebookPixel';

interface CategoryTrackingProps {
  categoryName: string;
  categoryId?: string;
  categorySlug?: string;
  productCount?: number;
}

export default function CategoryTracking({ 
  categoryName, 
  categoryId, 
  categorySlug,
  productCount = 0 
}: CategoryTrackingProps) {
  const { trackCategory } = useFacebookPixel();

  useEffect(() => {
    if (categoryName) {
      // Track category view
      trackCategory(categoryName, categoryId);
      console.log(`Facebook Pixel: Category view tracked for "${categoryName}" (${productCount} products)`);
    }
  }, [categoryName, categoryId, trackCategory, productCount]);

  return null; // This component doesn't render anything
}
