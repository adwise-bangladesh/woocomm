import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import { Zap } from 'lucide-react';

interface FlashSaleSectionProps {
  products: Product[];
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-500 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Flash Sale</h2>
          <div className="ml-auto bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Limited Time Only!
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
