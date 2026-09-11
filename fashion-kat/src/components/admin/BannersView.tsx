'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, ErrorMessage } from '@/components/admin/AdminUI';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { LoadingBlock, Spinner } from '@/components/ui/Skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { useToast } from '@/components/providers/ToastProvider';
import { formatNumber } from '@/lib/utils';

type Placement = 'HERO' | 'PROMO' | 'SECUNDARIO';

type BannerDTO = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  buttonText: string | null;
  link: string | null;
  position: number;
  placement: string;
  active: boolean;
};

type FormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  link: string;
  position: string;
  placement: Placement;
  active: boolean;
};

const PLACEMENTS: Placement[] = ['HERO', 'PROMO', 'SECUNDARIO'];

const PLACEMENT_HINTS: Record<Placement, string> = {
  HERO: 'SE MUESTRAN EN EL CARRUSEL PRINCIPAL DE LA PÁGINA DE INICIO.',
  PROMO: 'SE MUESTRAN EN LA FRANJA PROMOCIONAL DE LA TIENDA.',
  SECUNDARIO: 'SE MUESTRAN EN LOS BLOQUES DE APOYO DENTRO DE LA PÁGINA DE INICIO.',
};

const EMPTY_FORM: FormState = {
  title: '',
  subtitle: '',
  imageUrl: '',
  buttonText: '',
  link: '',
  position: '0',
  placement: 'HERO',
  active: true,
};

export function BannersView() {
  const { success, error: toastError } = useToast();

  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BannerDTO | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BannerDTO | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // -------------------------------------------------------
  // CARGA DE DATOS
  // -------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const response = await fetch('/api/admin/banners', { cache: 'no-store' });
      const json = await response.json();
      if (!json.ok) {
        setPageError(json.error);
        return;
      }
      setBanners(json.data.banners ?? []);
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
  function openCreate(placement: Placement = 'HERO') {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      placement,
      position: String(banners.filter((b) => b.placement === placement).length),
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(banner: BannerDTO) {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText ?? '',
      link: banner.link ?? '',
      position: String(banner.position),
      placement: (PLACEMENTS.includes(banner.placement as Placement)
        ? banner.placement
        : 'HERO') as Placement,
      active: banner.active,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (form.title.trim().length < 2) {
      setFormError('EL TÍTULO ES OBLIGATORIO Y DEBE TENER AL MENOS 2 CARACTERES.');
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(form.imageUrl.trim())) {
      setFormError('LA IMAGEN ES OBLIGATORIA Y DEBE SER UNA URL VÁLIDA QUE EMPIECE POR HTTP O HTTPS.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim().toUpperCase(),
        subtitle: form.subtitle.trim(),
        imageUrl: form.imageUrl.trim(),
        buttonText: form.buttonText.trim(),
        link: form.link.trim(),
        position: Number(form.position) || 0,
        placement: form.placement,
        active: form.active,
      };

      const response = await fetch(
        editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners',
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
      const message = 'NO FUE POSIBLE GUARDAR EL BANNER. INTENTA NUEVAMENTE.';
      setFormError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------
  // ACTIVAR / DESACTIVAR — SE ENVÍA EL OBJETO COMPLETO
  // -------------------------------------------------------
  async function toggleActive(banner: BannerDTO) {
    setBusyId(banner.id);
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: banner.title,
          subtitle: banner.subtitle ?? '',
          imageUrl: banner.imageUrl,
          buttonText: banner.buttonText ?? '',
          link: banner.link ?? '',
          position: banner.position,
          placement: banner.placement,
          active: !banner.active,
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
      toastError('NO FUE POSIBLE CAMBIAR EL ESTADO DEL BANNER. INTENTA NUEVAMENTE.');
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
      const response = await fetch(`/api/admin/banners/${target.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.ok) {
        toastError(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      toastError('NO FUE POSIBLE ELIMINAR EL BANNER. INTENTA NUEVAMENTE.');
    } finally {
      setDeleteTarget(null);
    }
  }

  const activeCount = banners.filter((b) => b.active).length;

  return (
    <>
      <PageHeader
        title="BANNERS"
        description="ADMINISTRA LAS PIEZAS GRÁFICAS DE LA TIENDA Y DECIDE DÓNDE Y EN QUÉ ORDEN APARECEN."
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={() => openCreate('HERO')}>
            NUEVO BANNER
          </button>
        }
      />

      <ErrorMessage message={pageError} />

      {/* EXPLICACIÓN DE UBICACIONES */}
      <div className="mb-5 border border-smoke-300 bg-white p-5">
        <p className="text-[10px] font-semibold tracking-brand text-ink-950">
          DÓNDE APARECE CADA UBICACIÓN
        </p>
        <ul className="mt-2.5 flex flex-col gap-1.5 text-[10px] leading-relaxed tracking-wide text-smoke-600">
          <li>
            <span className="font-semibold text-ink-900">HERO:</span> APARECEN EN EL CARRUSEL PRINCIPAL DE LA
            PÁGINA DE INICIO, A PANTALLA COMPLETA.
          </li>
          <li>
            <span className="font-semibold text-ink-900">PROMO:</span> APARECEN EN LA FRANJA PROMOCIONAL, IDEAL
            PARA DESCUENTOS Y ENVÍOS GRATIS.
          </li>
          <li>
            <span className="font-semibold text-ink-900">SECUNDARIO:</span> APARECEN EN LOS BLOQUES DE APOYO
            DENTRO DE LA PÁGINA DE INICIO.
          </li>
        </ul>
        <p className="mt-2.5 text-[10px] tracking-wide text-smoke-600">
          DENTRO DE CADA UBICACIÓN, LOS BANNERS CON MENOR NÚMERO DE ORDEN SE MUESTRAN PRIMERO.
        </p>
      </div>

      {loading ? (
        <LoadingBlock text="CARGANDO LOS BANNERS…" />
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-[10px] font-semibold tracking-brand text-smoke-600">
            {formatNumber(banners.length)} BANNERS · {formatNumber(activeCount)} ACTIVOS
          </p>

          {PLACEMENTS.map((placement) => {
            const group = banners
              .filter((b) => b.placement === placement)
              .sort((a, b) => a.position - b.position);

            return (
              <Panel
                key={placement}
                title={`${placement} · ${formatNumber(group.length)} BANNERS`}
                action={
                  <button type="button" className="btn-ghost btn-sm" onClick={() => openCreate(placement)}>
                    AGREGAR EN {placement}
                  </button>
                }
              >
                <p className="mb-4 text-[10px] tracking-wide text-smoke-600">
                  {PLACEMENT_HINTS[placement]}
                </p>

                {group.length === 0 ? (
                  <p className="py-8 text-center text-[10px] font-semibold tracking-brand text-smoke-600">
                    AÚN NO HAY BANNERS EN ESTA UBICACIÓN.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {group.map((banner) => (
                      <li
                        key={banner.id}
                        className="flex flex-col gap-4 border border-smoke-200 p-4 sm:flex-row sm:items-start"
                      >
                        <div className="relative h-28 w-full shrink-0 overflow-hidden bg-smoke-200 sm:w-48">
                          <SafeImage
                            src={banner.imageUrl}
                            alt={banner.title}
                            label={banner.title}
                            sizes="(max-width: 640px) 100vw, 192px"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[12px] font-semibold tracking-brand text-ink-950">
                              {banner.title}
                            </h3>
                            <Badge tone={banner.active ? 'green' : 'neutral'}>
                              {banner.active ? 'ACTIVO' : 'INACTIVO'}
                            </Badge>
                            <Badge tone="dark">ORDEN {banner.position}</Badge>
                          </div>

                          {banner.subtitle && (
                            <p className="mt-1.5 text-[10px] leading-relaxed tracking-wide text-smoke-600">
                              {banner.subtitle}
                            </p>
                          )}

                          <dl className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-[9px] tracking-brand text-smoke-500">
                            <div>
                              <dt className="inline font-semibold text-ink-700">BOTÓN: </dt>
                              <dd className="inline">{banner.buttonText || '—'}</dd>
                            </div>
                            <div>
                              <dt className="inline font-semibold text-ink-700">ENLACE: </dt>
                              <dd className="inline break-all">{banner.link || '—'}</dd>
                            </div>
                          </dl>

                          <div className="mt-3.5 flex flex-wrap gap-2">
                            <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(banner)}>
                              EDITAR
                            </button>
                            <button
                              type="button"
                              className="btn-ghost btn-sm"
                              disabled={busyId === banner.id}
                              onClick={() => toggleActive(banner)}
                            >
                              {busyId === banner.id ? <Spinner /> : null}
                              {banner.active ? 'DESACTIVAR' : 'ACTIVAR'}
                            </button>
                            <button
                              type="button"
                              className="btn-ghost btn-sm text-red-600 hover:border-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(banner)}
                            >
                              ELIMINAR
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      {/* FORMULARIO */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'EDITAR BANNER' : 'NUEVO BANNER'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              CANCELAR
            </button>
            <button type="submit" form="form-banner" className="btn-primary btn-sm" disabled={saving}>
              {saving ? <Spinner /> : null}
              {saving ? 'GUARDANDO…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR BANNER'}
            </button>
          </div>
        }
      >
        <form id="form-banner" onSubmit={submitForm} className="flex flex-col gap-4">
          <ErrorMessage message={formError} />

          <div>
            <label className="form-label" htmlFor="banner-title">
              TÍTULO
            </label>
            <input
              id="banner-title"
              className="field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="NUEVA COLECCIÓN"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="banner-subtitle">
              SUBTÍTULO (OPCIONAL)
            </label>
            <input
              id="banner-subtitle"
              className="field"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="PRENDAS QUE ACOMPAÑAN TU ESTILO"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="banner-image">
              URL DE LA IMAGEN
            </label>
            <input
              id="banner-image"
              className="field"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="HTTPS://…"
              required
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              LA IMAGEN ES OBLIGATORIA Y DEBE SER UNA URL COMPLETA.
            </p>
            {form.imageUrl.trim() && (
              <div className="relative mt-3 h-32 w-full overflow-hidden bg-smoke-200 sm:w-64">
                <SafeImage
                  src={form.imageUrl.trim()}
                  alt="VISTA PREVIA DEL BANNER"
                  label="VISTA PREVIA"
                  sizes="256px"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="banner-button">
                TEXTO DEL BOTÓN (OPCIONAL)
              </label>
              <input
                id="banner-button"
                className="field"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                placeholder="COMPRAR AHORA"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="banner-link">
                ENLACE (OPCIONAL)
              </label>
              <input
                id="banner-link"
                className="field"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/productos"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="banner-placement">
                UBICACIÓN
              </label>
              <select
                id="banner-placement"
                className="field"
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value as Placement })}
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
                {PLACEMENT_HINTS[form.placement]}
              </p>
            </div>

            <div>
              <label className="form-label" htmlFor="banner-position">
                ORDEN
              </label>
              <input
                id="banner-position"
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
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              className="h-4 w-4 accent-rose-500"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="label-xs">BANNER ACTIVO (VISIBLE EN LA TIENDA)</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="ELIMINAR BANNER"
        message={`¿SEGURO QUE DESEAS ELIMINAR EL BANNER "${deleteTarget?.title ?? ''}"? ESTA ACCIÓN NO SE PUEDE DESHACER.`}
        confirmText="SÍ, ELIMINAR"
        cancelText="CANCELAR"
        danger
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
