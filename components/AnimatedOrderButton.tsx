'use client';

import OrderNowButton from './OrderNowButton';

interface AnimatedOrderButtonProps {
  productId: number;
  disabled?: boolean;
}

export default function AnimatedOrderButton({ productId, disabled }: AnimatedOrderButtonProps) {
  return (
    <>
      <style jsx>{`
        @keyframes pulse-buy {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.7);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 0 8px rgba(13, 148, 136, 0);
          }
        }
        .animate-buy-now {
          animation: pulse-buy 2s infinite;
        }
      `}</style>
      <div className="animate-buy-now">
        <OrderNowButton 
          productId={productId} 
          disabled={disabled} 
        />
      </div>
    </>
  );
}

