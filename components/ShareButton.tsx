'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  productId: number | string;
}

export default function ShareButton({}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-medium transition-colors"
    >
      <Share2 className="w-3.5 h-3.5" />
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

