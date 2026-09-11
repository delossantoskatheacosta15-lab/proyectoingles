import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { getFilterFacets } from '@/services/products';
import { listCategories } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'OFERTAS',
  description: 'APROVECHA LAS OFERTAS DE LA SEMANA EN FASHION KAT. PRECIOS ESPECIALES POR TIEMPO LIMITADO.',
  alternates: { canonical: '/ofertas' },
};

export default async function OfertasPage() {
  const [facets, categories] = await Promise.all([getFilterFacets(), listCategories(true)]);

  return (
    <>
      <section className="border-b border-smoke-300 bg-ink-950 py-16 text-white">
        <div className="container-fk">
          <p className="eyebrow">POR TIEMPO LIMITADO</p>
          <h1 className="heading-xl mt-4">OFERTAS DE LA SEMANA</h1>
          <p className="mt-4 max-w-xl text-[11px] leading-relaxed tracking-brand text-white/65">
            PRENDAS SELECCIONADAS CON PRECIOS ESPECIALES. LAS EXISTENCIAS SON LIMITADAS.
          </p>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="container-fk py-16">
            <ProductGridSkeleton count={12} />
          </div>
        }
      >
        <ProductBrowser facets={{ ...facets, categories }} lockedFilters={{ oferta: 'true' }} />
      </Suspense>
    </>
  );
}
