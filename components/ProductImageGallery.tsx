'use client';

import { useState, useEffect } from 'react';
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

export default function ProductImageGallery({ 
  mainImage, 
  galleryImages, 
  productName 
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const allImages = [
    mainImage,
    ...(galleryImages?.nodes || [])
  ];

  // Preload all images for instant switching
  useEffect(() => {
    allImages.forEach((image) => {
      const img = new window.Image();
      img.src = image.sourceUrl;
    });
  }, [allImages]);

  const handleImageChange = (index: number) => {
    if (index === selectedImage) return;
    setIsTransitioning(true);
    setSelectedImage(index);
    setTimeout(() => setIsTransitioning(false), 150);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden bg-white rounded-[5px]">
        <Image
          src={allImages[selectedImage]?.sourceUrl || '/placeholder.png'}
          alt={allImages[selectedImage]?.altText || productName}
          fill
          className={`object-cover transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          priority
          sizes="(max-width: 768px) 100vw, 66vw"
          quality={95}
        />
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`relative aspect-square overflow-hidden bg-white rounded-[5px] border-2 transition-all ${
                selectedImage === index
                  ? 'border-gray-400'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.sourceUrl}
                alt={image.altText || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
                quality={80}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

