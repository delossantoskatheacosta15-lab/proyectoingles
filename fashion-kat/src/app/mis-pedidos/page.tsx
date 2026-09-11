import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountNav } from '@/components/account/AccountNav';
import { SafeImage } from '@/components/ui/SafeImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { getCurrentUser } from '@/lib/session';
import { listUserOrders } from '@/services/orders';
import { formatCOP, formatDate } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MIS PEDIDOS',
  robots: { index: false, follow: false },
};

export default async function MisPedidosPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirigir=/mis-pedidos');

  const orders = await listUserOrders(user.id);

  return (
    <div className="container-fk py-12">
      <p className="eyebrow">HISTORIAL DE COMPRAS</p>
      <h1 className="heading-lg mt-3 text-ink-950">MIS PEDIDOS</h1>
      <p className="mt-2 text-[11px] tracking-brand text-smoke-600">
        {orders.length} {orders.length === 1 ? 'PEDIDO REALIZADO' : 'PEDIDOS REALIZADOS'}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <AccountNav />
        </aside>

        <div className="flex flex-col gap-6">
          {orders.length === 0 ? (
            <EmptyState
              title="AÚN NO TIENES PEDIDOS"
              description="CUANDO REALICES TU PRIMERA COMPRA, LA VERÁS AQUÍ CON SU ESTADO EN TIEMPO REAL."
              actionText="EMPEZAR A COMPRAR"
              actionHref="/productos"
            />
          ) : (
            orders.map((order) => (
              <article key={order.id} className="border border-smoke-300 bg-white">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-smoke-200 px-6 py-5">
                  <div>
                    <p className="text-[12px] font-semibold tracking-brand text-ink-950">
                      PEDIDO #{order.orderNumber}
                    </p>
                    <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                      {formatDate(order.createdAt)} · {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·
                      PAGO {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-[14px] font-semibold tracking-wider2 text-rose-500">
                      {formatCOP(order.total)}
                    </span>
                  </div>
                </header>

                <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1fr_240px]">
                  <div>
                    <ul className="flex flex-col divide-y divide-smoke-200">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-4 py-3">
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

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={`/seguimiento?numero=${order.orderNumber}`} className="btn-ghost btn-sm">
                        SEGUIMIENTO DETALLADO
                      </Link>
                      {order.status === 'ENTREGADO' && order.items[0]?.productId && (
                        <Link href="/productos" className="btn-primary btn-sm">
                          VOLVER A COMPRAR
                        </Link>
                      )}
                    </div>

                    <p className="mt-5 text-[9px] leading-relaxed tracking-brand text-smoke-500">
                      ENVÍO A: {order.street}, {order.neighborhood}, {order.city}, {order.state}
                      {order.trackingCode && ` · GUÍA ${order.trackingCode}`}
                    </p>
                  </div>

                  <div className="border-t border-smoke-200 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <p className="label-xs mb-4">ESTADO DEL PEDIDO</p>
                    <OrderTimeline
                      status={order.status}
                      history={order.statusHistory.map((h) => ({
                        toStatus: h.toStatus,
                        createdAt: h.createdAt.toISOString(),
                      }))}
                    />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
