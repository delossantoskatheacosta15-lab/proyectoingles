import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductBrowser } from '@/components/product/ProductBrowser';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { getFilterFacets } from '@/services/products';
import { listCategories } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PRODUCTOS',
  description:
    'EXPLORA TODO EL CATÁLOGO DE FASHION KAT: VESTIDOS, BLUSAS, PANTALONES, CONJUNTOS, ZAPATOS, BOLSOS Y ACCESORIOS.',
  alternates: { canonical: '/productos' },
};

export default async function ProductosPage() {
  const [facets, categories] = await Promise.all([getFilterFacets(), listCategories(true)]);

  return (
    <Suspense
      fallback={
        <div className="container-fk py-16">
          <ProductGridSkeleton count={12} />
        </div>
      }
    >
      <ProductBrowser facets={{ ...facets, categories }} title="TODOS LOS PRODUCTOS" />
    </Suspense>
  );
}
