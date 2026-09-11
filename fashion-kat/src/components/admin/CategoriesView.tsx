'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, SearchInput, Select, TableWrapper, ErrorMessage } from '@/components/admin/AdminUI';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { TableSkeleton, Spinner } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { useToast } from '@/components/providers/ToastProvider';
import { formatNumber, slugify } from '@/lib/utils';
import type { CategoryDTO } from '@/lib/types';

type FormState = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  position: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  position: '0',
  active: true,
};

export function CategoriesView() {
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODAS');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CategoryDTO | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);

  // -------------------------------------------------------
  // CARGA DE DATOS
  // -------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const response = await fetch('/api/admin/categorias', { cache: 'no-store' });
      const json = await response.json();
      if (!json.ok) {
        setPageError(json.error);
        return;
      }
      setCategories(json.data.categories ?? []);
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
    setForm({ ...EMPTY_FORM, position: String(categories.length) });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(category: CategoryDTO) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      position: String(category.position),
      active: category.active,
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
        imageUrl: form.imageUrl.trim(),
        position: Number(form.position) || 0,
        active: form.active,
      };

      const response = await fetch(
        editing ? `/api/admin/categorias/${editing.id}` : '/api/admin/categorias',
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
      const message = 'NO FUE POSIBLE GUARDAR LA CATEGORÍA. INTENTA NUEVAMENTE.';
      setFormError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------
  // ELIMINAR
  // -------------------------------------------------------
  async function confirmDelete() {
    const target = deleteTarget;
    if (!target) return;
    try {
      const response = await fetch(`/api/admin/categorias/${target.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.ok) {
        toastError(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      toastError('NO FUE POSIBLE ELIMINAR LA CATEGORÍA. INTENTA NUEVAMENTE.');
    } finally {
      setDeleteTarget(null);
    }
  }

  // -------------------------------------------------------
  // ORDEN (SUBIR / BAJAR) — SE ENVÍA EL OBJETO COMPLETO
  // -------------------------------------------------------
  async function move(category: CategoryDTO, direction: -1 | 1) {
    const newPosition = category.position + direction;
    if (newPosition < 0) return;

    setReordering(category.id);
    try {
      const response = await fetch(`/api/admin/categorias/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          imageUrl: category.imageUrl ?? '',
          position: newPosition,
          active: category.active,
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
      toastError('NO FUE POSIBLE CAMBIAR EL ORDEN. INTENTA NUEVAMENTE.');
    } finally {
      setReordering(null);
    }
  }

  // -------------------------------------------------------
  // FILTRADO EN PANTALLA
  // -------------------------------------------------------
  const term = search.trim().toUpperCase();
  const visible = categories.filter((c) => {
    const matchesTerm = !term || c.name.toUpperCase().includes(term) || c.slug.toUpperCase().includes(term);
    const matchesStatus =
      statusFilter === 'TODAS' ||
      (statusFilter === 'ACTIVAS' && c.active) ||
      (statusFilter === 'INACTIVAS' && !c.active);
    return matchesTerm && matchesStatus;
  });

  const activeCount = categories.filter((c) => c.active).length;

  return (
    <>
      <PageHeader
        title="CATEGORÍAS"
        description="ORGANIZA LAS COLECCIONES DE LA TIENDA, SU IMAGEN, SU ORDEN DE APARICIÓN Y SU VISIBILIDAD."
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
            NUEVA CATEGORÍA
          </button>
        }
      />

      <ErrorMessage message={pageError} />

      <Panel
        title={`${formatNumber(categories.length)} CATEGORÍAS · ${formatNumber(activeCount)} ACTIVAS`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput value={search} onChange={setSearch} placeholder="BUSCAR CATEGORÍA…" />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              label="FILTRAR POR ESTADO"
              options={[
                { value: 'TODAS', label: 'TODAS' },
                { value: 'ACTIVAS', label: 'ACTIVAS' },
                { value: 'INACTIVAS', label: 'INACTIVAS' },
              ]}
            />
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={6} />
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-[10px] font-semibold tracking-brand text-smoke-600">
            NO HAY CATEGORÍAS QUE COINCIDAN CON LA BÚSQUEDA.
          </p>
        ) : (
          <TableWrapper>
            <thead>
              <tr>
                <th>IMAGEN</th>
                <th>NOMBRE</th>
                <th>SLUG</th>
                <th className="text-right">PRODUCTOS</th>
                <th className="text-center">ORDEN</th>
                <th>ESTADO</th>
                <th className="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="relative h-12 w-12 overflow-hidden bg-smoke-200">
                      <SafeImage
                        src={category.imageUrl}
                        alt={category.name}
                        label={category.name}
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td>
                    <p className="font-semibold tracking-wider2 text-ink-950">{category.name}</p>
                    {category.description && (
                      <p className="mt-1 max-w-xs truncate text-[9px] tracking-brand text-smoke-500">
                        {category.description}
                      </p>
                    )}
                  </td>
                  <td className="text-smoke-600">/{category.slug}</td>
                  <td className="text-right font-semibold">{formatNumber(category.productCount)}</td>
                  <td>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        aria-label="SUBIR EN EL ORDEN"
                        title="SUBIR"
                        disabled={reordering === category.id || category.position <= 0}
                        onClick={() => move(category, -1)}
                      >
                        ↑
                      </button>
                      <span className="min-w-[24px] text-center text-[10px] font-semibold tracking-brand text-ink-900">
                        {reordering === category.id ? <Spinner className="h-3 w-3 text-rose-500" /> : category.position}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        aria-label="BAJAR EN EL ORDEN"
                        title="BAJAR"
                        disabled={reordering === category.id}
                        onClick={() => move(category, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <Badge tone={category.active ? 'green' : 'neutral'}>
                      {category.active ? 'ACTIVA' : 'INACTIVA'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(category)}>
                        EDITAR
                      </button>
                      <button
                        type="button"
                        className="btn-ghost btn-sm text-red-600 hover:border-red-500 hover:text-red-700"
                        onClick={() => setDeleteTarget(category)}
                      >
                        ELIMINAR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        )}
      </Panel>

      {/* FORMULARIO */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              CANCELAR
            </button>
            <button type="submit" form="form-categoria" className="btn-primary btn-sm" disabled={saving}>
              {saving ? <Spinner /> : null}
              {saving ? 'GUARDANDO…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR CATEGORÍA'}
            </button>
          </div>
        }
      >
        <form id="form-categoria" onSubmit={submitForm} className="flex flex-col gap-4">
          <ErrorMessage message={formError} />

          <div>
            <label className="form-label" htmlFor="categoria-name">
              NOMBRE
            </label>
            <input
              id="categoria-name"
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VESTIDOS"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="categoria-slug">
              SLUG (OPCIONAL)
            </label>
            <input
              id="categoria-slug"
              className="field"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder={slugify(form.name) || 'vestidos'}
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              SI LO DEJAS VACÍO SE GENERA AUTOMÁTICAMENTE A PARTIR DEL NOMBRE.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="categoria-description">
              DESCRIPCIÓN (OPCIONAL)
            </label>
            <textarea
              id="categoria-description"
              className="field min-h-[90px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="PRENDAS FEMENINAS PARA TODA OCASIÓN"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="categoria-image">
              URL DE LA IMAGEN (OPCIONAL)
            </label>
            <input
              id="categoria-image"
              className="field"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="HTTPS://…"
            />
            {form.imageUrl.trim() && (
              <div className="relative mt-3 h-28 w-28 overflow-hidden bg-smoke-200">
                <SafeImage
                  src={form.imageUrl.trim()}
                  alt="VISTA PREVIA DE LA CATEGORÍA"
                  label="VISTA PREVIA"
                  sizes="112px"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="categoria-position">
                ORDEN
              </label>
              <input
                id="categoria-position"
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
                <span className="label-xs">CATEGORÍA ACTIVA (VISIBLE EN LA TIENDA)</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ELIMINAR CATEGORÍA"
        message={`¿SEGURO QUE DESEAS ELIMINAR LA CATEGORÍA "${deleteTarget?.name ?? ''}"? ESTA ACCIÓN NO SE PUEDE DESHACER.`}
        confirmText="SÍ, ELIMINAR"
        cancelText="CANCELAR"
        danger
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
