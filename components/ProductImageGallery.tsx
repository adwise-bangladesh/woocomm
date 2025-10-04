'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';

interface GalleryImage {
  sourceUrl: string;
  altText?: string;
}

interface ProductImageGalleryProps {
  mainImage: GalleryImage;
  galleryImages?: { nodes: GalleryImage[] };
  productName: string;
}

const ProductImageGallery = memo(function ProductImageGallery({ 
  mainImage, 
  galleryImages, 
  productName 
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const allImages = useMemo(() => [
    mainImage,
    ...(galleryImages?.nodes || [])
  ], [mainImage, galleryImages]);

  // Reset selected image when main image changes (variant selection)
  useEffect(() => {
    setSelectedImage(0);
  }, [mainImage.sourceUrl]);

  // Lazy load images only when needed
  useEffect(() => {
    // Only preload the first 3 images for better performance
    const imagesToPreload = allImages.slice(0, 3);
    imagesToPreload.forEach((image) => {
      const img = new window.Image();
      img.src = image.sourceUrl;
    });
  }, [allImages]);

  const handleImageChange = (index: number) => {
    if (index === selectedImage) return;
    
    setIsTransitioning(true);
    setSelectedImage(index);
    
    // Smooth transition with proper timing
    setTimeout(() => setIsTransitioning(false), 200);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden bg-white rounded-[5px]">
        <Image
          src={allImages[selectedImage]?.sourceUrl || '/placeholder.png'}
          alt={allImages[selectedImage]?.altText || productName}
          fill
          className={`object-cover transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`relative aspect-square overflow-hidden bg-white rounded-[5px] border-2 transition-all duration-200 ${
                selectedImage === index
                  ? 'border-orange-500 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
              }`}
              style={selectedImage === index ? { borderColor: '#fe6c06' } : {}}
              onMouseEnter={(e) => {
                if (selectedImage !== index) {
                  (e.target as HTMLElement).style.borderColor = '#fe6c06';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedImage !== index) {
                  (e.target as HTMLElement).style.borderColor = '';
                }
              }}
            >
              <Image
                src={image.sourceUrl}
                alt={image.altText || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
                quality={75}
                loading={index < 3 ? "eager" : "lazy"}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default ProductImageGallery;

