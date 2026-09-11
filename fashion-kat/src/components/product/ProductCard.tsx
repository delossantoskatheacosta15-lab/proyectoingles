'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import { Rating } from '@/components/ui/Rating';
import { IconHeart, IconBag } from '@/components/ui/Icons';
import { useStore } from '@/components/providers/StoreProvider';
import { formatCOP, cn } from '@/lib/utils';
import type { ProductDTO } from '@/lib/types';

export function ProductCard({
  product,
  priority = false,
  compact = false,
}: {
  product: ProductDTO;
  priority?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useStore();
  const favorite = isFavorite(product.id);
  const soldOut = product.stock <= 0 || product.status === 'AGOTADO';

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-smoke-200">
        <Link href={`/producto/${product.slug}`} aria-label={product.name}>
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              priority={priority}
              label={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          {product.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <SafeImage
                src={product.images[1]}
                alt={`${product.name} — VISTA ALTERNA`}
                label={product.name}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          )}
        </Link>

        {/* ETIQUETAS */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut && <span className="badge bg-ink-950 text-white">AGOTADO</span>}
          {!soldOut && product.discountPercent > 0 && (
            <span className="badge-rose">-{product.discountPercent}%</span>
          )}
          {!soldOut && product.isNew && <span className="badge bg-white text-ink-950">NUEVO</span>}
        </div>

        {/* FAVORITOS */}
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={favorite ? 'QUITAR DE FAVORITOS' : 'AGREGAR A FAVORITOS'}
          aria-pressed={favorite}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white/95 backdrop-blur transition-colors',
            favorite ? 'text-rose-500' : 'text-ink-700 hover:text-rose-500'
          )}
        >
          <IconHeart filled={favorite} className="h-4 w-4" />
        </button>

        {/* ACCIÓN RÁPIDA */}
        {!compact && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => router.push(`/producto/${product.slug}`)}
              className="flex w-full items-center justify-center gap-2 bg-ink-950 py-3.5 text-[10px] font-semibold tracking-brand text-white transition-colors hover:bg-rose-500 disabled:bg-smoke-500"
            >
              <IconBag className="h-4 w-4" />
              {soldOut ? 'AGOTADO' : 'VER PRODUCTO'}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3.5">
        <p className="text-[9px] tracking-brand text-smoke-500">{product.category.name}</p>
        <Link
          href={`/producto/${product.slug}`}
          className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-relaxed tracking-wider2 text-ink-900 transition-colors hover:text-rose-500"
        >
          {product.name}
        </Link>

        {product.reviewCount > 0 && (
          <Rating value={product.rating} count={product.reviewCount} className="mt-2" />
        )}

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-[13px] font-semibold tracking-wider2 text-rose-500">
            {formatCOP(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[10px] tracking-wider2 text-smoke-500 line-through">
              {formatCOP(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
