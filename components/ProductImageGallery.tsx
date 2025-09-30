'use client';

import { useState } from 'react';
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
  
  const allImages = [
    mainImage,
    ...(galleryImages?.nodes || [])
  ];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-gray-200">
        <Image
          src={allImages[selectedImage]?.sourceUrl || '/placeholder.png'}
          alt={allImages[selectedImage]?.altText || productName}
          fill
          className="object-contain p-4"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-white border-2 transition-all ${
                selectedImage === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.sourceUrl}
                alt={image.altText || `${productName} ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

