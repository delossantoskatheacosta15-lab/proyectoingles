'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader, SearchInput, Select, TableWrapper, Badge, StatCard } from '@/components/admin/AdminUI';
import { SafeImage } from '@/components/ui/SafeImage';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';
import { IconEdit, IconTrash, IconPlus, IconDownload } from '@/components/ui/Icons';
import { formatCOP, formatNumber } from '@/lib/utils';
import { PRODUCT_STATUSES } from '@/lib/constants';
import type { ProductDTO, CategoryDTO, Paginated } from '@/lib/types';

export function ProductsView() {
  const { success, error } = useToast();

  const [data, setData] = useState<Paginated<ProductDTO> | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<ProductDTO | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina: String(page), tamano: '20' });
      if (q.trim()) params.set('q', q.trim());
      if (estado) params.set('estado', estado);
      if (categoria) params.set('categoria', categoria);

      const response = await fetch(`/api/admin/productos?${params.toString()}`, { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) setData(json.data);
      else error(json.error);
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, [page, q, estado, categoria, error]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    (async () => {
      const response = await fetch('/api/admin/categorias', { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) setCategories(json.data.categories);
    })();
  }, []);

  const duplicate = async (id: string) => {
    const response = await fetch(`/api/admin/productos/${id}/duplicar`, { method: 'POST' });
    const json = await response.json();
    if (json.ok) {
      success(json.data.message);
      void load();
    } else {
      error(json.error);
    }
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE' });
    const json = await response.json();
    if (json.ok) {
      success(json.data.message);
      void load();
    } else {
      error(json.error);
    }
  };

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="PRODUCTOS"
        description="CREA, EDITA, DUPLICA Y CONTROLA LA VISIBILIDAD DE TODO TU CATÁLOGO."
        actions={
          <>
            <button
              type="button"
              onClick={() => window.open('/api/admin/exportar?tipo=productos', '_blank')}
              className="btn-ghost btn-sm"
            >
              <IconDownload className="h-4 w-4" /> EXPORTAR CSV
            </button>
            <Link href="/admin/productos/nuevo" className="btn-primary btn-sm">
              <IconPlus className="h-4 w-4" /> NUEVO PRODUCTO
            </Link>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="PRODUCTOS ENCONTRADOS" value={formatNumber(data?.total ?? 0)} />
        <StatCard label="ACTIVOS" value={formatNumber(items.filter((p) => p.status === 'ACTIVO').length)} />
        <StatCard label="AGOTADOS" value={formatNumber(items.filter((p) => p.status === 'AGOTADO').length)} accent={items.some((p) => p.status === 'AGOTADO')} />
        <StatCard label="BORRADORES" value={formatNumber(items.filter((p) => p.status === 'BORRADOR').length)} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="BUSCAR POR NOMBRE, SKU O ETIQUETA…" />
        <Select
          value={estado}
          onChange={(v) => { setEstado(v); setPage(1); }}
          label="ESTADO"
          options={[
            { value: '', label: 'TODOS LOS ESTADOS' },
            ...PRODUCT_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <Select
          value={categoria}
          onChange={(v) => { setCategoria(v); setPage(1); }}
          label="CATEGORÍA"
          options={[
            { value: '', label: 'TODAS LAS CATEGORÍAS' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : items.length === 0 ? (
        <p className="border border-dashed border-smoke-300 bg-white px-6 py-14 text-center text-[11px] font-semibold tracking-brand text-smoke-600">
          NO ENCONTRAMOS PRODUCTOS CON ESOS FILTROS.
        </p>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>CATEGORÍA</th>
              <th>PRECIO</th>
              <th>STOCK</th>
              <th>VENDIDOS</th>
              <th>ETIQUETAS</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-smoke-200">
                      <SafeImage src={product.images[0]} alt={product.name} label={product.name} sizes="44px" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="block max-w-[220px] truncate font-semibold text-ink-950 hover:text-rose-500"
                      >
                        {product.name}
                      </Link>
                      <span className="text-[9px] tracking-brand text-smoke-500">{product.sku}</span>
                    </div>
                  </div>
                </td>
                <td>{product.category.name}</td>
                <td>
                  <span className="font-semibold text-rose-500">{formatCOP(product.price)}</span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="ml-1.5 text-[9px] text-smoke-500 line-through">
                      {formatCOP(product.comparePrice)}
                    </span>
                  )}
                </td>
                <td>
                  <span className={product.stock <= 0 ? 'font-semibold text-red-600' : product.stock <= product.minStock ? 'font-semibold text-amber-600' : ''}>
                    {product.stock}
                  </span>
                </td>
                <td>{product.soldCount}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {product.isFeatured && <Badge tone="rose">DESTACADO</Badge>}
                    {product.isNew && <Badge tone="dark">NUEVO</Badge>}
                    {product.isOnSale && <Badge tone="amber">OFERTA</Badge>}
                  </div>
                </td>
                <td>
                  <Badge
                    tone={
                      product.status === 'ACTIVO'
                        ? 'green'
                        : product.status === 'AGOTADO'
                          ? 'red'
                          : product.status === 'BORRADOR'
                            ? 'amber'
                            : 'neutral'
                    }
                  >
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/producto/${product.slug}`}
                      target="_blank"
                      className="text-[9px] font-semibold tracking-brand text-smoke-600 hover:text-rose-500"
                    >
                      VER
                    </Link>
                    <button
                      type="button"
                      onClick={() => duplicate(product.id)}
                      className="text-[9px] font-semibold tracking-brand text-smoke-600 hover:text-rose-500"
                    >
                      DUPLICAR
                    </button>
                    <Link
                      href={`/admin/productos/${product.id}`}
                      aria-label="EDITAR"
                      className="text-smoke-600 hover:text-rose-500"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(product)}
                      aria-label="ELIMINAR"
                      className="text-smoke-600 hover:text-red-600"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
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

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="ELIMINAR PRODUCTO"
        message={`¿SEGURO QUE QUIERES ELIMINAR "${toDelete?.name ?? ''}"? SI EL PRODUCTO YA TIENE VENTAS, SE OCULTARÁ EN LUGAR DE ELIMINARSE PARA NO ROMPER EL HISTORIAL DE PEDIDOS.`}
        confirmText="ELIMINAR"
        danger
        onConfirm={() => toDelete && remove(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
