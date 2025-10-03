'use client';

import OrderNowButton from './OrderNowButton';

interface AnimatedOrderButtonProps {
  productId: number;
  variationId?: number;
  disabled?: boolean;
}

export default function AnimatedOrderButton({ productId, variationId, disabled }: AnimatedOrderButtonProps) {
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-btn {
          animation: pulse 1100ms infinite;
        }
      `}</style>
      <div className="animate-pulse-btn">
        <OrderNowButton 
          productId={productId}
          variationId={variationId}
          disabled={disabled} 
        />
      </div>
    </>
  );
}

