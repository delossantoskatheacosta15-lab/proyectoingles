'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader, StatCard, Panel, ErrorMessage } from '@/components/admin/AdminUI';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCOP, formatDateShort, formatDateTime, formatNumber, cn } from '@/lib/utils';
import { ROLE_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderDTO } from '@/lib/types';

type AddressRow = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string | null;
  notes: string | null;
  isDefault: boolean;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  addresses: AddressRow[];
  orderCount: number;
  totalSpent: number;
};

const ROLE_OPTIONS = [
  { value: 'CLIENTE', label: 'CLIENTE' },
  { value: 'OPERADOR', label: 'OPERADOR' },
  { value: 'EDITOR', label: 'EDITOR' },
  { value: 'ADMIN', label: 'ADMINISTRADOR' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVO', label: 'ACTIVO' },
  { value: 'INACTIVO', label: 'INACTIVO' },
  { value: 'BLOQUEADO', label: 'BLOQUEADO' },
];

export function CustomerDetailView({ id }: { id: string }) {
  const { success, error: errorToast } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/clientes/${id}`, { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) {
        setCustomer(json.data.customer);
        setOrders(json.data.orders ?? []);
      } else {
        setError(json.error ?? 'NO FUE POSIBLE CARGAR EL CLIENTE.');
      }
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(payload: { role?: string; status?: string }) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/clientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (json.ok) {
        await load();
        success(json.data.message);
      } else {
        setError(json.error ?? 'NO FUE POSIBLE ACTUALIZAR EL CLIENTE.');
        errorToast(json.error ?? 'NO FUE POSIBLE ACTUALIZAR EL CLIENTE.');
      }
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock text="CARGANDO LA INFORMACIÓN DEL CLIENTE…" />;

  if (!customer) {
    return (
      <>
        <ErrorMessage message={error ?? 'NO ENCONTRAMOS ESTE CLIENTE.'} />
        <Link href="/admin/clientes" className="btn-ghost btn-sm">
          VOLVER A CLIENTES
        </Link>
      </>
    );
  }

  const averageTicket = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;

  return (
    <>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`.toUpperCase()}
        description="FICHA COMPLETA DEL CLIENTE CON SUS DIRECCIONES Y TODO SU HISTORIAL DE COMPRAS."
        actions={
          <Link href="/admin/clientes" className="btn-ghost btn-sm">
            VOLVER A CLIENTES
          </Link>
        }
      />

      <ErrorMessage message={error} />

      <div className="mb-5 border border-smoke-300 bg-white p-5">
        <p className="normal-case-force text-[12px] font-medium text-ink-900">{customer.email}</p>
        <p className="normal-case-force mt-1 text-[11px] text-smoke-600">
          {customer.phone || 'SIN TELÉFONO REGISTRADO'}
        </p>
        <p className="mt-2 text-[10px] tracking-brand text-smoke-500">
          ÚLTIMO INGRESO: {customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : 'NUNCA HA INICIADO SESIÓN'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="PEDIDOS" value={formatNumber(customer.orderCount)} />
        <StatCard label="TOTAL GASTADO" value={formatCOP(customer.totalSpent)} accent />
        <StatCard label="TICKET PROMEDIO" value={formatCOP(averageTicket)} />
        <StatCard label="REGISTRO" value={formatDateShort(customer.createdAt)} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="ROL Y ESTADO DE LA CUENTA">
          <p className="mb-4 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
            SOLO UN ADMINISTRADOR PUEDE MODIFICAR EL ROL O EL ESTADO DE UNA CUENTA. NINGÚN USUARIO PUEDE
            CAMBIAR SU PROPIO ROL.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="cliente-rol">
                ROL
              </label>
              <select
                id="cliente-rol"
                className="field py-2.5 text-[11px]"
                value={customer.role}
                disabled={saving}
                onChange={(e) => update({ role: e.target.value })}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">
                ROL ACTUAL: {ROLE_LABELS[customer.role] ?? customer.role}
              </p>
            </div>
            <div>
              <label className="form-label" htmlFor="cliente-estado">
                ESTADO
              </label>
              <select
                id="cliente-estado"
                className="field py-2.5 text-[11px]"
                value={customer.status}
                disabled={saving}
                onChange={(e) => update({ status: e.target.value })}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">
                UNA CUENTA BLOQUEADA NO PUEDE INICIAR SESIÓN.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="DIRECCIONES GUARDADAS">
          {customer.addresses.length === 0 ? (
            <p className="text-[10px] tracking-brand text-smoke-600">
              ESTE CLIENTE NO TIENE DIRECCIONES GUARDADAS.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {customer.addresses.map((address) => (
                <li key={address.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold tracking-brand text-ink-900">
                      {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="badge bg-rose-500 text-white">PRINCIPAL</span>
                    )}
                  </div>
                  <p className="text-[11px] tracking-wide text-ink-800">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-[11px] tracking-wide text-smoke-700">
                    {address.street}, {address.neighborhood}
                  </p>
                  <p className="text-[11px] tracking-wide text-smoke-700">
                    {address.city}, {address.state}
                    {address.postalCode ? ` · ${address.postalCode}` : ''}
                  </p>
                  <p className="normal-case-force mt-1 text-[10px] text-smoke-600">{address.phone}</p>
                  {address.notes && (
                    <p className="mt-1 text-[10px] tracking-wide text-smoke-600">
                      INDICACIONES: {address.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5">
        <h2 className="mb-3 text-[11px] font-semibold tracking-brand text-ink-950">
          HISTORIAL DE PEDIDOS
        </h2>

        {orders.length === 0 ? (
          <p className="border border-smoke-300 bg-white px-5 py-10 text-center text-[11px] font-semibold tracking-brand text-smoke-600">
            ESTE CLIENTE AÚN NO HA REALIZADO PEDIDOS.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <article key={order.id} className="border border-smoke-300 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-smoke-200 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-[12px] font-semibold tracking-brand text-rose-500"
                    >
                      #{order.orderNumber}
                    </Link>
                    <span className="text-[10px] tracking-brand text-smoke-600">
                      {formatDateShort(order.createdAt)}
                    </span>
                    <span className={cn('badge', ORDER_STATUS_COLORS[order.status])}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold tracking-wider2 text-ink-950">
                    {formatCOP(order.total)}
                  </span>
                </div>

                <ul className="flex flex-col divide-y divide-smoke-200 px-5">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium tracking-wide text-ink-900">
                          {item.productName}
                        </p>
                        <p className="text-[9px] tracking-brand text-smoke-500">
                          {item.productSku}
                          {item.size ? ` · TALLA ${item.size}` : ''}
                          {item.color ? ` · ${item.color}` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] tracking-wide text-ink-800">
                          {item.quantity} × {formatCOP(item.unitPrice)}
                        </p>
                        <p className="text-[11px] font-semibold tracking-wider2 text-ink-950">
                          {formatCOP(item.subtotal)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-smoke-200 px-5 py-3 text-[10px] tracking-brand text-smoke-600">
                  <span>SUBTOTAL: {formatCOP(order.subtotal)}</span>
                  <span>DESCUENTO: {formatCOP(order.discount)}</span>
                  <span>ENVÍO: {formatCOP(order.shippingCost)}</span>
                  <span>
                    ENTREGA EN: {order.address.city}, {order.address.state}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
