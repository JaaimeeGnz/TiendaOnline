import React from 'react';

interface DiscountBadgeProps {
  discountPercentage: number;
  originalPrice: number;
  showSavings?: boolean;
}

export default function DiscountBadge({
  discountPercentage,
  originalPrice,
  showSavings = true,
}: DiscountBadgeProps) {
  const savingsCents = Math.round(originalPrice * (discountPercentage / 100));
  const savingsPrice = (savingsCents / 100).toFixed(2);

  return (
    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
      <div className="flex flex-col">
        <span className="font-bold text-sm">{discountPercentage}% descuento</span>
        {showSavings && (
          <span className="text-xs">Ahorras €{savingsPrice}</span>
        )}
      </div>
    </div>
  );
}
