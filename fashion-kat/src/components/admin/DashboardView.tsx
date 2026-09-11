'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { PageHeader, StatCard, Panel, Badge, TableWrapper } from '@/components/admin/AdminUI';
import { TableSkeleton, LoadingBlock } from '@/components/ui/Skeleton';
import { formatCOP, formatNumber, formatDateShort } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';

const ROSE = '#F0508C';
const INK = '#0A0A0A';
const PALETTE = ['#F0508C', '#0A0A0A', '#FB6FA9', '#3D3D3D', '#FFC7DE', '#6D6D6D'];

type Dashboard = {
  cards: {
    revenueToday: number;
    revenueMonth: number;
    revenueTotal: number;
    ordersToday: number;
    ordersMonth: number;
    ordersTotal: number;
    customerCount: number;
    productCount: number;
    outOfStock: number;
    lowStock: number;
    averageTicket: number;
    pendingOrders: number;
    unreadMessages: number;
    pendingReviews: number;
  };
  salesByDay: { label: string; ventas: number; pedidos: number }[];
  salesByMonth: { label: string; ventas: number; pedidos: number }[];
  topProducts: { name: string; unidades: number; ventas: number }[];
  topCategories: { name: string; unidades: number; ventas: number }[];
  statusGroups: { status: string; count: number }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; minStock: number }[];
  latestOrders: {
    id: string;
    orderNumber: string;
    firstName: string;
    lastName: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }[];
};

export function DashboardView() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        const json = await response.json();
        if (json.ok) setData(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingBlock text="CARGANDO EL DASHBOARD…" />;
  if (!data) return <p className="text-[11px] tracking-brand">NO FUE POSIBLE CARGAR LA INFORMACIÓN.</p>;

  const { cards } = data;

  return (
    <>
      <PageHeader
        title="DASHBOARD"
        description="RESUMEN EN TIEMPO REAL DE LAS VENTAS, EL INVENTARIO Y LA ACTIVIDAD DE LA TIENDA."
        actions={
          <>
            <Link href="/admin/productos/nuevo" className="btn-primary btn-sm">
              NUEVO PRODUCTO
            </Link>
            <Link href="/admin/pedidos" className="btn-ghost btn-sm">
              VER PEDIDOS
            </Link>
          </>
        }
      />

      {/* TARJETAS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="VENTAS DE HOY" value={formatCOP(cards.revenueToday)} hint={`${cards.ordersToday} PEDIDOS HOY`} accent />
        <StatCard label="VENTAS DEL MES" value={formatCOP(cards.revenueMonth)} hint={`${cards.ordersMonth} PEDIDOS ESTE MES`} />
        <StatCard label="INGRESOS TOTALES" value={formatCOP(cards.revenueTotal)} hint={`${cards.ordersTotal} PEDIDOS EN TOTAL`} />
        <StatCard label="TICKET PROMEDIO" value={formatCOP(cards.averageTicket)} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="PEDIDOS PENDIENTES" value={formatNumber(cards.pendingOrders)} href="/admin/pedidos?estado=PENDIENTE" />
        <StatCard label="CLIENTES" value={formatNumber(cards.customerCount)} href="/admin/clientes" />
        <StatCard label="PRODUCTOS" value={formatNumber(cards.productCount)} href="/admin/productos" />
        <StatCard label="PRODUCTOS AGOTADOS" value={formatNumber(cards.outOfStock)} href="/admin/inventario" accent={cards.outOfStock > 0} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="STOCK BAJO" value={formatNumber(cards.lowStock)} href="/admin/inventario" accent={cards.lowStock > 0} />
        <StatCard label="MENSAJES NUEVOS" value={formatNumber(cards.unreadMessages)} href="/admin/mensajes" />
        <StatCard label="RESEÑAS POR APROBAR" value={formatNumber(cards.pendingReviews)} href="/admin/resenas" />
        <StatCard label="STOCK TOTAL DISPONIBLE" value={formatNumber(data.lowStockProducts.reduce((s, p) => s + p.stock, 0))} />
      </div>

      {/* GRÁFICOS */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel title="VENTAS POR DÍA (ÚLTIMOS 14 DÍAS)" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesByDay} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                <defs>
                  <linearGradient id="ventasDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ROSE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ROSE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E4E4E7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#71717A' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#71717A' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`} />
                <Tooltip
                  formatter={(value: number) => [formatCOP(value), 'VENTAS']}
                  contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #E4E4E7' }}
                />
                <Area type="monotone" dataKey="ventas" stroke={ROSE} strokeWidth={2} fill="url(#ventasDia)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="PEDIDOS POR ESTADO">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusGroups.map((s) => ({
                    name: ORDER_STATUS_LABELS[s.status] ?? s.status,
                    value: s.count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {data.statusGroups.map((_, index) => (
                    <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 9, letterSpacing: '0.08em' }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #E4E4E7' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="VENTAS POR MES (ÚLTIMOS 6 MESES)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesByMonth} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                <CartesianGrid stroke="#E4E4E7" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#71717A' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#71717A' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`} />
                <Tooltip
                  formatter={(value: number) => [formatCOP(value), 'VENTAS']}
                  contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #E4E4E7' }}
                />
                <Bar dataKey="ventas" fill={INK} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="PRODUCTOS MÁS VENDIDOS">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topProducts}
                layout="vertical"
                margin={{ top: 4, right: 12, bottom: 0, left: 8 }}
              >
                <CartesianGrid stroke="#E4E4E7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#71717A' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 8, fill: '#71717A' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} UNIDADES`, 'VENDIDAS']}
                  contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #E4E4E7' }}
                />
                <Bar dataKey="unidades" fill={ROSE} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="CATEGORÍAS MÁS VENDIDAS">
          <ul className="flex flex-col gap-3">
            {data.topCategories.map((c) => {
              const max = Math.max(...data.topCategories.map((x) => x.ventas), 1);
              return (
                <li key={c.name}>
                  <div className="mb-1.5 flex items-center justify-between text-[10px] tracking-wider2">
                    <span className="font-medium text-ink-900">{c.name}</span>
                    <span className="text-smoke-600">{formatCOP(c.ventas)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-smoke-200">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${Math.round((c.ventas / max) * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel
          title="ALERTAS DE INVENTARIO"
          action={
            <Link href="/admin/inventario" className="text-[9px] font-semibold tracking-brand text-rose-500">
              VER TODO →
            </Link>
          }
        >
          {data.lowStockProducts.length === 0 ? (
            <p className="text-[10px] tracking-brand text-smoke-600">
              TODOS LOS PRODUCTOS TIENEN EXISTENCIAS SUFICIENTES.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {data.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium tracking-wider2 text-ink-900">
                      {p.name}
                    </p>
                    <p className="text-[9px] tracking-brand text-smoke-500">{p.sku}</p>
                  </div>
                  <Badge tone={p.stock <= 0 ? 'red' : 'amber'}>
                    {p.stock <= 0 ? 'AGOTADO' : `QUEDAN ${p.stock}`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ÚLTIMOS PEDIDOS */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold tracking-brand text-ink-950">ÚLTIMOS PEDIDOS</h2>
          <Link href="/admin/pedidos" className="text-[9px] font-semibold tracking-brand text-rose-500">
            VER TODOS →
          </Link>
        </div>
        <TableWrapper>
          <thead>
            <tr>
              <th>PEDIDO</th>
              <th>CLIENTE</th>
              <th>FECHA</th>
              <th>PAGO</th>
              <th>ESTADO</th>
              <th className="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.latestOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-rose-500">
                    #{order.orderNumber}
                  </Link>
                </td>
                <td>
                  {order.firstName} {order.lastName}
                </td>
                <td>{formatDateShort(order.createdAt)}</td>
                <td>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
                <td>
                  <Badge tone={order.status === 'ENTREGADO' ? 'green' : order.status === 'CANCELADO' ? 'red' : 'neutral'}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </td>
                <td className="text-right font-semibold">{formatCOP(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>
    </>
  );
}
