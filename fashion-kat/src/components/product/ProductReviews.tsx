'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rating, RatingInput } from '@/components/ui/Rating';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { formatDate } from '@/lib/utils';
import type { OrderDTO } from '@/lib/types';

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export function ProductReviews({
  productId,
  rating,
  reviewCount,
}: {
  productId: string;
  rating: number;
  reviewCount: number;
}) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleOrder, setEligibleOrder] = useState<string | null>(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/resenas?producto=${productId}`, { cache: 'no-store' });
        const json = await response.json();
        if (json.ok) setReviews(json.data.reviews);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // BUSCA UN PEDIDO ENTREGADO QUE CONTENGA ESTE PRODUCTO
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const response = await fetch('/api/pedidos', { cache: 'no-store' });
        const json = await response.json();
        if (!json.ok) return;
        const orders: OrderDTO[] = json.data.orders;
        const match = orders.find(
          (o) => o.status === 'ENTREGADO' && o.items.some((i) => i.productId === productId)
        );
        setEligibleOrder(match?.id ?? null);
      } catch {
        setEligibleOrder(null);
      }
    })();
  }, [user, productId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!eligibleOrder) return;
    setSending(true);
    try {
      const response = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          orderId: eligibleOrder,
          rating: form.rating,
          comment: form.comment,
        }),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        setSent(true);
        setForm({ rating: 5, comment: '' });
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="border-t border-smoke-300 pt-14">
      <div className="grid gap-12 lg:grid-cols-3">
        <div>
          <p className="eyebrow">OPINIONES REALES</p>
          <h2 className="heading-md mt-3 text-ink-950">RESEÑAS DE CLIENTAS</h2>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-4xl font-light tracking-wider2 text-ink-950">
              {reviewCount > 0 ? rating.toFixed(1) : '—'}
            </span>
            <div className="mb-1.5">
              <Rating value={rating} size="md" />
              <p className="mt-1 text-[10px] tracking-brand text-smoke-600">
                {reviewCount} {reviewCount === 1 ? 'RESEÑA' : 'RESEÑAS'}
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="mt-8 border border-smoke-300 bg-smoke-100 p-5">
            {!user ? (
              <>
                <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-700">
                  INICIA SESIÓN PARA DEJAR TU RESEÑA. SOLO PUEDEN RESEÑAR LAS CLIENTAS QUE YA RECIBIERON
                  EL PRODUCTO.
                </p>
                <Link href="/login" className="btn-dark btn-sm mt-4 w-full">
                  INICIAR SESIÓN
                </Link>
              </>
            ) : sent ? (
              <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-700">
                ¡GRACIAS POR TU RESEÑA! LA PUBLICAREMOS DESPUÉS DE REVISARLA.
              </p>
            ) : !eligibleOrder ? (
              <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-700">
                SOLO PUEDES RESEÑAR PRODUCTOS QUE HAYAS COMPRADO Y RECIBIDO.
              </p>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <p className="label-xs mb-2">TU CALIFICACIÓN</p>
                  <RatingInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <div>
                  <label htmlFor="comentario" className="form-label">
                    TU COMENTARIO
                  </label>
                  <textarea
                    id="comentario"
                    required
                    minLength={10}
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="CUÉNTANOS QUÉ TE PARECIÓ EL PRODUCTO…"
                    className="field resize-none"
                  />
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full">
                  {sending ? 'ENVIANDO…' : 'PUBLICAR RESEÑA'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-[10px] tracking-brand text-smoke-600">CARGANDO RESEÑAS…</p>
          ) : reviews.length === 0 ? (
            <div className="border border-dashed border-smoke-300 bg-smoke-100 px-6 py-12 text-center">
              <p className="text-[11px] font-semibold tracking-brand text-ink-950">
                ESTE PRODUCTO AÚN NO TIENE RESEÑAS.
              </p>
              <p className="mt-2 text-[10px] tracking-wider2 text-smoke-600">
                SÉ LA PRIMERA EN COMPARTIR TU OPINIÓN.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {reviews.map((review) => (
                <li key={review.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold tracking-wider2 text-ink-950">
                      {review.authorName}
                    </p>
                    <p className="text-[9px] tracking-brand text-smoke-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <Rating value={review.rating} className="mt-2" />
                  <p className="mt-3 text-[11px] leading-relaxed tracking-wider2 text-smoke-700">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
