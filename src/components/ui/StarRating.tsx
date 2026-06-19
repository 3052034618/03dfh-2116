import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { star: 'w-3.5 h-3.5', gap: 'gap-0.5' },
  md: { star: 'w-5 h-5', gap: 'gap-1' },
  lg: { star: 'w-7 h-7', gap: 'gap-1.5' },
};

export default function StarRating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue !== null ? hoverValue : value;
  const sizes = sizeMap[size];

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index + 1);
  };

  const handleMouseMove = (index: number, e: React.MouseEvent) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverValue(isHalf ? index + 0.5 : index + 1);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFull = displayValue >= starValue;
    const isHalf = !isFull && displayValue >= starValue - 0.5;

    return (
      <div
        key={index}
        className={cn(
          'star relative',
          !readOnly && onChange && 'cursor-pointer hover:scale-110',
          isFull || isHalf ? 'star-active' : 'star-inactive'
        )}
        onClick={() => handleClick(index)}
        onMouseMove={(e) => handleMouseMove(index, e)}
        onMouseLeave={handleMouseLeave}
      >
        {isHalf ? (
          <StarHalf className={sizes.star} fill="currentColor" />
        ) : (
          <Star className={sizes.star} fill={isFull ? 'currentColor' : 'none'} />
        )}
      </div>
    );
  };

  return (
    <div className={cn('inline-flex items-center', sizes.gap)}>
      {Array.from({ length: max }, (_, i) => renderStar(i))}
    </div>
  );
}
