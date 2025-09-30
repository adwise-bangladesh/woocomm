'use client';

import Link from 'next/link';
import { Zap, Truck } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  animation: string;
}

export default function QuickLinks() {
  const links: QuickLink[] = [
    {
      id: '1',
      title: 'Flash Sale',
      subtitle: 'Up to 70% Off',
      icon: <Zap className="w-5 h-5" />,
      link: '/flash-sale',
      color: 'text-orange-500',
      animation: 'animate-flash',
    },
    {
      id: '2',
      title: 'Free Delivery',
      subtitle: 'On orders over Tk 500',
      icon: <Truck className="w-5 h-5" />,
      link: '/free-shipping',
      color: 'text-green-500',
      animation: 'animate-slide',
    },
  ];

  return (
    <>
      <style jsx>{`
        @keyframes flash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-flash {
          animation: flash 1s ease-in-out infinite;
        }
        .animate-slide {
          animation: slide 1.5s ease-in-out infinite;
        }
      `}</style>
      <section className="py-3 md:py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.link}
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className={`${link.color} ${link.animation} flex-shrink-0`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                    {link.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">
                    {link.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}