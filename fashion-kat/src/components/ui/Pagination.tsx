'use client';

import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  const push = (value: number | '…') => pages.push(value);

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (page > 3) push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i);
    if (page < totalPages - 2) push('…');
    push(totalPages);
  }

  return (
    <nav className={cn('flex items-center justify-center gap-1.5', className)} aria-label="PAGINACIÓN">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-ghost btn-sm disabled:opacity-30"
      >
        ANTERIOR
      </button>
      {pages.map((p, index) =>
        p === '…' ? (
          <span key={`gap-${index}`} className="px-2 text-[11px] text-smoke-500">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-9 min-w-9 px-3 text-[11px] font-semibold tracking-wider2 transition-colors',
              p === page
                ? 'bg-ink-950 text-white'
                : 'border border-smoke-300 bg-white text-ink-700 hover:border-ink-950'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn-ghost btn-sm disabled:opacity-30"
      >
        SIGUIENTE
      </button>
    </nav>
  );
}
