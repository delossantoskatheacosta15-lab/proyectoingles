'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, SearchInput, ErrorMessage } from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/ui/Modal';
import { LoadingBlock, Spinner, TableSkeleton } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCOP, formatNumber } from '@/lib/utils';
import type { ProductDTO } from '@/lib/types';

type CatalogInfo = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  position: number;
  active: boolean;
};

export function CatalogProductsView({ catalogId }: { catalogId: string }) {
  const { success, error: toastError } = useToast();

  const [catalog, setCatalog] = useState<CatalogInfo | null>(null);
  const [selected, setSelected] = useState<ProductDTO[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ProductDTO[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<ProductDTO | null>(null);

  // -------------------------------------------------------
  // CARGA DEL CATÁLOGO Y SUS PRODUCTOS
  // -------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const response = await fetch(`/api/admin/catalogos/${catalogId}`, { cache: 'no-store' });
      const json = await response.json();
      if (!json.ok) {
        setPageError(json.error);
        return;
      }
      setCatalog(json.data.catalog);
      setCoverUrl(json.data.catalog?.coverUrl ?? '');
      setSelected(
        (json.data.products ?? []).map((row: { position: number; product: ProductDTO }) => row.product)
      );
      setDirty(false);
    } catch {
      setPageError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, [catalogId]);

  useEffect(() => {
    load();
  }, [load]);

  // -------------------------------------------------------
  // BUSCADOR DE PRODUCTOS (CON RETARDO)
  // -------------------------------------------------------
  useEffect(() => {
    const term = search.trim();
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `/api/admin/productos?q=${encodeURIComponent(term)}&tamano=20`,
          { cache: 'no-store', signal: controller.signal }
        );
        const json = await response.json();
        if (!json.ok) {
          setSearchError(json.error);
          setResults([]);
          return;
        }
        setResults(json.data.items ?? []);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setSearchError('NO FUE POSIBLE BUSCAR PRODUCTOS. INTENTA NUEVAMENTE.');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [search]);

  // -------------------------------------------------------
  // ORDEN Y SELECCIÓN (SOLO EN MEMORIA HASTA GUARDAR)
  // -------------------------------------------------------
  function addProduct(product: ProductDTO) {
    if (selected.some((p) => p.id === product.id)) {
      toastError('ESTE PRODUCTO YA ESTÁ EN EL CATÁLOGO.');
      return;
    }
    setSelected((current) => [...current, product]);
    setDirty(true);
  }

  function removeProduct(productId: string) {
    setSelected((current) => current.filter((p) => p.id !== productId));
    setDirty(true);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    setSelected((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    setDirty(true);
  }

  // -------------------------------------------------------
  // GUARDAR CAMBIOS — ENVÍA TODOS LOS CAMPOS + PRODUCTIDS
  // -------------------------------------------------------
  async function save() {
    if (!catalog) return;
    setSaving(true);
    setPageError(null);
    try {
      const response = await fetch(`/api/admin/catalogos/${catalogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catalog.name,
          slug: catalog.slug,
          description: catalog.description ?? '',
          coverUrl: coverUrl.trim(),
          position: catalog.position,
          active: catalog.active,
          productIds: selected.map((p) => p.id),
        }),
      });
      const json = await response.json();
      if (!json.ok) {
        setPageError(json.error);
        toastError(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      const message = 'NO FUE POSIBLE GUARDAR LOS CAMBIOS. INTENTA NUEVAMENTE.';
      setPageError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock text="CARGANDO EL CATÁLOGO…" />;

  if (!catalog) {
    return (
      <>
        <PageHeader title="CATÁLOGO" description="NO FUE POSIBLE CARGAR LA INFORMACIÓN DEL CATÁLOGO." />
        <ErrorMessage message={pageError ?? 'NO ENCONTRAMOS ESTE CATÁLOGO.'} />
        <Link href="/admin/catalogos" className="btn-ghost btn-sm">
          VOLVER A CATÁLOGOS
        </Link>
      </>
    );
  }

  const selectedIds = new Set(selected.map((p) => p.id));

  return (
    <>
      <PageHeader
        title={`CATÁLOGO · ${catalog.name}`}
        description="ELIGE QUÉ PRODUCTOS COMPONEN ESTE CATÁLOGO Y EN QUÉ ORDEN SE MUESTRAN EN LA TIENDA."
        actions={
          <>
            <Link href="/admin/catalogos" className="btn-ghost btn-sm">
              VOLVER A CATÁLOGOS
            </Link>
            <button type="button" className="btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? <Spinner /> : null}
              {saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}
            </button>
          </>
        }
      />

      <ErrorMessage message={pageError} />

      {dirty && (
        <p className="mb-4 border border-rose-500 bg-rose-50 px-4 py-3 text-[10px] font-semibold tracking-brand text-rose-600">
          TIENES CAMBIOS SIN GUARDAR. PULSA “GUARDAR CAMBIOS” PARA APLICARLOS.
        </p>
      )}

      {/* PORTADA */}
      <Panel title="PORTADA DEL CATÁLOGO" className="mb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-32 w-44 shrink-0 overflow-hidden bg-smoke-200">
            <SafeImage
              src={coverUrl.trim() || null}
              alt={`PORTADA DE ${catalog.name}`}
              label={catalog.name}
              sizes="176px"
            />
          </div>
          <div className="flex-1">
            <label className="form-label" htmlFor="catalogo-cover-url">
              URL DE LA PORTADA
            </label>
            <input
              id="catalogo-cover-url"
              className="field"
              value={coverUrl}
              onChange={(e) => {
                setCoverUrl(e.target.value);
                setDirty(true);
              }}
              placeholder="HTTPS://…"
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              LA PORTADA SE GUARDA JUNTO CON EL ORDEN DE LOS PRODUCTOS AL PULSAR “GUARDAR CAMBIOS”.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={catalog.active ? 'green' : 'neutral'}>
                {catalog.active ? 'CATÁLOGO ACTIVO' : 'CATÁLOGO INACTIVO'}
              </Badge>
              <Badge tone="dark">ORDEN {catalog.position}</Badge>
              <Badge tone="neutral">/{catalog.slug}</Badge>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* PRODUCTOS DEL CATÁLOGO */}
        <Panel title={`PRODUCTOS EN EL CATÁLOGO · ${formatNumber(selected.length)}`}>
          {selected.length === 0 ? (
            <p className="py-10 text-center text-[10px] font-semibold tracking-brand text-smoke-600">
              ESTE CATÁLOGO AÚN NO TIENE PRODUCTOS. AGRÉGALOS DESDE EL BUSCADOR DE LA DERECHA.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {selected.map((product, index) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  <span className="w-6 shrink-0 text-center text-[10px] font-semibold tracking-brand text-smoke-500">
                    {index + 1}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-smoke-200">
                    <SafeImage
                      src={product.images[0] ?? null}
                      alt={product.name}
                      label={product.name}
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium tracking-wider2 text-ink-950">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[9px] tracking-brand text-smoke-500">
                      {product.category.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-rose-500">
                      {formatCOP(product.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      aria-label="SUBIR PRODUCTO"
                      title="SUBIR"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      aria-label="BAJAR PRODUCTO"
                      title="BAJAR"
                      disabled={index === selected.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm text-red-600 hover:border-red-500 hover:text-red-700"
                      onClick={() => setConfirmRemove(product)}
                    >
                      QUITAR
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* BUSCADOR DE PRODUCTOS */}
        <Panel
          title="AGREGAR PRODUCTOS"
          action={<SearchInput value={search} onChange={setSearch} placeholder="BUSCAR POR NOMBRE O SKU…" />}
        >
          <ErrorMessage message={searchError} />

          {searching ? (
            <TableSkeleton rows={5} />
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-[10px] font-semibold tracking-brand text-smoke-600">
              NO ENCONTRAMOS PRODUCTOS CON ESE CRITERIO DE BÚSQUEDA.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-smoke-200">
              {results.map((product) => {
                const alreadyAdded = selectedIds.has(product.id);
                return (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-smoke-200">
                      <SafeImage
                        src={product.images[0] ?? null}
                        alt={product.name}
                        label={product.name}
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium tracking-wider2 text-ink-950">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[9px] tracking-brand text-smoke-500">
                        {product.category.name} · {product.sku}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-rose-500">
                        {formatCOP(product.price)}
                      </p>
                    </div>
                    {alreadyAdded ? (
                      <Badge tone="neutral">YA AGREGADO</Badge>
                    ) : (
                      <button
                        type="button"
                        className="btn-dark btn-sm shrink-0"
                        onClick={() => addProduct(product)}
                      >
                        AGREGAR
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title="QUITAR PRODUCTO"
        message={`¿DESEAS QUITAR "${confirmRemove?.name ?? ''}" DE ESTE CATÁLOGO? EL CAMBIO SE APLICA AL GUARDAR.`}
        confirmText="SÍ, QUITAR"
        cancelText="CANCELAR"
        danger
        onConfirm={() => {
          if (confirmRemove) removeProduct(confirmRemove.id);
        }}
        onClose={() => setConfirmRemove(null)}
      />
    </>
  );
}
