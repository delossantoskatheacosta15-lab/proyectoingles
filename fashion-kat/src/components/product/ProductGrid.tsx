import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { MESSAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ProductDTO } from '@/lib/types';

export function ProductGrid({
  products,
  columns = 4,
  emptyTitle = MESSAGES.noResults,
  emptyDescription = 'PRUEBA CON OTRAS PALABRAS O AJUSTA LOS FILTROS.',
  priorityCount = 4,
}: {
  products: ProductDTO[];
  columns?: 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText="VER TODOS LOS PRODUCTOS"
        actionHref="/productos"
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6',
        columns === 4 ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3'
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
