import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';

interface ProductCardFlashProps {
  product: Product;
}

export default function ProductCardFlash({ product }: ProductCardFlashProps) {
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

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden relative"
    >
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discount}%
        </div>
      )}

      {/* Express Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 7H7v6h6V7z" />
            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
          </svg>
          Express
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image?.sourceUrl || '/placeholder.png'}
          alt={product.image?.altText || product.name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="text-xs text-gray-600">4.5</span>
        </div>

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price || product.regularPrice)}
            </span>
          )}
        </div>

        {/* Buy Button */}
        <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
          Buy Now
        </button>
      </div>
    </Link>
  );
}
