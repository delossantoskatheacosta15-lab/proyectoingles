'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { IconHeart } from '@/components/ui/Icons';
import { useStore } from '@/components/providers/StoreProvider';
import type { ProductDTO } from '@/lib/types';

export function FavoritesView() {
  const { favorites, ready } = useStore();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (favorites.length === 0) {
          if (!cancelled) setProducts([]);
          return;
        }
        const response = await fetch('/api/productos/lote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: favorites }),
        });
        const json = await response.json();
        if (!cancelled) setProducts(json.ok ? json.data.products : []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, favorites]);

  return (
    <div className="container-fk py-12">
      <p className="eyebrow">TU SELECCIÓN</p>
      <h1 className="heading-lg mt-3 text-ink-950">MIS FAVORITOS</h1>
      <p className="mt-3 text-[11px] tracking-brand text-smoke-600">
        {favorites.length} {favorites.length === 1 ? 'PRODUCTO GUARDADO' : 'PRODUCTOS GUARDADOS'}
      </p>

      <div className="mt-10">
        {loading || !ready ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            title="AÚN NO TIENES FAVORITOS"
            description="TOCA EL CORAZÓN EN CUALQUIER PRODUCTO PARA GUARDARLO AQUÍ Y ENCONTRARLO FÁCILMENTE DESPUÉS."
            actionText="EXPLORAR PRODUCTOS"
            actionHref="/productos"
            icon={<IconHeart className="h-6 w-6" />}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
