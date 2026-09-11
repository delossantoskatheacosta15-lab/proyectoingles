'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[18px] font-semibold tracking-brand text-ink-950">{title}</h1>
        {description && (
          <p className="mt-2 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = false,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  href?: string;
}) {
  const content = (
    <div
      className={cn(
        'border bg-white p-5 transition-shadow',
        accent ? 'border-rose-500' : 'border-smoke-300',
        href && 'hover:shadow-card'
      )}
    >
      <p className="text-[9px] font-semibold tracking-brand text-smoke-500">{label}</p>
      <p
        className={cn(
          'mt-2.5 text-xl font-semibold tracking-wider2',
          accent ? 'text-rose-500' : 'text-ink-950'
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border border-smoke-300 bg-white', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-smoke-200 px-5 py-4">
          {title && <h2 className="text-[11px] font-semibold tracking-brand text-ink-950">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'rose' | 'green' | 'amber' | 'red' | 'dark';
}) {
  const tones = {
    neutral: 'bg-smoke-200 text-ink-700',
    rose: 'bg-rose-500 text-white',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    dark: 'bg-ink-950 text-white',
  };
  return <span className={cn('badge', tones[tone])}>{children}</span>;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'BUSCAR…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="field w-full py-2.5 text-[10px] sm:w-64"
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="field w-auto py-2.5 pr-8 text-[10px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-smoke-300 bg-white">
      <table className="admin-table min-w-[720px]">{children}</table>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-semibold tracking-brand text-red-700">
      {message}
    </p>
  );
}
