import Link from 'next/link';

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon,
}: {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-smoke-300 bg-smoke-100 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-card">
        {icon ?? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01M9 15c.8-.7 1.8-1 3-1s2.2.3 3 1" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="text-[12px] font-semibold tracking-brand text-ink-950">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-[11px] leading-relaxed tracking-wide text-smoke-600">
          {description}
        </p>
      )}
      {actionText && actionHref && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionText}
        </Link>
      )}
    </div>
  );
}
