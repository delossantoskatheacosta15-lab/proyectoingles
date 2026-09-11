'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { IconSearch, IconClose } from '@/components/ui/Icons';
import { formatCOP, cn } from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';
import type { ProductDTO } from '@/lib/types';

type Suggestions = {
  products: ProductDTO[];
  categories: { id: string; name: string; slug: string }[];
  total: number;
};

export function SearchBar({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Suggestions>({ products: [], categories: [], total: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (term.trim().length < 2) {
      setData({ products: [], categories: [], total: 0 });
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/buscar?q=${encodeURIComponent(term.trim())}`);
        const json = await response.json();
        if (json.ok) setData(json.data);
      } catch {
        setData({ products: [], categories: [], total: 0 });
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/productos?q=${encodeURIComponent(term.trim())}`);
  };

  const go = (href: string) => {
    setOpen(false);
    setTerm('');
    onNavigate?.();
    router.push(href);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={submit} className="relative">
        <input
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="BUSCAR VESTIDOS, BLUSAS, ZAPATOS…"
          aria-label="BUSCAR PRODUCTOS"
          className={cn(
            'w-full border bg-transparent py-2.5 pl-10 pr-9 text-[11px] tracking-wider2 outline-none transition-colors',
            variant === 'desktop'
              ? 'border-white/25 text-white placeholder:text-white/45 focus:border-rose-500'
              : 'border-smoke-300 text-ink-900 placeholder:text-smoke-500 focus:border-rose-500'
          )}
        />
        <IconSearch
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
            variant === 'desktop' ? 'text-white/60' : 'text-smoke-500'
          )}
        />
        {term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            aria-label="LIMPIAR BÚSQUEDA"
            className={cn(
              'absolute right-2.5 top-1/2 -translate-y-1/2',
              variant === 'desktop' ? 'text-white/60 hover:text-rose-400' : 'text-smoke-500 hover:text-rose-500'
            )}
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && term.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto border border-smoke-300 bg-white shadow-lift animate-scale-in">
          {loading && (
            <div className="px-4 py-5 text-[10px] font-semibold tracking-brand text-smoke-600">
              BUSCANDO…
            </div>
          )}

          {!loading && data.products.length === 0 && data.categories.length === 0 && (
            <div className="px-4 py-6 text-center text-[10px] font-semibold tracking-brand text-smoke-600">
              {MESSAGES.noResults}
            </div>
          )}

          {!loading && data.categories.length > 0 && (
            <div className="border-b border-smoke-200 px-4 py-3">
              <p className="label-xs mb-2">CATEGORÍAS</p>
              <div className="flex flex-wrap gap-2">
                {data.categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => go(`/productos?categoria=${c.slug}`)}
                    className="badge bg-smoke-200 text-ink-800 transition-colors hover:bg-rose-500 hover:text-white"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading &&
            data.products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => go(`/producto/${p.slug}`)}
                className="flex w-full items-center gap-3 border-b border-smoke-200 px-4 py-3 text-left transition-colors hover:bg-smoke-100"
              >
                <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-smoke-200">
                  <SafeImage src={p.images[0]} alt={p.name} sizes="44px" label={p.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium tracking-wide text-ink-900">{p.name}</p>
                  <p className="text-[9px] tracking-brand text-smoke-600">{p.category.name}</p>
                </div>
                <span className="text-[11px] font-semibold tracking-wider2 text-rose-500">
                  {formatCOP(p.price)}
                </span>
              </button>
            ))}

          {!loading && data.total > 0 && (
            <button
              type="button"
              onClick={() => go(`/productos?q=${encodeURIComponent(term.trim())}`)}
              className="w-full bg-ink-950 px-4 py-3.5 text-[10px] font-semibold tracking-brand text-white transition-colors hover:bg-rose-500"
            >
              VER TODOS LOS RESULTADOS ({data.total})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
