import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  readonly?: boolean;
}

export function StarRating({ rating, onRatingChange, disabled, readonly }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && !readonly && onRatingChange(star)}
          onMouseEnter={() => !disabled && !readonly && setHoverRating(star)}
          onMouseLeave={() => !disabled && !readonly && setHoverRating(0)}
          disabled={disabled}
          className="transition-colors"
        >
          <Star
            className={`h-6 w-6 ${
              star <= displayRating
                ? 'fill-[#F59E0B] text-[#F59E0B]'
                : 'text-[#E5E7EB]'
            } ${!disabled && !readonly ? 'cursor-pointer' : ''}`}
          />
        </button>
      ))}
    </div>
  );
}
