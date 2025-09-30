import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'Tk 0';
    const num = parseFloat(price.replace(/[^0-9.-]+/g, ''));
    return `Tk ${num.toFixed(0)}`;
  };

  const calculateDiscount = () => {
    if (!product.salePrice || !product.regularPrice) return null;
    const regular = parseFloat(product.regularPrice.replace(/[^0-9.-]+/g, ''));
    const sale = parseFloat(product.salePrice.replace(/[^0-9.-]+/g, ''));
    const discount = Math.round(((regular - sale) / regular) * 100);
    return discount;
  };

  const discount = calculateDiscount();
  
  // Generate random rating between 4.2 and 5.0
  const rating = parseFloat((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1));
  
  // Generate random review count between 700 and 2500
  const reviewCount = Math.floor(Math.random() * (2500 - 700 + 1)) + 700;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white hover:shadow-md transition-shadow overflow-hidden relative"
    >
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image?.sourceUrl || '/placeholder.png'}
          alt={product.image?.altText || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Product Title - Single Line */}
        <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price Section */}
        {(product.price || product.regularPrice || product.salePrice) && (
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="text-base font-bold text-red-600">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.regularPrice)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-red-600">
                {formatPrice(product.price || product.regularPrice)}
              </span>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="flex items-center gap-1">
          <div className="flex items-center relative">
            {[...Array(5)].map((_, i) => {
              const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
              
              return (
                <div key={i} className="relative w-4 h-4">
                  {/* Background star (empty) */}
                  <Star className="w-4 h-4 text-gray-300 absolute" />
                  {/* Foreground star (filled) with clip-path */}
                  {fillPercentage > 0 && (
                    <div 
                      style={{ 
                        clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-gray-600">
            {rating} ({reviewCount})
          </span>
        </div>
      </div>
    </Link>
  );
}
