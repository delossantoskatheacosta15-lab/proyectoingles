'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, SearchInput, Select, ErrorMessage } from '@/components/admin/AdminUI';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { LoadingBlock, Spinner } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { useToast } from '@/components/providers/ToastProvider';
import { formatNumber, slugify } from '@/lib/utils';
import type { CatalogDTO } from '@/lib/types';

type FormState = {
  name: string;
  slug: string;
  description: string;
  coverUrl: string;
  position: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  description: '',
  coverUrl: '',
  position: '0',
  active: true,
};

export function CatalogsView() {
  const { success, error: toastError } = useToast();

  const [catalogs, setCatalogs] = useState<CatalogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogDTO | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CatalogDTO | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // -------------------------------------------------------
  // CARGA DE DATOS
  // -------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const response = await fetch('/api/admin/catalogos', { cache: 'no-store' });
      const json = await response.json();
      if (!json.ok) {
        setPageError(json.error);
        return;
      }
      setCatalogs(json.data.catalogs ?? []);
    } catch {
      setPageError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // -------------------------------------------------------
  // FORMULARIO
  // -------------------------------------------------------
  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, position: String(catalogs.length) });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(catalog: CatalogDTO) {
    setEditing(catalog);
    setForm({
      name: catalog.name,
      slug: catalog.slug,
      description: catalog.description ?? '',
      coverUrl: catalog.coverUrl ?? '',
      position: String(catalog.position),
      active: catalog.active,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (form.name.trim().length < 2) {
      setFormError('EL NOMBRE ES OBLIGATORIO Y DEBE TENER AL MENOS 2 CARACTERES.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim().toUpperCase(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim(),
        coverUrl: form.coverUrl.trim(),
        position: Number(form.position) || 0,
        active: form.active,
      };

      const response = await fetch(
        editing ? `/api/admin/catalogos/${editing.id}` : '/api/admin/catalogos',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await response.json();

      if (!json.ok) {
        setFormError(json.error);
        toastError(json.error);
        return;
      }

      setModalOpen(false);
      setEditing(null);
      success(json.data.message);
      await load();
    } catch {
      const message = 'NO FUE POSIBLE GUARDAR EL CATÁLOGO. INTENTA NUEVAMENTE.';
      setFormError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------
  // ACTIVAR / DESACTIVAR — SE ENVÍA EL OBJETO COMPLETO
  // -------------------------------------------------------
  async function toggleActive(catalog: CatalogDTO) {
    setBusyId(catalog.id);
    try {
      const response = await fetch(`/api/admin/catalogos/${catalog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catalog.name,
          slug: catalog.slug,
          description: catalog.description ?? '',
          coverUrl: catalog.coverUrl ?? '',
          position: catalog.position,
          active: !catalog.active,
        }),
      });
      const json = await response.json();
      if (!json.ok) {
        toastError(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      toastError('NO FUE POSIBLE CAMBIAR EL ESTADO DEL CATÁLOGO. INTENTA NUEVAMENTE.');
    } finally {
      setBusyId(null);
    }
  }

  // -------------------------------------------------------
  // ELIMINAR
  // -------------------------------------------------------
  async function confirmDelete() {
    const target = deleteTarget;
    if (!target) return;
    try {
      const response = await fetch(`/api/admin/catalogos/${target.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.ok) {
        toastError(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      toastError('NO FUE POSIBLE ELIMINAR EL CATÁLOGO. INTENTA NUEVAMENTE.');
    } finally {
      setDeleteTarget(null);
    }
  }

  // -------------------------------------------------------
  // FILTRADO EN PANTALLA
  // -------------------------------------------------------
  const term = search.trim().toUpperCase();
  const visible = catalogs.filter((c) => {
    const matchesTerm = !term || c.name.toUpperCase().includes(term) || c.slug.toUpperCase().includes(term);
    const matchesStatus =
      statusFilter === 'TODOS' ||
      (statusFilter === 'ACTIVOS' && c.active) ||
      (statusFilter === 'INACTIVOS' && !c.active);
    return matchesTerm && matchesStatus;
  });

  const activeCount = catalogs.filter((c) => c.active).length;

  return (
    <>
      <PageHeader
        title="CATÁLOGOS"
        description="AGRUPA PRODUCTOS EN COLECCIONES ESPECIALES CON SU PROPIA PORTADA Y SU PROPIO ORDEN DE PRESENTACIÓN."
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
            NUEVO CATÁLOGO
          </button>
        }
      />

      <ErrorMessage message={pageError} />

      <Panel
        title={`${formatNumber(catalogs.length)} CATÁLOGOS · ${formatNumber(activeCount)} ACTIVOS`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput value={search} onChange={setSearch} placeholder="BUSCAR CATÁLOGO…" />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              label="FILTRAR POR ESTADO"
              options={[
                { value: 'TODOS', label: 'TODOS' },
                { value: 'ACTIVOS', label: 'ACTIVOS' },
                { value: 'INACTIVOS', label: 'INACTIVOS' },
              ]}
            />
          </div>
        }
      >
        {loading ? (
          <LoadingBlock text="CARGANDO LOS CATÁLOGOS…" />
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-[10px] font-semibold tracking-brand text-smoke-600">
            NO HAY CATÁLOGOS QUE COINCIDAN CON LA BÚSQUEDA.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((catalog) => (
              <article key={catalog.id} className="flex flex-col border border-smoke-300 bg-white">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-smoke-200">
                  <SafeImage
                    src={catalog.coverUrl}
                    alt={catalog.name}
                    label={catalog.name}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute left-3 top-3">
                    <Badge tone={catalog.active ? 'green' : 'neutral'}>
                      {catalog.active ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </div>
                  <div className="absolute right-3 top-3">
                    <Badge tone="dark">ORDEN {catalog.position}</Badge>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-[12px] font-semibold tracking-brand text-ink-950">{catalog.name}</h3>
                  <p className="mt-1 text-[9px] tracking-brand text-smoke-500">/{catalog.slug}</p>
                  {catalog.description && (
                    <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed tracking-wide text-smoke-600">
                      {catalog.description}
                    </p>
                  )}
                  <p className="mt-3 text-[10px] font-semibold tracking-brand text-rose-500">
                    {formatNumber(catalog.productCount)} PRODUCTOS
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link href={`/admin/catalogos/${catalog.id}`} className="btn-dark btn-sm">
                      ADMINISTRAR PRODUCTOS
                    </Link>
                    <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(catalog)}>
                      EDITAR
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      disabled={busyId === catalog.id}
                      onClick={() => toggleActive(catalog)}
                    >
                      {busyId === catalog.id ? <Spinner /> : null}
                      {catalog.active ? 'DESACTIVAR' : 'ACTIVAR'}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm text-red-600 hover:border-red-500 hover:text-red-700"
                      onClick={() => setDeleteTarget(catalog)}
                    >
                      ELIMINAR
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {/* FORMULARIO */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'EDITAR CATÁLOGO' : 'NUEVO CATÁLOGO'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              CANCELAR
            </button>
            <button type="submit" form="form-catalogo" className="btn-primary btn-sm" disabled={saving}>
              {saving ? <Spinner /> : null}
              {saving ? 'GUARDANDO…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR CATÁLOGO'}
            </button>
          </div>
        }
      >
        <form id="form-catalogo" onSubmit={submitForm} className="flex flex-col gap-4">
          <ErrorMessage message={formError} />

          <div>
            <label className="form-label" htmlFor="catalogo-name">
              NOMBRE
            </label>
            <input
              id="catalogo-name"
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="COLECCIÓN PRIMAVERA"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="catalogo-slug">
              SLUG (OPCIONAL)
            </label>
            <input
              id="catalogo-slug"
              className="field"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder={slugify(form.name) || 'coleccion-primavera'}
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              SI LO DEJAS VACÍO SE GENERA AUTOMÁTICAMENTE A PARTIR DEL NOMBRE.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="catalogo-description">
              DESCRIPCIÓN (OPCIONAL)
            </label>
            <textarea
              id="catalogo-description"
              className="field min-h-[90px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="SELECCIÓN DE PRENDAS DESTACADAS DE LA TEMPORADA"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="catalogo-cover">
              URL DE LA PORTADA (OPCIONAL)
            </label>
            <input
              id="catalogo-cover"
              className="field"
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              placeholder="HTTPS://…"
            />
            {form.coverUrl.trim() && (
              <div className="relative mt-3 h-32 w-44 overflow-hidden bg-smoke-200">
                <SafeImage
                  src={form.coverUrl.trim()}
                  alt="VISTA PREVIA DE LA PORTADA"
                  label="VISTA PREVIA"
                  sizes="176px"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="catalogo-position">
                ORDEN
              </label>
              <input
                id="catalogo-position"
                type="number"
                min={0}
                className="field"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
              <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
                LOS NÚMEROS MENORES APARECEN PRIMERO.
              </p>
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2.5 pb-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-rose-500"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span className="label-xs">CATÁLOGO ACTIVO (VISIBLE EN LA TIENDA)</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ELIMINAR CATÁLOGO"
        message={`¿SEGURO QUE DESEAS ELIMINAR EL CATÁLOGO "${deleteTarget?.name ?? ''}"? LOS PRODUCTOS NO SE BORRAN, PERO SE PIERDE LA AGRUPACIÓN.`}
        confirmText="SÍ, ELIMINAR"
        cancelText="CANCELAR"
        danger
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
