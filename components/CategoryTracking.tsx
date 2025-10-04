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
  categorySlug: _categorySlug,
  productCount = 0 
}: CategoryTrackingProps) {
  const { trackCategory } = useFacebookPixel();

  useEffect(() => {
    if (categoryName) {
      // Track category view
      trackCategory(categoryName, categoryId);
    }
  }, [categoryName, categoryId, trackCategory, productCount]);

  return null; // This component doesn't render anything
}
