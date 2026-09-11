'use client';

import { cn } from '@/lib/utils';

function Star({ filled, half, className }: { filled: boolean; half?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn('h-3.5 w-3.5', className)} aria-hidden="true">
      <defs>
        <linearGradient id="fk-half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
        fill={half ? 'url(#fk-half)' : filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Rating({
  value,
  count,
  size = 'sm',
  showValue = false,
  className,
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={cn('flex items-center gap-1.5 text-rose-500', className)}>
      <div className="flex items-center gap-0.5">
        {stars.map((s) => (
          <Star
            key={s}
            filled={value >= s}
            half={value > s - 1 && value < s}
            className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-[10px] font-semibold tracking-wider2 text-ink-700">
          {value.toFixed(1)}
        </span>
      )}
      {typeof count === 'number' && (
        <span className="text-[10px] tracking-wider2 text-smoke-600">
          ({count} {count === 1 ? 'RESEÑA' : 'RESEÑAS'})
        </span>
      )}
    </div>
  );
}

export function RatingInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1 text-rose-500', className)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-label={`CALIFICAR CON ${s} ESTRELLAS`}
          className="transition-transform hover:scale-110"
        >
          <Star filled={value >= s} className="h-6 w-6" />
        </button>
      ))}
    </div>
  );
}
