'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader, StatCard, SearchInput, Select, TableWrapper, Badge } from '@/components/admin/AdminUI';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { IconDownload } from '@/components/ui/Icons';
import { formatCOP, formatDateShort, formatNumber } from '@/lib/utils';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/constants';
import type { OrderDTO, Paginated } from '@/lib/types';

function statusTone(status: string) {
  if (status === 'ENTREGADO') return 'green' as const;
  if (status === 'CANCELADO') return 'red' as const;
  if (status === 'PENDIENTE') return 'amber' as const;
  return 'neutral' as const;
}

export function OrdersView() {
  const { error } = useToast();

  const [data, setData] = useState<Paginated<OrderDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [pago, setPago] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina: String(page), tamano: '20' });
      if (q.trim()) params.set('q', q.trim());
      if (estado) params.set('estado', estado);
      if (pago) params.set('pago', pago);

      const response = await fetch(`/api/admin/pedidos?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) setData(json.data);
      else error(json.error);
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, [page, q, estado, pago, error]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const items = data?.items ?? [];
  const revenue = items.filter((o) => o.status !== 'CANCELADO').reduce((s, o) => s + o.total, 0);

  return (
    <>
      <PageHeader
        title="PEDIDOS"
        description="REVISA, CONFIRMA Y ACTUALIZA EL ESTADO DE TODOS LOS PEDIDOS DE LA TIENDA."
        actions={
          <button
            type="button"
            onClick={() => window.open('/api/admin/exportar?tipo=pedidos', '_blank')}
            className="btn-ghost btn-sm"
          >
            <IconDownload className="h-4 w-4" /> EXPORTAR PEDIDOS
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="PEDIDOS ENCONTRADOS" value={formatNumber(data?.total ?? 0)} />
        <StatCard label="PENDIENTES EN ESTA PÁGINA" value={formatNumber(items.filter((o) => o.status === 'PENDIENTE').length)} accent={items.some((o) => o.status === 'PENDIENTE')} />
        <StatCard label="ENTREGADOS EN ESTA PÁGINA" value={formatNumber(items.filter((o) => o.status === 'ENTREGADO').length)} />
        <StatCard label="TOTAL EN ESTA PÁGINA" value={formatCOP(revenue)} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={q}
          onChange={(v) => { setQ(v); setPage(1); }}
          placeholder="BUSCAR POR PEDIDO, CLIENTE, CORREO O TELÉFONO…"
        />
        <Select
          value={estado}
          onChange={(v) => { setEstado(v); setPage(1); }}
          label="ESTADO"
          options={[
            { value: '', label: 'TODOS LOS ESTADOS' },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
          ]}
        />
        <Select
          value={pago}
          onChange={(v) => { setPago(v); setPage(1); }}
          label="MÉTODO DE PAGO"
          options={[
            { value: '', label: 'TODOS LOS PAGOS' },
            ...PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
          ]}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : items.length === 0 ? (
        <p className="border border-dashed border-smoke-300 bg-white px-6 py-14 text-center text-[11px] font-semibold tracking-brand text-smoke-600">
          NO ENCONTRAMOS PEDIDOS CON ESOS FILTROS.
        </p>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th>PEDIDO</th>
              <th>CLIENTE</th>
              <th>FECHA</th>
              <th>PRODUCTOS</th>
              <th>PAGO</th>
              <th>ESTADO</th>
              <th className="text-right">TOTAL</th>
              <th className="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-rose-500">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td>
                  <span className="block font-medium text-ink-950">
                    {order.customer.firstName} {order.customer.lastName}
                  </span>
                  <span className="normal-case-force text-[9px] text-smoke-500">{order.customer.email}</span>
                </td>
                <td>{formatDateShort(order.createdAt)}</td>
                <td>{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td>
                  <span className="block">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                  <span className="text-[9px] tracking-brand text-smoke-500">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                </td>
                <td>
                  <Badge tone={statusTone(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                </td>
                <td className="text-right font-semibold text-rose-500">{formatCOP(order.total)}</td>
                <td className="text-right">
                  <Link href={`/admin/pedidos/${order.id}`} className="btn-ghost btn-sm">
                    GESTIONAR
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )}

      <Pagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onChange={setPage}
        className="mt-8"
      />
    </>
  );
}
