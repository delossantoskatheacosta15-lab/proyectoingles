'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { IconFilter, IconClose, IconCheck } from '@/components/ui/Icons';
import { SORT_OPTIONS } from '@/lib/constants';
import { formatCOP, cn } from '@/lib/utils';
import type { ProductDTO, CategoryDTO, Paginated } from '@/lib/types';

export type Facets = {
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  brands: string[];
  categories: CategoryDTO[];
};

type Filters = {
  categoria: string;
  q: string;
  talla: string;
  color: string;
  marca: string;
  disponibilidad: string;
  descuento: boolean;
  valoracion: number;
  precioMin: number | '';
  precioMax: number | '';
  orden: string;
  pagina: number;
};

function emptyFilters(defaults: Partial<Filters> = {}): Filters {
  return {
    categoria: '',
    q: '',
    talla: '',
    color: '',
    marca: '',
    disponibilidad: '',
    descuento: false,
    valoracion: 0,
    precioMin: '',
    precioMax: '',
    orden: 'recientes',
    pagina: 1,
    ...defaults,
  };
}

export function ProductBrowser({
  facets,
  lockedFilters = {},
  title,
  showCategoryFilter = true,
}: {
  facets: Facets;
  lockedFilters?: Record<string, string>;
  title?: string;
  showCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() =>
    emptyFilters({
      categoria: searchParams.get('categoria') ?? '',
      q: searchParams.get('q') ?? '',
      talla: searchParams.get('talla') ?? '',
      color: searchParams.get('color') ?? '',
      marca: searchParams.get('marca') ?? '',
      disponibilidad: searchParams.get('disponibilidad') ?? '',
      descuento: searchParams.get('descuento') === 'true',
      valoracion: Number(searchParams.get('valoracion') ?? 0) || 0,
      precioMin: searchParams.get('precioMin') ? Number(searchParams.get('precioMin')) : '',
      precioMax: searchParams.get('precioMax') ? Number(searchParams.get('precioMax')) : '',
      orden: searchParams.get('orden') ?? 'recientes',
      pagina: Number(searchParams.get('pagina') ?? 1) || 1,
    })
  );

  const [data, setData] = useState<Paginated<ProductDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(lockedFilters).forEach(([k, v]) => params.set(k, v));
    if (filters.categoria) params.set('categoria', filters.categoria);
    if (filters.q) params.set('q', filters.q);
    if (filters.talla) params.set('talla', filters.talla);
    if (filters.color) params.set('color', filters.color);
    if (filters.marca) params.set('marca', filters.marca);
    if (filters.disponibilidad) params.set('disponibilidad', filters.disponibilidad);
    if (filters.descuento) params.set('descuento', 'true');
    if (filters.valoracion) params.set('valoracion', String(filters.valoracion));
    if (filters.precioMin !== '') params.set('precioMin', String(filters.precioMin));
    if (filters.precioMax !== '') params.set('precioMax', String(filters.precioMax));
    if (filters.orden) params.set('orden', filters.orden);
    params.set('pagina', String(filters.pagina));
    params.set('tamano', '12');
    return params.toString();
  }, [filters, lockedFilters]);

  // CARGA SIN RECARGAR LA PÁGINA
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const response = await fetch(`/api/productos?${queryString}`, { cache: 'no-store' });
        const json = await response.json();
        if (!cancelled && json.ok) setData(json.data);
      } catch {
        if (!cancelled) setData({ items: [], page: 1, pageSize: 12, total: 0, totalPages: 1 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryString]);

  // MANTIENE LA URL SINCRONIZADA PARA PODER COMPARTIRLA
  useEffect(() => {
    const visible = new URLSearchParams(queryString);
    visible.delete('tamano');
    Object.keys(lockedFilters).forEach((k) => visible.delete(k));
    if (visible.get('pagina') === '1') visible.delete('pagina');
    if (visible.get('orden') === 'recientes') visible.delete('orden');
    const search = visible.toString();
    router.replace(search ? `?${search}` : '?', { scroll: false });
  }, [queryString, router, lockedFilters]);

  const update = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch, pagina: patch.pagina ?? 1 }));
  }, []);

  const clearAll = () => setFilters(emptyFilters({ q: filters.q }));

  const activeCount = [
    filters.categoria,
    filters.talla,
    filters.color,
    filters.marca,
    filters.disponibilidad,
    filters.descuento ? 'x' : '',
    filters.valoracion ? 'x' : '',
    filters.precioMin !== '' ? 'x' : '',
    filters.precioMax !== '' ? 'x' : '',
  ].filter(Boolean).length;

  const FilterContent = (
    <div className="flex flex-col gap-8">
      {showCategoryFilter && (
        <FilterGroup label="CATEGORÍA">
          <div className="flex flex-col gap-1.5">
            <FilterRadio
              label="TODAS"
              checked={filters.categoria === ''}
              onChange={() => update({ categoria: '' })}
            />
            {facets.categories.map((c) => (
              <FilterRadio
                key={c.id}
                label={`${c.name} (${c.productCount})`}
                checked={filters.categoria === c.slug}
                onChange={() => update({ categoria: c.slug })}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup label="PRECIO">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="MÍNIMO"
            value={filters.precioMin}
            onChange={(e) => update({ precioMin: e.target.value === '' ? '' : Number(e.target.value) })}
            className="field py-2.5 text-[10px]"
          />
          <span className="text-smoke-500">—</span>
          <input
            type="number"
            min={0}
            placeholder="MÁXIMO"
            value={filters.precioMax}
            onChange={(e) => update({ precioMax: e.target.value === '' ? '' : Number(e.target.value) })}
            className="field py-2.5 text-[10px]"
          />
        </div>
        <p className="mt-2 text-[9px] tracking-brand text-smoke-500">
          DESDE {formatCOP(facets.minPrice)} HASTA {formatCOP(facets.maxPrice)}
        </p>
      </FilterGroup>

      <FilterGroup label="TALLA">
        <div className="flex flex-wrap gap-2">
          {facets.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => update({ talla: filters.talla === size ? '' : size })}
              className={cn(
                'min-w-11 border px-3 py-2 text-[10px] font-semibold tracking-wider2 transition-colors',
                filters.talla === size
                  ? 'border-ink-950 bg-ink-950 text-white'
                  : 'border-smoke-300 bg-white text-ink-700 hover:border-ink-950'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="COLOR">
        <div className="flex flex-wrap gap-2.5">
          {facets.colors.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.name}
              aria-label={color.name}
              onClick={() => update({ color: filters.color === color.name ? '' : color.name })}
              className={cn(
                'relative h-8 w-8 border transition-transform hover:scale-110',
                filters.color === color.name ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-smoke-300'
              )}
              style={{ backgroundColor: color.hex }}
            >
              {filters.color === color.name && (
                <IconCheck
                  className={cn(
                    'absolute inset-0 m-auto h-4 w-4',
                    color.name === 'BLANCO' || color.name === 'BEIGE' ? 'text-ink-950' : 'text-white'
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      {facets.brands.length > 1 && (
        <FilterGroup label="MARCA">
          <div className="flex flex-col gap-1.5">
            <FilterRadio label="TODAS" checked={filters.marca === ''} onChange={() => update({ marca: '' })} />
            {facets.brands.map((brand) => (
              <FilterRadio
                key={brand}
                label={brand}
                checked={filters.marca === brand}
                onChange={() => update({ marca: brand })}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup label="DISPONIBILIDAD">
        <div className="flex flex-col gap-1.5">
          <FilterRadio
            label="TODOS"
            checked={filters.disponibilidad === ''}
            onChange={() => update({ disponibilidad: '' })}
          />
          <FilterRadio
            label="DISPONIBLES"
            checked={filters.disponibilidad === 'disponible'}
            onChange={() => update({ disponibilidad: 'disponible' })}
          />
          <FilterRadio
            label="AGOTADOS"
            checked={filters.disponibilidad === 'agotado'}
            onChange={() => update({ disponibilidad: 'agotado' })}
          />
        </div>
      </FilterGroup>

      <FilterGroup label="DESCUENTO">
        <label className="flex cursor-pointer items-center gap-2.5 text-[10px] tracking-wider2 text-ink-700">
          <input
            type="checkbox"
            checked={filters.descuento}
            onChange={(e) => update({ descuento: e.target.checked })}
            className="h-4 w-4 accent-rose-500"
          />
          SOLO PRODUCTOS CON DESCUENTO
        </label>
      </FilterGroup>

      <FilterGroup label="VALORACIÓN">
        <div className="flex flex-col gap-1.5">
          <FilterRadio
            label="TODAS"
            checked={filters.valoracion === 0}
            onChange={() => update({ valoracion: 0 })}
          />
          {[4, 3].map((v) => (
            <FilterRadio
              key={v}
              label={`${v} ESTRELLAS O MÁS`}
              checked={filters.valoracion === v}
              onChange={() => update({ valoracion: v })}
            />
          ))}
        </div>
      </FilterGroup>

      <button type="button" onClick={clearAll} className="btn-ghost w-full">
        LIMPIAR FILTROS
      </button>
    </div>
  );

  return (
    <div className="container-fk py-10">
      {title && (
        <div className="mb-8">
          <h1 className="heading-lg text-ink-950">{title}</h1>
          {filters.q && (
            <p className="mt-2 text-[11px] tracking-brand text-smoke-600">
              RESULTADOS PARA: <span className="text-rose-500">{filters.q}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex gap-10">
        {/* FILTROS — ESCRITORIO */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-[190px] max-h-[calc(100vh-210px)] overflow-y-auto pr-2">
            <p className="mb-6 text-[11px] font-semibold tracking-brand text-ink-950">FILTROS</p>
            {FilterContent}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* BARRA SUPERIOR */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-smoke-300 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="btn-ghost btn-sm lg:hidden"
              >
                <IconFilter className="h-4 w-4" />
                FILTROS {activeCount > 0 && `(${activeCount})`}
              </button>
              <p className="text-[10px] tracking-brand text-smoke-600">
                {loading ? 'CARGANDO…' : `${data?.total ?? 0} PRODUCTOS`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="orden" className="hidden text-[10px] tracking-brand text-smoke-600 sm:block">
                ORDENAR POR
              </label>
              <select
                id="orden"
                value={filters.orden}
                onChange={(e) => update({ orden: e.target.value })}
                className="field w-auto py-2.5 pr-8 text-[10px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RESULTADOS */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <>
              <ProductGrid products={data?.items ?? []} />
              <Pagination
                page={data?.page ?? 1}
                totalPages={data?.totalPages ?? 1}
                onChange={(page) => {
                  setFilters((current) => ({ ...current, pagina: page }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-14"
              />
            </>
          )}
        </div>
      </div>

      {/* FILTROS — MÓVIL */}
      {panelOpen && (
        <div className="fixed inset-0 z-[105] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70" onClick={() => setPanelOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-smoke-300 bg-white px-5 py-4">
              <span className="text-[11px] font-semibold tracking-brand">FILTROS</span>
              <button type="button" onClick={() => setPanelOpen(false)} aria-label="CERRAR FILTROS">
                <IconClose />
              </button>
            </div>
            <div className="px-5 py-6">{FilterContent}</div>
            <div className="sticky bottom-0 border-t border-smoke-300 bg-white p-4">
              <button type="button" onClick={() => setPanelOpen(false)} className="btn-dark w-full">
                VER {data?.total ?? 0} PRODUCTOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label-xs mb-3 text-ink-800">{label}</p>
      {children}
    </div>
  );
}

function FilterRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex items-center gap-2.5 text-left text-[10px] tracking-wider2 transition-colors',
        checked ? 'text-rose-500' : 'text-ink-700 hover:text-ink-950'
      )}
    >
      <span
        className={cn(
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
          checked ? 'border-rose-500' : 'border-smoke-400'
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
      </span>
      {label}
    </button>
  );
}
