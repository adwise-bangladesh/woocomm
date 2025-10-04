'use client';

import { useEffect, useRef } from 'react';
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
  const trackedCategoryRef = useRef<Set<string>>(new Set()); // Prevent duplicate category tracking

  useEffect(() => {
    if (categoryName) {
      // Prevent duplicate category tracking - SINGLE tracking point
      const categoryKey = `category_${categoryName}_${categoryId || 'no-id'}`;
      if (!trackedCategoryRef.current.has(categoryKey)) {
        trackCategory(categoryName, categoryId);
        trackedCategoryRef.current.add(categoryKey);
      }
    }
  }, [categoryName, categoryId, trackCategory, productCount]);

  return null; // This component doesn't render anything
}
