'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { IconTrash, IconPlus, IconMinus, IconTruck, IconTag } from '@/components/ui/Icons';
import { useStore } from '@/components/providers/StoreProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCOP, cn } from '@/lib/utils';
import type { ProductDTO, ResolvedCart } from '@/lib/types';

export function CartView() {
  const { items, setQuantity, removeItem, toggleSavedForLater, coupon, setCoupon, ready } = useStore();
  const { success, error } = useToast();

  const [cart, setCart] = useState<ResolvedCart | null>(null);
  const [crossSell, setCrossSell] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState(coupon ?? '');
  const [applying, setApplying] = useState(false);

  const resolve = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carrito/resolver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, cupon: coupon, ventaCruzada: true }),
      });
      const json = await response.json();
      if (json.ok) {
        setCart({ lines: json.data.lines, savedLines: json.data.savedLines, totals: json.data.totals });
        setCrossSell(json.data.crossSell ?? []);
      }
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [items, coupon]);

  useEffect(() => {
    if (!ready) return;
    void resolve();
  }, [ready, resolve]);

  const applyCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    try {
      const response = await fetch('/api/cupones/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: couponInput.trim(), items }),
      });
      const json = await response.json();
      if (json.ok) {
        setCoupon(json.data.code);
        success(json.data.message);
      } else {
        error(json.error);
        setCoupon(null);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput('');
  };

  if (!ready || loading) {
    return (
      <div className="container-fk py-16">
        <LoadingBlock text="CARGANDO TU CARRITO…" />
      </div>
    );
  }

  const lines = cart?.lines ?? [];
  const saved = cart?.savedLines ?? [];
  const totals = cart?.totals;

  return (
    <div className="container-fk py-12">
      <h1 className="heading-lg text-ink-950">CARRITO DE COMPRAS</h1>
      <p className="mt-2 text-[10px] tracking-brand text-smoke-600">
        {lines.length} {lines.length === 1 ? 'PRODUCTO' : 'PRODUCTOS'} EN TU CARRITO
      </p>

      {lines.length === 0 && saved.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="TU CARRITO ESTÁ VACÍO"
            description="AÚN NO HAS AGREGADO PRODUCTOS. EXPLORA NUESTRA COLECCIÓN Y ENCUENTRA TU PRÓXIMA PRENDA FAVORITA."
            actionText="EMPEZAR A COMPRAR"
            actionHref="/productos"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2">
            <ul className="flex flex-col divide-y divide-smoke-200 border-y border-smoke-200">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-6">
                  <Link
                    href={`/producto/${line.slug}`}
                    className="relative h-32 w-24 shrink-0 overflow-hidden bg-smoke-200"
                  >
                    <SafeImage src={line.image} alt={line.name} label={line.name} sizes="96px" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/producto/${line.slug}`}
                          className="text-[11px] font-semibold tracking-wider2 text-ink-950 hover:text-rose-500"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                          {line.categoryName} · SKU {line.sku}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          {line.size && (
                            <span className="text-[9px] tracking-brand text-ink-700">TALLA: {line.size}</span>
                          )}
                          {line.color && (
                            <span className="flex items-center gap-1.5 text-[9px] tracking-brand text-ink-700">
                              COLOR:
                              <span
                                className="inline-block h-3 w-3 border border-smoke-300"
                                style={{ backgroundColor: line.colorHex ?? '#000' }}
                              />
                              {line.color}
                            </span>
                          )}
                        </div>
                        {line.issue && (
                          <p className="mt-2 text-[9px] font-semibold tracking-brand text-red-600">
                            {line.issue}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(line.productId, line.variantId)}
                        aria-label="ELIMINAR PRODUCTO"
                        className="text-smoke-500 transition-colors hover:text-red-600"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-smoke-300">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
                            aria-label="DISMINUIR"
                            className="flex h-9 w-9 items-center justify-center text-ink-700 hover:text-rose-500"
                          >
                            <IconMinus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-[11px] font-semibold">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
                            disabled={line.quantity >= line.availableStock}
                            aria-label="AUMENTAR"
                            className="flex h-9 w-9 items-center justify-center text-ink-700 hover:text-rose-500 disabled:opacity-30"
                          >
                            <IconPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSavedForLater(line.productId, line.variantId)}
                          className="link-underline text-[9px] font-semibold tracking-brand text-smoke-600"
                        >
                          GUARDAR PARA DESPUÉS
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[13px] font-semibold tracking-wider2 text-rose-500">
                          {formatCOP(line.subtotal)}
                        </p>
                        <p className="text-[9px] tracking-brand text-smoke-500">
                          {formatCOP(line.unitPrice)} C/U
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* GUARDADOS PARA DESPUÉS */}
            {saved.length > 0 && (
              <div className="mt-10">
                <p className="label-xs mb-4">GUARDADOS PARA DESPUÉS ({saved.length})</p>
                <ul className="flex flex-col divide-y divide-smoke-200 border-y border-smoke-200">
                  {saved.map((line) => (
                    <li key={line.key} className="flex items-center gap-4 py-4">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-smoke-200">
                        <SafeImage src={line.image} alt={line.name} label={line.name} sizes="64px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/producto/${line.slug}`}
                          className="text-[11px] font-medium tracking-wider2 text-ink-900 hover:text-rose-500"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                          {line.size && `TALLA ${line.size} · `}
                          {line.color}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-rose-500">
                        {formatCOP(line.unitPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSavedForLater(line.productId, line.variantId)}
                        className="btn-ghost btn-sm"
                      >
                        MOVER AL CARRITO
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId, line.variantId)}
                        aria-label="ELIMINAR"
                        className="text-smoke-500 hover:text-red-600"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos" className="btn-ghost">
                ← SEGUIR COMPRANDO
              </Link>
            </div>
          </div>

          {/* RESUMEN */}
          <aside className="lg:col-span-1">
            <div className="sticky top-[190px] border border-smoke-300 bg-white p-6">
              <h2 className="text-[12px] font-semibold tracking-brand text-ink-950">RESUMEN DEL PEDIDO</h2>

              {/* CUPÓN */}
              <form onSubmit={applyCoupon} className="mt-5">
                <p className="label-xs mb-2">¿TIENES UN CUPÓN?</p>
                <div className="flex">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO"
                    aria-label="CÓDIGO DE CUPÓN"
                    className="field py-2.5 text-[10px]"
                  />
                  <button type="submit" disabled={applying} className="btn-dark shrink-0 px-4 py-2.5">
                    {applying ? '…' : 'APLICAR'}
                  </button>
                </div>
                {totals?.couponValid && (
                  <div className="mt-2 flex items-center justify-between bg-rose-50 px-3 py-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-semibold tracking-brand text-rose-600">
                      <IconTag className="h-3.5 w-3.5" /> {totals.couponCode} APLICADO
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[9px] tracking-brand text-smoke-600 hover:text-red-600"
                    >
                      QUITAR
                    </button>
                  </div>
                )}
                {totals && !totals.couponValid && totals.couponMessage && (
                  <p className="form-hint">{totals.couponMessage}</p>
                )}
              </form>

              {/* TOTALES */}
              <dl className="mt-6 flex flex-col gap-3 border-t border-smoke-200 pt-5 text-[11px] tracking-wider2">
                <Row label="SUBTOTAL" value={formatCOP(totals?.subtotal ?? 0)} />
                {(totals?.discount ?? 0) > 0 && (
                  <Row label="DESCUENTO" value={`- ${formatCOP(totals?.discount ?? 0)}`} accent />
                )}
                <Row
                  label="ENVÍO"
                  value={(totals?.shipping ?? 0) === 0 ? 'GRATIS' : formatCOP(totals?.shipping ?? 0)}
                />
              </dl>

              {totals && totals.missingForFreeShipping > 0 && (
                <div className="mt-4 flex items-start gap-2.5 bg-smoke-100 p-3">
                  <IconTruck className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <p className="text-[9px] leading-relaxed tracking-brand text-smoke-700">
                    AGREGA {formatCOP(totals.missingForFreeShipping)} MÁS Y OBTÉN ENVÍO GRATIS.
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-ink-950 pt-5">
                <span className="text-[11px] font-semibold tracking-brand text-ink-950">TOTAL</span>
                <span className="text-xl font-semibold tracking-wider2 text-rose-500">
                  {formatCOP(totals?.total ?? 0)}
                </span>
              </div>

              <Link
                href="/checkout"
                className={cn('btn-primary mt-6 w-full', lines.length === 0 && 'pointer-events-none opacity-40')}
              >
                IR AL CHECKOUT
              </Link>

              <p className="mt-4 text-center text-[9px] leading-relaxed tracking-brand text-smoke-500">
                PAGO SEGURO · PAGO CONTRA ENTREGA DISPONIBLE
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* VENTA CRUZADA */}
      {crossSell.length > 0 && lines.length > 0 && (
        <section className="mt-20 border-t border-smoke-300 pt-14">
          <p className="eyebrow">NO TE FALTE NADA</p>
          <h2 className="heading-md mt-3 text-ink-950">COMPLETA TU LOOK</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {crossSell.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-smoke-600">{label}</dt>
      <dd className={accent ? 'font-semibold text-rose-500' : 'font-medium text-ink-900'}>{value}</dd>
    </div>
  );
}
