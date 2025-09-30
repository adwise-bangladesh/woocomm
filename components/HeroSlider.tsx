'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ACFSliderData {
  image?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  title?: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
}

interface SliderImage {
  id: string;
  title?: string;
  acfSlider?: ACFSliderData;
}

interface HeroSliderProps {
  images: SliderImage[];
}

export default function HeroSlider({ images }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // If no images provided, use placeholder
  const slides = images.length > 0 ? images : [
    {
      id: '1',
      acfSlider: {
        image: { node: { sourceUrl: '/placeholder.png', altText: 'Slider 1' } },
        title: 'Welcome to Zonash',
        subtitle: 'Discover amazing products at great prices',
      },
    },
    {
      id: '2',
      acfSlider: {
        image: { node: { sourceUrl: '/placeholder.png', altText: 'Slider 2' } },
        title: 'Amazing Products',
        subtitle: 'Shop the latest trends',
      },
    },
    {
      id: '3',
      acfSlider: {
        image: { node: { sourceUrl: '/placeholder.png', altText: 'Slider 3' } },
        title: 'Great Deals',
        subtitle: 'Save big on your favorite items',
      },
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div 
      className="relative w-full h-[150px] md:h-[300px] lg:h-[400px] overflow-hidden rounded-[5px] bg-gray-100 shadow-md"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const acf = slide.acfSlider;
        if (!acf?.image?.node) return null;

        const isActive = index === currentSlide;
        
        const slideContent = (
          <Image
            src={acf.image.node.sourceUrl}
            alt={acf.image.node.altText || 'Slider image'}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
        );

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 ${isActive ? 'block' : 'hidden'}`}
          >
            {acf.link ? (
              <Link href={acf.link} className="block w-full h-full relative">
                {slideContent}
              </Link>
            ) : (
              <div className="block w-full h-full relative">
                {slideContent}
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={goToPrevious}
        className="hidden md:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 md:p-2 rounded-full shadow-lg transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="hidden md:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 md:p-2 rounded-full shadow-lg transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/60 w-1.5 md:w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
