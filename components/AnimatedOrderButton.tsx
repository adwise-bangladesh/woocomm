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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-btn {
          animation: pulse 1100ms infinite;
        }
      `}</style>
      <div className="animate-pulse-btn">
        <OrderNowButton 
          productId={productId} 
          disabled={disabled} 
        />
      </div>
    </>
  );
}

