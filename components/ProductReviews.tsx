'use client';

import { Star } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  // Generate consistent rating based on product ID (same as ProductCard)
  const productIdHash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = parseFloat((4.2 + ((productIdHash % 80) / 100)).toFixed(1));
  const reviewCount = 700 + (productIdHash % 1801);
  
  // Calculate rating distribution
  const fiveStarPercent = Math.round(rating >= 4.8 ? 70 : rating >= 4.5 ? 60 : 45);
  const fourStarPercent = Math.round(rating >= 4.5 ? 25 : 30);
  const threeStarPercent = Math.round(100 - fiveStarPercent - fourStarPercent - 5 - 3);

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < count
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Rating Overview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">{rating}</div>
            <div className="flex justify-center mb-2">
              {renderStars(5)}
            </div>
            <p className="text-gray-600">{reviewCount.toLocaleString()} reviews</p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {[
              { stars: 5, percent: fiveStarPercent },
              { stars: 4, percent: fourStarPercent },
              { stars: 3, percent: threeStarPercent },
              { stars: 2, percent: 5 },
              { stars: 1, percent: 3 },
            ].map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-12">{item.stars} star</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Reviews */}
        <div className="space-y-4">
          {[
            { name: 'Sarah K.', rating: 5, date: '2 days ago', text: 'Excellent product! Exactly as described and fast delivery.' },
            { name: 'Mike R.', rating: 4, date: '1 week ago', text: 'Good quality, worth the price. Would recommend.' },
            { name: 'Priya S.', rating: 5, date: '2 weeks ago', text: 'Very satisfied with this purchase. Great value for money!' },
          ].map((review, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{review.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

