'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PageHeader, StatCard, Panel, TableWrapper } from '@/components/admin/AdminUI';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { formatNumber } from '@/lib/utils';

// ETIQUETAS LOCALES: NO IMPORTAMOS '@/lib/analytics' PORQUE ESE MÓDULO USA PRISMA (SOLO SERVIDOR).
const ANALYTICS_LABELS: Record<string, string> = {
  VISTA_PRODUCTO: 'PRODUCTOS VISTOS',
  AGREGADO_CARRITO: 'AGREGADOS AL CARRITO',
  FAVORITO: 'MARCADOS COMO FAVORITOS',
  COMPRA: 'COMPRAS',
  BUSQUEDA: 'BÚSQUEDAS',
  VISITA_CATEGORIA: 'CATEGORÍAS VISITADAS',
};

const ORDER = ['VISTA_PRODUCTO', 'AGREGADO_CARRITO', 'FAVORITO', 'COMPRA', 'BUSQUEDA', 'VISITA_CATEGORIA'];

const ROSE = '#F0508C';

type Analytics = {
  eventTotals: { type: string; count: number }[];
  topSearches: { query: string; count: number }[];
  topViewed: { id: string; name: string; slug: string; viewCount: number; soldCount: number; stock: number }[];
  topAddedToCart: { name: string; count: number }[];
  topFavorites: { name: string; count: number }[];
};

export function AnalyticsView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admin/analiticas', { cache: 'no-store' });
        const json = await response.json();
        if (json.ok) setData(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingBlock text="CARGANDO ANALÍTICAS…" />;
  if (!data) return <p className="text-[11px] tracking-brand">NO FUE POSIBLE CARGAR LAS ANALÍTICAS.</p>;

  const totals = new Map<string, number>(data.eventTotals.map((e) => [e.type, e.count] as [string, number]));

  return (
    <>
      <PageHeader
        title="ANALÍTICAS"
        description="COMPORTAMIENTO DE LAS CLIENTAS EN LOS ÚLTIMOS 30 DÍAS. ESTOS DATOS TE PERMITEN SABER QUÉ PRODUCTOS GENERAN MÁS INTERÉS Y CUÁLES CONVIERTEN MEJOR."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {ORDER.map((type) => (
          <StatCard
            key={type}
            label={ANALYTICS_LABELS[type]}
            value={formatNumber(totals.get(type) ?? 0)}
            accent={type === 'COMPRA'}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="PRODUCTOS MÁS VISTOS">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topViewed.map((p) => ({ name: p.name, vistas: p.viewCount }))}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid stroke="#E4E4E7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#71717A' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 8, fill: '#71717A' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} VISTAS`, 'TOTAL']}
                  contentStyle={{ fontSize: 11, borderRadius: 0, border: '1px solid #E4E4E7' }}
                />
                <Bar dataKey="vistas" fill={ROSE} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="BÚSQUEDAS MÁS FRECUENTES">
          {data.topSearches.length === 0 ? (
            <p className="text-[10px] tracking-brand text-smoke-600">AÚN NO HAY BÚSQUEDAS REGISTRADAS.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.topSearches.map((s) => {
                const max = Math.max(...data.topSearches.map((x) => x.count), 1);
                return (
                  <li key={s.query}>
                    <div className="mb-1.5 flex items-center justify-between text-[10px] tracking-wider2">
                      <Link
                        href={`/productos?q=${encodeURIComponent(s.query)}`}
                        target="_blank"
                        className="font-medium text-ink-900 hover:text-rose-500"
                      >
                        {s.query}
                      </Link>
                      <span className="text-smoke-600">{s.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-smoke-200">
                      <div
                        className="h-full bg-ink-950"
                        style={{ width: `${Math.round((s.count / max) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="MÁS AGREGADOS AL CARRITO">
          {data.topAddedToCart.length === 0 ? (
            <p className="text-[10px] tracking-brand text-smoke-600">SIN DATOS EN LOS ÚLTIMOS 30 DÍAS.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {data.topAddedToCart.map((p, index) => (
                <li key={`${p.name}-${index}`} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate text-[10px] tracking-wider2 text-ink-900">{p.name}</span>
                  <span className="text-[10px] font-semibold text-rose-500">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="MÁS MARCADOS COMO FAVORITOS">
          {data.topFavorites.length === 0 ? (
            <p className="text-[10px] tracking-brand text-smoke-600">SIN FAVORITOS REGISTRADOS.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {data.topFavorites.map((p, index) => (
                <li key={`${p.name}-${index}`} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate text-[10px] tracking-wider2 text-ink-900">{p.name}</span>
                  <span className="text-[10px] font-semibold text-rose-500">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5">
        <h2 className="mb-3 text-[11px] font-semibold tracking-brand text-ink-950">
          INTERÉS Y CONVERSIÓN POR PRODUCTO
        </h2>
        <TableWrapper>
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>VISTAS</th>
              <th>VENDIDOS</th>
              <th>STOCK</th>
              <th>TASA DE CONVERSIÓN</th>
              <th className="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.topViewed.map((p) => {
              const rate = p.viewCount > 0 ? (p.soldCount / p.viewCount) * 100 : null;
              return (
                <tr key={p.id}>
                  <td className="font-semibold text-ink-950">{p.name}</td>
                  <td>{formatNumber(p.viewCount)}</td>
                  <td>{formatNumber(p.soldCount)}</td>
                  <td className={p.stock <= 0 ? 'font-semibold text-red-600' : ''}>{p.stock}</td>
                  <td className="font-semibold text-rose-500">
                    {rate === null ? '—' : `${rate.toFixed(1)}%`}
                  </td>
                  <td className="text-right">
                    <Link href={`/producto/${p.slug}`} target="_blank" className="btn-ghost btn-sm">
                      VER EN LA TIENDA
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrapper>
      </div>
    </>
  );
}
