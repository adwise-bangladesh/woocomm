'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReelProduct {
  id: string;
  image: string;
  title: string;
  link: string;
}

export default function ShopReel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const products: ReelProduct[] = [
    {
      id: '1',
      image: '/reel-1.jpg',
      title: 'hantover.com',
      link: '/product/1',
    },
    {
      id: '2',
      image: '/reel-2.jpg',
      title: 'hantover.com',
      link: '/product/2',
    },
    {
      id: '3',
      image: '/reel-3.jpg',
      title: 'hantover.com',
      link: '/product/3',
    },
    {
      id: '4',
      image: '/reel-4.jpg',
      title: 'hantover.com',
      link: '/product/4',
    },
    {
      id: '5',
      image: '/reel-5.jpg',
      title: 'Vibros Leather',
      link: '/product/5',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      setCurrentIndex(Math.min(products.length - 4, currentIndex + 1));
    }
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📹</span>
          <h2 className="text-2xl font-bold text-gray-900">Shop Reel</h2>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Products Grid */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-300"
              style={{ transform: `translateX(-${currentIndex * 25}%)` }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.link}
                  className="flex-shrink-0 w-[calc(25%-12px)] group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white border border-gray-200 group-hover:shadow-lg transition-shadow">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📦</span>
                    </div>
                    {/* Favorite Icon */}
                    <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm font-semibold flex items-center gap-1">
                        {product.title}
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          {currentIndex < products.length - 4 && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
