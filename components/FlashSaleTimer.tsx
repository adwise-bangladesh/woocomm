'use client';

import { useState, useEffect } from 'react';

export default function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white text-red-600 font-bold text-xl px-3 py-2 rounded-lg min-w-[50px] text-center shadow-sm">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs text-white mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold mr-2">Ends in:</span>
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className="text-white text-xl">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" />
      <span className="text-white text-xl">:</span>
      <TimeBox value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
