'use client';

import Link from 'next/link';
import { Zap, Truck, Gift } from 'lucide-react';

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
      icon: <Zap className="w-6 h-6" />,
      link: '/flash-sale',
      color: 'text-orange-500',
      animation: 'animate-flash',
    },
    {
      id: '2',
      title: 'Free Delivery',
      subtitle: 'On orders over Tk 500',
      icon: <Truck className="w-6 h-6" />,
      link: '/free-shipping',
      color: 'text-green-500',
      animation: 'animate-slide',
    },
    {
      id: '3',
      title: 'Special Offers',
      subtitle: 'Limited Time',
      icon: <Gift className="w-6 h-6" />,
      link: '/offers',
      color: 'text-blue-500',
      animation: 'animate-blink',
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
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-flash {
          animation: flash 1s ease-in-out infinite;
        }
        .animate-slide {
          animation: slide 1.5s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 2s ease-in-out infinite;
        }
      `}</style>
      <section className="py-4 md:py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.link}
                className="flex flex-col items-center justify-center p-3 md:p-5 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className={`mb-2 ${link.color} ${link.animation}`}>
                  {link.icon}
                </div>
              <h3 className="text-xs md:text-sm font-bold text-gray-900 text-center mb-0.5">
                {link.title}
              </h3>
              <p className="text-[10px] md:text-xs text-gray-500 text-center">
                {link.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}