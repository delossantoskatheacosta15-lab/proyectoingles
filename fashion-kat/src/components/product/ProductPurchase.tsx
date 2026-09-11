'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useStore } from '@/components/providers/StoreProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Rating } from '@/components/ui/Rating';
import { SizeGuide } from '@/components/product/SizeGuide';
import { IconHeart, IconBag, IconCheck, IconPlus, IconMinus, IconTruck } from '@/components/ui/Icons';
import { formatCOP, cn } from '@/lib/utils';
import type { ProductDTO } from '@/lib/types';

export function ProductPurchase({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const { addItem, isFavorite, toggleFavorite } = useStore();
  const { error } = useToast();

  const variants = product.variants ?? [];
  const colors = useMemo(() => {
    const map = new Map<string, string>();
    variants.forEach((v) => map.set(v.color, v.colorHex));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);

  const [color, setColor] = useState<string>(colors[0]?.name ?? '');
  const [size, setSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // REGISTRA LA VISTA DEL PRODUCTO PARA LAS ANALÍTICAS
  useEffect(() => {
    void fetch('/api/analiticas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'VISTA_PRODUCTO', productId: product.id }),
    }).catch(() => undefined);
  }, [product.id]);

  const availableSizesForColor = useMemo(
    () => variants.filter((v) => v.color === color && v.stock > 0).map((v) => v.size),
    [variants, color]
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v.color === color && v.size === size) ?? null,
    [variants, color, size]
  );

  const hasVariants = variants.length > 0;
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const soldOut = product.stock <= 0 || product.status === 'AGOTADO';
  const needsSelection = hasVariants && (!size || !color);
  const price = product.price + (selectedVariant?.priceDiff ?? 0);
  const favorite = isFavorite(product.id);
  const lowStock = !soldOut && stock > 0 && stock <= 5;

  const handleAdd = (goToCart = false) => {
    if (soldOut) return;
    if (needsSelection) {
      error('SELECCIONA TALLA Y COLOR ANTES DE CONTINUAR.');
      return;
    }
    if (hasVariants && selectedVariant && selectedVariant.stock <= 0) {
      error('ESTA COMBINACIÓN ESTÁ AGOTADA.');
      return;
    }
    addItem(product.id, selectedVariant?.id ?? null, quantity);
    if (goToCart) router.push('/checkout');
  };

  const sizeKind = sizes.some((s) => /^\d+$/.test(s)) ? 'CALZADO' : 'ROPA';

  return (
    <div className="flex flex-col">
      <p className="text-[10px] tracking-brand text-smoke-500">
        {product.category.name}
        {product.subcategory ? ` · ${product.subcategory}` : ''}
      </p>

      <h1 className="heading-lg mt-3 text-ink-950">{product.name}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="text-[10px] tracking-brand text-smoke-500">SKU: {selectedVariant?.sku ?? product.sku}</span>
        {product.reviewCount > 0 ? (
          <Rating value={product.rating} count={product.reviewCount} showValue />
        ) : (
          <span className="text-[10px] tracking-brand text-smoke-500">AÚN SIN RESEÑAS</span>
        )}
      </div>

      {/* PRECIO */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <span className="text-3xl font-light tracking-wider2 text-rose-500">{formatCOP(price)}</span>
        {product.comparePrice && product.comparePrice > price && (
          <>
            <span className="text-[13px] tracking-wider2 text-smoke-500 line-through">
              {formatCOP(product.comparePrice)}
            </span>
            <span className="badge-rose mb-1">-{product.discountPercent}%</span>
          </>
        )}
      </div>

      <p className="mt-5 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
        {product.shortDescription}
      </p>

      {/* COLORES */}
      {colors.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-xs text-ink-800">COLOR: {color}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const anyStock = variants.some((v) => v.color === c.name && v.stock > 0);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setColor(c.name);
                    setSize('');
                  }}
                  aria-label={c.name}
                  title={c.name + (anyStock ? '' : ' — AGOTADO')}
                  className={cn(
                    'relative h-10 w-10 border transition-transform hover:scale-105',
                    color === c.name ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-smoke-300',
                    !anyStock && 'opacity-40'
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.name && (
                    <IconCheck
                      className={cn(
                        'absolute inset-0 m-auto h-4 w-4',
                        c.name === 'BLANCO' || c.name === 'BEIGE' ? 'text-ink-950' : 'text-white'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TALLAS */}
      {sizes.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-xs text-ink-800">TALLA{size ? `: ${size}` : ''}</p>
            <SizeGuide kind={sizeKind} />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const available = availableSizesForColor.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!available}
                  onClick={() => setSize(s)}
                  className={cn(
                    'min-w-[52px] border px-4 py-3 text-[11px] font-semibold tracking-wider2 transition-colors',
                    size === s
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-smoke-300 bg-white text-ink-800 hover:border-ink-950',
                    !available && 'cursor-not-allowed border-smoke-200 text-smoke-400 line-through hover:border-smoke-200'
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DISPONIBILIDAD */}
      <div className="mt-7 flex items-center gap-2.5">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            soldOut ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-emerald-500'
          )}
        />
        <span className="text-[10px] font-semibold tracking-brand text-ink-800">
          {soldOut
            ? 'AGOTADO'
            : needsSelection
              ? 'SELECCIONA TALLA Y COLOR PARA VER LA DISPONIBILIDAD'
              : lowStock
                ? `¡ÚLTIMAS ${stock} UNIDADES!`
                : `DISPONIBLE · ${stock} UNIDADES`}
        </span>
      </div>

      {/* CANTIDAD Y ACCIONES */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex items-center border border-smoke-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="DISMINUIR CANTIDAD"
            className="flex h-12 w-12 items-center justify-center text-ink-700 transition-colors hover:text-rose-500"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-[12px] font-semibold tracking-wider2">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock || 50, q + 1))}
            aria-label="AUMENTAR CANTIDAD"
            className="flex h-12 w-12 items-center justify-center text-ink-700 transition-colors hover:text-rose-500"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleAdd(false)}
          disabled={soldOut}
          className="btn-dark h-12 flex-1 min-w-[200px] disabled:bg-smoke-400"
        >
          <IconBag className="h-4 w-4" />
          {soldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
        </button>

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={favorite ? 'QUITAR DE FAVORITOS' : 'AGREGAR A FAVORITOS'}
          className={cn(
            'flex h-12 w-12 items-center justify-center border transition-colors',
            favorite
              ? 'border-rose-500 bg-rose-500 text-white'
              : 'border-smoke-300 text-ink-700 hover:border-rose-500 hover:text-rose-500'
          )}
        >
          <IconHeart filled={favorite} className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleAdd(true)}
        disabled={soldOut}
        className="btn-primary mt-3 h-12 w-full disabled:bg-smoke-400"
      >
        COMPRAR AHORA
      </button>

      {/* ENVÍO */}
      <div className="mt-7 flex items-start gap-3 border border-smoke-300 bg-smoke-100 p-4">
        <IconTruck className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
        <div>
          <p className="text-[10px] font-semibold tracking-brand text-ink-950">ENVÍO A TODA COLOMBIA</p>
          <p className="mt-1 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
            ENVÍO GRATIS EN COMPRAS SUPERIORES A $200.000. TAMBIÉN PUEDES PAGAR CONTRA ENTREGA.
          </p>
        </div>
      </div>
    </div>
  );
}
