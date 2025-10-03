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
  
  // Generate consistent random rating based on product ID
  const productIdHash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
  
  // Generate consistent random review count based on product ID
  const reviewCount = 700 + (productIdHash % 1801);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white hover:shadow-md transition-shadow overflow-hidden relative"
      prefetch={false}
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
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const starRating = i + 1;
              const filled = starRating <= Math.floor(rating);
              const halfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;
              
              return (
                <div key={i} className="relative inline-block">
                  <Star className="w-4 h-4 text-gray-300" />
                  {(filled || halfFilled) && (
                    <Star 
                      className={`w-4 h-4 absolute top-0 left-0 text-yellow-400 ${
                        halfFilled ? 'fill-current' : 'fill-current'
                      }`}
                      style={halfFilled ? { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' } : {}}
                    />
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
