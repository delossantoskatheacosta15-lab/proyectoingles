'use client';

import Link from 'next/link';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { PageHeader, StatCard, TableWrapper, Badge, SearchInput, Select } from '@/components/admin/AdminUI';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { IconDownload, IconChevron } from '@/components/ui/Icons';
import { formatNumber, cn } from '@/lib/utils';

type Variant = { id: string; sku: string; size: string; color: string; stock: number };
type Item = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  stock: number;
  minStock: number;
  soldCount: number;
  status: string;
  lowStock: boolean;
  outOfStock: boolean;
  variants: Variant[];
};

export function InventoryView() {
  const { success, error } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState({ total: 0, outOfStock: 0, lowStock: 0, totalUnits: 0, totalSold: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/inventario', { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) {
        setItems(json.data.items);
        setSummary(json.data.summary);
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveStock = async (payload: { productId?: string; variantId?: string; stock: number }) => {
    const response = await fetch('/api/admin/inventario', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (json.ok) {
      success(json.data.message);
      void load();
    } else {
      error(json.error);
    }
  };

  const filtered = items.filter((item) => {
    const term = q.trim().toUpperCase();
    const matchesTerm = !term || item.name.includes(term) || item.sku.includes(term);
    const matchesFilter =
      !filter ||
      (filter === 'agotado' && item.outOfStock) ||
      (filter === 'bajo' && item.lowStock) ||
      (filter === 'disponible' && !item.outOfStock && !item.lowStock);
    return matchesTerm && matchesFilter;
  });

  return (
    <>
      <PageHeader
        title="INVENTARIO"
        description="CONTROLA EL STOCK DE CADA PRODUCTO Y DE CADA VARIANTE. EL STOCK SE DESCUENTA AUTOMÁTICAMENTE CON CADA COMPRA."
        actions={
          <button
            type="button"
            onClick={() => window.open('/api/admin/exportar?tipo=inventario', '_blank')}
            className="btn-ghost btn-sm"
          >
            <IconDownload className="h-4 w-4" /> EXPORTAR INVENTARIO
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="PRODUCTOS" value={formatNumber(summary.total)} />
        <StatCard label="UNIDADES DISPONIBLES" value={formatNumber(summary.totalUnits)} />
        <StatCard label="UNIDADES VENDIDAS" value={formatNumber(summary.totalSold)} />
        <StatCard label="STOCK BAJO" value={formatNumber(summary.lowStock)} accent={summary.lowStock > 0} />
        <StatCard label="AGOTADOS" value={formatNumber(summary.outOfStock)} accent={summary.outOfStock > 0} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="BUSCAR POR NOMBRE O SKU…" />
        <Select
          value={filter}
          onChange={setFilter}
          label="FILTRO DE INVENTARIO"
          options={[
            { value: '', label: 'TODOS' },
            { value: 'disponible', label: 'DISPONIBLES' },
            { value: 'bajo', label: 'STOCK BAJO' },
            { value: 'agotado', label: 'AGOTADOS' },
          ]}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <p className="border border-dashed border-smoke-300 bg-white px-6 py-14 text-center text-[11px] font-semibold tracking-brand text-smoke-600">
          NO HAY PRODUCTOS QUE COINCIDAN CON EL FILTRO.
        </p>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>CATEGORÍA</th>
              <th>STOCK ACTUAL</th>
              <th>STOCK MÍNIMO</th>
              <th>VENDIDOS</th>
              <th>ALERTA</th>
              <th className="text-right">AJUSTAR</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <Fragment key={item.id}>
                <tr>
                  <td>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <IconChevron
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 text-smoke-500 transition-transform',
                          expanded === item.id && 'rotate-90'
                        )}
                      />
                      <span>
                        <span className="block max-w-[240px] truncate font-semibold text-ink-950">
                          {item.name}
                        </span>
                        <span className="text-[9px] tracking-brand text-smoke-500">
                          {item.sku} · {item.variants.length} VARIANTES
                        </span>
                      </span>
                    </button>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <span
                      className={cn(
                        'font-semibold',
                        item.outOfStock ? 'text-red-600' : item.lowStock ? 'text-amber-600' : 'text-ink-950'
                      )}
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td>{item.minStock}</td>
                  <td>{item.soldCount}</td>
                  <td>
                    {item.outOfStock ? (
                      <Badge tone="red">AGOTADO</Badge>
                    ) : item.lowStock ? (
                      <Badge tone="amber">STOCK BAJO</Badge>
                    ) : (
                      <Badge tone="green">DISPONIBLE</Badge>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {item.variants.length === 0 && (
                        <>
                          <input
                            type="number"
                            min={0}
                            defaultValue={item.stock}
                            onChange={(e) =>
                              setDrafts((d) => ({ ...d, [item.id]: Number(e.target.value) }))
                            }
                            className="field w-20 py-1.5 text-[10px]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              saveStock({ productId: item.id, stock: drafts[item.id] ?? item.stock })
                            }
                            className="btn-dark btn-sm"
                          >
                            GUARDAR
                          </button>
                        </>
                      )}
                      <Link href={`/admin/productos/${item.id}`} className="btn-ghost btn-sm">
                        EDITAR
                      </Link>
                    </div>
                  </td>
                </tr>

                {expanded === item.id &&
                  item.variants.map((variant) => (
                    <tr key={variant.id} className="bg-smoke-100">
                      <td colSpan={2}>
                        <span className="pl-8 text-[10px] tracking-wider2 text-ink-800">
                          TALLA {variant.size} · {variant.color}
                        </span>
                        <span className="ml-2 text-[9px] tracking-brand text-smoke-500">
                          {variant.sku}
                        </span>
                      </td>
                      <td colSpan={3}>
                        <span
                          className={cn(
                            'font-semibold',
                            variant.stock <= 0 ? 'text-red-600' : 'text-ink-950'
                          )}
                        >
                          {variant.stock} UNIDADES
                        </span>
                      </td>
                      <td>
                        {variant.stock <= 0 ? <Badge tone="red">AGOTADA</Badge> : <Badge tone="green">OK</Badge>}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min={0}
                            defaultValue={variant.stock}
                            onChange={(e) =>
                              setDrafts((d) => ({ ...d, [variant.id]: Number(e.target.value) }))
                            }
                            className="field w-20 py-1.5 text-[10px]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              saveStock({
                                variantId: variant.id,
                                stock: drafts[variant.id] ?? variant.stock,
                              })
                            }
                            className="btn-dark btn-sm"
                          >
                            GUARDAR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
        </TableWrapper>
      )}
    </>
  );
}
