import Link from 'next/link';
import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/SafeImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { getOrderByNumber } from '@/services/orders';
import { formatCOP, formatDate } from '@/lib/utils';
import { PAYMENT_METHOD_LABELS, ORDER_STATUS_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PEDIDO CONFIRMADO',
  robots: { index: false, follow: false },
};

export default async function PedidoConfirmadoPage({
  searchParams,
}: {
  searchParams: { numero?: string };
}) {
  const numero = (searchParams.numero ?? '').toUpperCase();
  const order = numero ? await getOrderByNumber(numero) : null;

  if (!order) {
    return (
      <div className="container-fk py-20">
        <EmptyState
          title="NO ENCONTRAMOS ESTE PEDIDO"
          description="VERIFICA EL NÚMERO DE PEDIDO O CONSULTA EL ESTADO DESDE LA PÁGINA DE SEGUIMIENTO."
          actionText="IR A SEGUIMIENTO"
          actionHref="/seguimiento"
        />
      </div>
    );
  }

  return (
    <div className="container-fk py-16">
      <div className="mx-auto max-w-3xl">
        <div className="border border-smoke-300 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="heading-lg mt-7 text-ink-950">¡GRACIAS POR TU COMPRA! 💗</h1>
          <p className="mt-4 text-[11px] leading-relaxed tracking-brand text-smoke-600">
            HEMOS RECIBIDO TU PEDIDO Y TE ENVIAMOS LA CONFIRMACIÓN A TU CORREO.
          </p>

          <p className="mt-8 border border-dashed border-rose-500 py-4 text-lg font-semibold tracking-brand text-rose-500">
            NÚMERO DE PEDIDO: #{order.orderNumber}
          </p>

          <dl className="mt-8 grid gap-3 text-left text-[11px] tracking-wider2 sm:grid-cols-2">
            <Row label="FECHA" value={formatDate(order.createdAt)} />
            <Row label="ESTADO" value={ORDER_STATUS_LABELS[order.status] ?? order.status} />
            <Row label="MÉTODO DE PAGO" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
            <Row label="TOTAL" value={formatCOP(order.total)} />
          </dl>

          {order.paymentMethod === 'CONTRA_ENTREGA' && (
            <p className="mt-6 bg-smoke-100 px-5 py-4 text-[10px] leading-relaxed tracking-brand text-ink-800">
              REALIZA TU PEDIDO Y PAGA CUANDO LO RECIBAS. TEN LISTO EL VALOR EXACTO AL MOMENTO DE LA
              ENTREGA.
            </p>
          )}

          {order.paymentMethod === 'TRANSFERENCIA' && (
            <p className="mt-6 bg-smoke-100 px-5 py-4 text-[10px] leading-relaxed tracking-brand text-ink-800">
              TE ENVIAREMOS LOS DATOS BANCARIOS A TU CORREO PARA COMPLETAR LA TRANSFERENCIA.
            </p>
          )}

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={`/seguimiento?numero=${order.orderNumber}`} className="btn-primary">
              VER MI PEDIDO
            </Link>
            <Link href="/productos" className="btn-outline">
              SEGUIR COMPRANDO
            </Link>
          </div>
        </div>

        {/* DETALLE */}
        <section className="mt-10 border border-smoke-300 bg-white p-8">
          <h2 className="text-[12px] font-semibold tracking-brand text-ink-950">PRODUCTOS DEL PEDIDO</h2>
          <ul className="mt-6 flex flex-col divide-y divide-smoke-200">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-smoke-200">
                  <SafeImage
                    src={item.productImage}
                    alt={item.productName}
                    label={item.productName}
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium tracking-wider2 text-ink-900">{item.productName}</p>
                  <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                    {item.size && `TALLA ${item.size} · `}
                    {item.color} · CANTIDAD {item.quantity}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-rose-500">{formatCOP(item.subtotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 flex flex-col gap-3 border-t border-smoke-200 pt-5 text-[11px] tracking-wider2">
            <Row label="SUBTOTAL" value={formatCOP(order.subtotal)} />
            {order.discount > 0 && <Row label="DESCUENTO" value={`- ${formatCOP(order.discount)}`} />}
            <Row label="ENVÍO" value={order.shippingCost === 0 ? 'GRATIS' : formatCOP(order.shippingCost)} />
            <div className="flex items-center justify-between border-t border-ink-950 pt-4">
              <dt className="text-[11px] font-semibold tracking-brand text-ink-950">TOTAL</dt>
              <dd className="text-lg font-semibold tracking-wider2 text-rose-500">
                {formatCOP(order.total)}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-smoke-200 pt-6">
            <p className="label-xs mb-2">DIRECCIÓN DE ENVÍO</p>
            <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-700">
              {order.firstName} {order.lastName}
              <br />
              {order.street}, {order.neighborhood}
              <br />
              {order.city}, {order.state}
              <br />
              TEL: {order.phone}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-smoke-200 py-2">
      <dt className="text-[9px] font-semibold tracking-brand text-smoke-500">{label}</dt>
      <dd className="text-[10px] font-medium tracking-wider2 text-ink-900">{value}</dd>
    </div>
  );
}
