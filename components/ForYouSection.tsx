import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ForYouSectionProps {
  products: Product[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function ForYouSection({ products, onLoadMore, hasMore = true }: ForYouSectionProps) {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">💖</span>
          <h2 className="text-2xl font-bold text-gray-900">For You</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {hasMore && onLoadMore && (
          <div className="mt-8 text-center">
            <button
              onClick={onLoadMore}
              className="inline-block px-8 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
