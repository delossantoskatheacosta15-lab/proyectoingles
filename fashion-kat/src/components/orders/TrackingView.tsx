'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SafeImage } from '@/components/ui/SafeImage';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { Spinner } from '@/components/ui/Skeleton';
import { formatCOP, formatDate } from '@/lib/utils';

type TrackedOrder = {
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  carrier: string | null;
  trackingCode: string | null;
  city: string;
  state: string;
  customerName: string;
  items: {
    productName: string;
    productImage: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
    subtotal: number;
  }[];
  history: { toStatus: string; createdAt: string; note: string | null }[];
};

export function TrackingView() {
  const searchParams = useSearchParams();
  const [numero, setNumero] = useState(searchParams.get('numero') ?? '');
  const [correo, setCorreo] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const search = useCallback(async (orderNumber: string, email?: string) => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ numero: orderNumber.trim() });
      if (email) params.set('correo', email.trim());
      const response = await fetch(`/api/seguimiento?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) {
        setOrder(json.data.order);
      } else {
        setOrder(null);
        setMessage(json.error);
      }
    } catch {
      setMessage('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = searchParams.get('numero');
    if (initial) void search(initial);
  }, [searchParams, search]);

  return (
    <div className="container-fk py-14">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">TU PEDIDO, PASO A PASO</p>
        <h1 className="heading-lg mt-3 text-ink-950">SEGUIMIENTO DE PEDIDO</h1>
        <p className="mt-3 text-[11px] leading-relaxed tracking-brand text-smoke-600">
          INGRESA TU NÚMERO DE PEDIDO (EJEMPLO: FK-000001) PARA CONSULTAR SU ESTADO.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search(numero, correo);
          }}
          className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value.toUpperCase())}
            placeholder="NÚMERO DE PEDIDO"
            aria-label="NÚMERO DE PEDIDO"
            className="field"
            required
          />
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="CORREO (OPCIONAL)"
            aria-label="CORREO DEL PEDIDO"
            className="field normal-case-force"
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner /> : 'CONSULTAR'}
          </button>
        </form>

        {message && (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-semibold tracking-brand text-red-700">
            {message}
          </p>
        )}

        {order && (
          <div className="mt-10 border border-smoke-300 bg-white p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-smoke-200 pb-6">
              <div>
                <p className="text-[13px] font-semibold tracking-brand text-ink-950">
                  PEDIDO #{order.orderNumber}
                </p>
                <p className="mt-1.5 text-[10px] tracking-brand text-smoke-600">
                  {formatDate(order.createdAt)} · {order.customerName}
                </p>
                <p className="mt-1 text-[10px] tracking-brand text-smoke-600">
                  DESTINO: {order.city}, {order.state}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-brand text-smoke-500">TOTAL</p>
                <p className="text-lg font-semibold tracking-wider2 text-rose-500">
                  {formatCOP(order.total)}
                </p>
              </div>
            </div>

            {(order.carrier || order.trackingCode) && (
              <div className="mt-6 bg-smoke-100 px-4 py-3">
                <p className="text-[10px] tracking-brand text-ink-800">
                  {order.carrier && `TRANSPORTADORA: ${order.carrier}`}
                  {order.carrier && order.trackingCode && ' · '}
                  {order.trackingCode && `GUÍA: ${order.trackingCode}`}
                </p>
              </div>
            )}

            <div className="mt-8">
              <OrderTimeline status={order.status} history={order.history} />
            </div>

            <div className="mt-8 border-t border-smoke-200 pt-6">
              <p className="label-xs mb-4">PRODUCTOS</p>
              <ul className="flex flex-col gap-4">
                {order.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-smoke-200">
                      <SafeImage
                        src={item.productImage}
                        alt={item.productName}
                        label={item.productName}
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium tracking-wider2 text-ink-900">
                        {item.productName}
                      </p>
                      <p className="mt-0.5 text-[9px] tracking-brand text-smoke-500">
                        {item.size && `TALLA ${item.size} · `}
                        {item.color} · X{item.quantity}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-rose-500">
                      {formatCOP(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
