'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, StatCard, ErrorMessage } from '@/components/admin/AdminUI';
import { SafeImage } from '@/components/ui/SafeImage';
import { LoadingBlock, Spinner } from '@/components/ui/Skeleton';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCOP, formatDateTime, formatDate } from '@/lib/utils';
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/constants';
import type { OrderDTO } from '@/lib/types';

type HistoryRow = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
  changedBy: string;
};

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { success, error } = useToast();

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [account, setAccount] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pedidos/${orderId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!json.ok) {
        setMessage(json.error);
        return;
      }
      setOrder(json.data.order);
      setHistory(json.data.history);
      setAccount(json.data.account);
      setCarrier(json.data.order.carrier ?? '');
      setTrackingCode(json.data.order.trackingCode ?? '');
      const allowed = ORDER_STATUS_FLOW[json.data.order.status] ?? [];
      setNextStatus(allowed[0] ?? '');
    } catch {
      setMessage('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async () => {
    if (!nextStatus) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          note: note || undefined,
          carrier: carrier || undefined,
          trackingCode: trackingCode || undefined,
        }),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        setNote('');
        void load();
      } else {
        setMessage(json.error);
        error(json.error);
      }
    } catch {
      setMessage('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock text="CARGANDO PEDIDO…" />;
  if (!order) {
    return (
      <>
        <ErrorMessage message={message ?? 'NO ENCONTRAMOS ESTE PEDIDO.'} />
        <Link href="/admin/pedidos" className="btn-ghost">
          ← VOLVER A PEDIDOS
        </Link>
      </>
    );
  }

  const allowedNext = ORDER_STATUS_FLOW[order.status] ?? [];
  const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <PageHeader
        title={`PEDIDO #${order.orderNumber}`}
        description={`CREADO EL ${formatDate(order.createdAt)} · ${totalUnits} ${totalUnits === 1 ? 'UNIDAD' : 'UNIDADES'}`}
        actions={
          <>
            <Link href="/admin/pedidos" className="btn-ghost btn-sm">
              ← VOLVER
            </Link>
            <Link
              href={`/seguimiento?numero=${order.orderNumber}`}
              target="_blank"
              className="btn-dark btn-sm"
            >
              VER SEGUIMIENTO PÚBLICO
            </Link>
          </>
        }
      />

      <ErrorMessage message={message} />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ESTADO ACTUAL" value={ORDER_STATUS_LABELS[order.status]} accent />
        <StatCard label="MÉTODO DE PAGO" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
        <StatCard label="ESTADO DEL PAGO" value={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
        <StatCard label="TOTAL" value={formatCOP(order.total)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel title="PRODUCTOS DEL PEDIDO">
            <ul className="flex flex-col divide-y divide-smoke-200">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-smoke-200">
                    <SafeImage
                      src={item.productImage}
                      alt={item.productName}
                      label={item.productName}
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link
                        href={`/admin/productos/${item.productId}`}
                        className="block truncate text-[11px] font-semibold tracking-wider2 text-ink-950 hover:text-rose-500"
                      >
                        {item.productName}
                      </Link>
                    ) : (
                      <span className="block truncate text-[11px] font-semibold tracking-wider2 text-ink-950">
                        {item.productName}
                      </span>
                    )}
                    <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                      {item.productSku}
                      {item.size && ` · TALLA ${item.size}`}
                      {item.color && ` · ${item.color}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-rose-500">{formatCOP(item.subtotal)}</p>
                    <p className="text-[9px] tracking-brand text-smoke-500">
                      {item.quantity} × {formatCOP(item.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 flex flex-col gap-2.5 border-t border-smoke-200 pt-5 text-[11px] tracking-wider2">
              <div className="flex justify-between">
                <dt className="text-smoke-600">SUBTOTAL</dt>
                <dd className="font-medium">{formatCOP(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-smoke-600">DESCUENTO</dt>
                  <dd className="font-semibold text-rose-500">- {formatCOP(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-smoke-600">ENVÍO</dt>
                <dd className="font-medium">
                  {order.shippingCost === 0 ? 'GRATIS' : formatCOP(order.shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink-950 pt-3">
                <dt className="font-semibold text-ink-950">TOTAL</dt>
                <dd className="text-base font-semibold text-rose-500">{formatCOP(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="CAMBIAR ESTADO DEL PEDIDO">
            {allowedNext.length === 0 ? (
              <p className="text-[10px] leading-relaxed tracking-brand text-smoke-600">
                ESTE PEDIDO YA ESTÁ EN UN ESTADO FINAL ({ORDER_STATUS_LABELS[order.status]}) Y NO ADMITE
                MÁS CAMBIOS.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">NUEVO ESTADO</label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="field"
                  >
                    {allowedNext.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">TRANSPORTADORA</label>
                  <input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="field"
                    placeholder="COORDINADORA, SERVIENTREGA, INTERRAPIDÍSIMO…"
                  />
                </div>
                <div>
                  <label className="form-label">NÚMERO DE GUÍA</label>
                  <input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="field"
                    placeholder="TRK000000"
                  />
                </div>
                <div>
                  <label className="form-label">NOTA INTERNA (OPCIONAL)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="field"
                    placeholder="OBSERVACIÓN DEL CAMBIO"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="button" onClick={changeStatus} disabled={saving} className="btn-primary">
                    {saving ? <Spinner /> : `MARCAR COMO ${ORDER_STATUS_LABELS[nextStatus] ?? ''}`}
                  </button>
                  <p className="mt-2.5 text-[9px] leading-relaxed tracking-brand text-smoke-500">
                    AL CAMBIAR EL ESTADO SE GUARDA EL HISTORIAL, SE NOTIFICA A LA CLIENTA Y SE LE ENVÍA
                    UN CORREO. SI CANCELAS EL PEDIDO, EL INVENTARIO SE DEVUELVE AUTOMÁTICAMENTE.
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="HISTORIAL DE CAMBIOS">
            <ul className="flex flex-col divide-y divide-smoke-200">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="text-[10px] font-semibold tracking-brand text-ink-950">
                      {h.fromStatus ? `${ORDER_STATUS_LABELS[h.fromStatus]} → ` : ''}
                      {ORDER_STATUS_LABELS[h.toStatus]}
                    </p>
                    {h.note && (
                      <p className="mt-1 text-[9px] leading-relaxed tracking-wider2 text-smoke-600">
                        {h.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] tracking-brand text-smoke-500">{formatDateTime(h.createdAt)}</p>
                    <p className="text-[9px] tracking-brand text-smoke-500">POR {h.changedBy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="ESTADO DE LA ENTREGA">
            <OrderTimeline
              status={order.status}
              history={order.history.map((h) => ({ toStatus: h.toStatus, createdAt: h.createdAt }))}
            />
          </Panel>

          <Panel title="CLIENTE">
            <p className="text-[11px] font-semibold tracking-wider2 text-ink-950">
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p className="normal-case-force mt-1 text-[10px] tracking-wider2 text-smoke-600">
              {order.customer.email}
            </p>
            <p className="mt-1 text-[10px] tracking-wider2 text-smoke-600">TEL: {order.customer.phone}</p>

            {account && (
              <Link href={`/admin/clientes/${account.id}`} className="btn-ghost btn-sm mt-4 w-full">
                VER FICHA DEL CLIENTE
              </Link>
            )}
            {!account && (
              <p className="mt-4 text-[9px] tracking-brand text-smoke-500">
                COMPRA REALIZADA SIN CUENTA REGISTRADA.
              </p>
            )}
          </Panel>

          <Panel title="DIRECCIÓN DE ENVÍO">
            <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-700">
              {order.address.street}
              <br />
              {order.address.neighborhood}
              <br />
              {order.address.city}, {order.address.state}
              {order.address.postalCode && (
                <>
                  <br />
                  CÓDIGO POSTAL: {order.address.postalCode}
                </>
              )}
            </p>
            {order.address.notes && (
              <p className="mt-3 border-t border-smoke-200 pt-3 text-[9px] leading-relaxed tracking-brand text-smoke-600">
                NOTAS: {order.address.notes}
              </p>
            )}
            {(order.carrier || order.trackingCode) && (
              <div className="mt-4 border-t border-smoke-200 pt-3">
                {order.carrier && (
                  <p className="text-[9px] tracking-brand text-smoke-600">
                    TRANSPORTADORA: {order.carrier}
                  </p>
                )}
                {order.trackingCode && (
                  <p className="mt-1 text-[9px] tracking-brand text-smoke-600">
                    GUÍA: {order.trackingCode}
                  </p>
                )}
              </div>
            )}
          </Panel>

          <Panel title="PAGO">
            <div className="flex flex-col gap-2.5 text-[10px] tracking-wider2">
              <div className="flex items-center justify-between">
                <span className="text-smoke-600">MÉTODO</span>
                <span className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-smoke-600">ESTADO</span>
                <Badge
                  tone={
                    order.paymentStatus === 'PAGADO'
                      ? 'green'
                      : order.paymentStatus === 'FALLIDO'
                        ? 'red'
                        : 'amber'
                  }
                >
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
