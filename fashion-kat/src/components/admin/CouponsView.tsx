'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard, Badge, SearchInput, TableWrapper, ErrorMessage } from '@/components/admin/AdminUI';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCOP, formatNumber, formatDateShort } from '@/lib/utils';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: 'PORCENTAJE' | 'VALOR_FIJO';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  startsAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  categories: string | null;
  active: boolean;
  useCount: number;
  createdAt: string;
};

type FormState = {
  code: string;
  description: string;
  discountType: 'PORCENTAJE' | 'VALOR_FIJO';
  discountValue: string;
  minPurchase: string;
  maxDiscount: string;
  startsAt: string;
  expiresAt: string;
  maxUses: string;
  maxUsesPerUser: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  code: '',
  description: '',
  discountType: 'PORCENTAJE',
  discountValue: '',
  minPurchase: '0',
  maxDiscount: '',
  startsAt: '',
  expiresAt: '',
  maxUses: '',
  maxUsesPerUser: '1',
  active: true,
};

// CONVIERTE UNA FECHA ISO AL FORMATO QUE ACEPTA <input type="date">
function toDateInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function isExpired(coupon: Coupon): boolean {
  return !!coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
}

function discountLabel(coupon: Coupon): string {
  return coupon.discountType === 'PORCENTAJE'
    ? `${coupon.discountValue}%`
    : formatCOP(coupon.discountValue);
}

export function CouponsView() {
  const { success, error: errorToast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/admin/cupones${search ? `?q=${encodeURIComponent(search)}` : ''}`,
        { cache: 'no-store' }
      );
      const json = await response.json();
      if (!json.ok) {
        setErrorMessage(json.error);
        errorToast(json.error);
        return;
      }
      setCoupons(json.data.coupons as Coupon[]);
    } catch {
      setErrorMessage('NO FUE POSIBLE CARGAR LOS CUPONES.');
    } finally {
      setLoading(false);
    }
  }, [search, errorToast]);

  useEffect(() => {
    void load();
  }, [load]);

  // BÚSQUEDA CON PEQUEÑO RETARDO PARA NO SATURAR LA API
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim().toUpperCase()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const stats = useMemo(() => {
    const total = coupons.length;
    const expired = coupons.filter(isExpired).length;
    const active = coupons.filter((c) => c.active && !isExpired(c)).length;
    const uses = coupons.reduce((sum, c) => sum + (c.usedCount ?? 0), 0);
    return { total, active, expired, uses };
  }, [coupons]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minPurchase: String(coupon.minPurchase ?? 0),
      maxDiscount: coupon.maxDiscount === null ? '' : String(coupon.maxDiscount),
      startsAt: toDateInput(coupon.startsAt),
      expiresAt: toDateInput(coupon.expiresAt),
      maxUses: coupon.maxUses === null ? '' : String(coupon.maxUses),
      maxUsesPerUser: String(coupon.maxUsesPerUser ?? 1),
      active: coupon.active,
    });
    setModalOpen(true);
  }

  function buildPayload(state: FormState) {
    return {
      code: state.code.trim().toUpperCase(),
      description: state.description.trim(),
      discountType: state.discountType,
      discountValue: Number(state.discountValue || 0),
      minPurchase: Number(state.minPurchase || 0),
      maxDiscount: state.maxDiscount === '' ? null : Number(state.maxDiscount),
      startsAt: state.startsAt ? new Date(state.startsAt).toISOString() : undefined,
      expiresAt: state.expiresAt ? new Date(state.expiresAt).toISOString() : null,
      maxUses: state.maxUses === '' ? null : Number(state.maxUses),
      maxUsesPerUser: Number(state.maxUsesPerUser || 1),
      categories: '',
      active: state.active,
    };
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        editing ? `/api/admin/cupones/${editing.id}` : '/api/admin/cupones',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(form)),
        }
      );
      const json = await response.json();
      if (!json.ok) {
        setErrorMessage(json.error);
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch {
      errorToast('NO FUE POSIBLE GUARDAR EL CUPÓN.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      const response = await fetch(`/api/admin/cupones/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: coupon.code,
          description: coupon.description ?? '',
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minPurchase: coupon.minPurchase ?? 0,
          maxDiscount: coupon.maxDiscount,
          startsAt: coupon.startsAt,
          expiresAt: coupon.expiresAt,
          maxUses: coupon.maxUses,
          maxUsesPerUser: coupon.maxUsesPerUser ?? 1,
          categories: coupon.categories ?? '',
          active: !coupon.active,
        }),
      });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      errorToast('NO FUE POSIBLE ACTUALIZAR EL CUPÓN.');
    }
  }

  async function removeCoupon(coupon: Coupon) {
    try {
      const response = await fetch(`/api/admin/cupones/${coupon.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      await load();
    } catch {
      errorToast('NO FUE POSIBLE ELIMINAR EL CUPÓN.');
    }
  }

  return (
    <>
      <PageHeader
        title="CUPONES DE DESCUENTO"
        description="CREA, EDITA Y CONTROLA LOS CÓDIGOS PROMOCIONALES QUE TUS CLIENTES PUEDEN APLICAR EN EL CARRITO."
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
            NUEVO CUPÓN
          </button>
        }
      />

      <ErrorMessage message={errorMessage} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="TOTAL DE CUPONES" value={formatNumber(stats.total)} />
        <StatCard label="ACTIVOS" value={formatNumber(stats.active)} accent={stats.active > 0} />
        <StatCard label="EXPIRADOS" value={formatNumber(stats.expired)} />
        <StatCard label="USOS TOTALES" value={formatNumber(stats.uses)} hint="REDENCIONES REGISTRADAS" />
      </div>

      {/* AVISO INFORMATIVO */}
      <div className="mt-5 border border-rose-200 bg-rose-50 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-brand text-rose-600">
          CÓMO FUNCIONAN LOS CUPONES
        </p>
        <p className="mt-2 text-[10px] leading-relaxed tracking-wider2 text-ink-700">
          EL CLIENTE ESCRIBE EL CÓDIGO EN EL CARRITO ANTES DE PAGAR Y EL DESCUENTO SE APLICA
          AUTOMÁTICAMENTE SI EL CUPÓN ESTÁ ACTIVO, VIGENTE, NO SUPERÓ SU LÍMITE DE USOS Y LA COMPRA
          ALCANZA EL MONTO MÍNIMO CONFIGURADO.
        </p>
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="BUSCAR POR CÓDIGO…" />
        <span className="text-[10px] tracking-brand text-smoke-600">
          {formatNumber(coupons.length)} CUPONES EN LA LISTA
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : coupons.length === 0 ? (
        <div className="border border-smoke-300 bg-white px-6 py-16 text-center">
          <p className="text-[11px] font-semibold tracking-brand text-ink-950">
            NO HAY CUPONES PARA MOSTRAR.
          </p>
          <p className="mt-2 text-[10px] tracking-wider2 text-smoke-600">
            CREA TU PRIMER CÓDIGO PROMOCIONAL PARA IMPULSAR LAS VENTAS.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>DESCUENTO</th>
              <th>COMPRA MÍNIMA</th>
              <th>USOS</th>
              <th>VIGENCIA</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const expired = isExpired(coupon);
              return (
                <tr key={coupon.id}>
                  <td>
                    <p className="font-semibold tracking-brand text-ink-950">{coupon.code}</p>
                    {coupon.description && (
                      <p className="mt-1 text-[9px] tracking-wider2 text-smoke-600">
                        {coupon.description}
                      </p>
                    )}
                  </td>
                  <td className="font-semibold text-rose-500">{discountLabel(coupon)}</td>
                  <td>{coupon.minPurchase > 0 ? formatCOP(coupon.minPurchase) : 'SIN MÍNIMO'}</td>
                  <td>
                    {formatNumber(coupon.usedCount)} /{' '}
                    {coupon.maxUses === null ? 'SIN LÍMITE' : formatNumber(coupon.maxUses)}
                  </td>
                  <td>
                    {coupon.expiresAt
                      ? `${formatDateShort(coupon.startsAt)} A ${formatDateShort(coupon.expiresAt)}`
                      : 'SIN VENCIMIENTO'}
                  </td>
                  <td>
                    {expired ? (
                      <Badge tone="red">EXPIRADO</Badge>
                    ) : coupon.active ? (
                      <Badge tone="green">ACTIVO</Badge>
                    ) : (
                      <Badge tone="neutral">INACTIVO</Badge>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(coupon)}>
                        EDITAR
                      </button>
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => void toggleActive(coupon)}
                      >
                        {coupon.active ? 'DESACTIVAR' : 'ACTIVAR'}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost btn-sm text-red-600 hover:border-red-600 hover:text-red-700"
                        onClick={() => setConfirmDelete(coupon)}
                      >
                        ELIMINAR
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrapper>
      )}

      {/* FORMULARIO DE CUPÓN */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'EDITAR CUPÓN' : 'NUEVO CUPÓN'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              CANCELAR
            </button>
            <button type="submit" form="formulario-cupon" className="btn-primary btn-sm" disabled={saving}>
              {saving ? 'GUARDANDO…' : editing ? 'GUARDAR CAMBIOS' : 'CREAR CUPÓN'}
            </button>
          </div>
        }
      >
        <form id="formulario-cupon" onSubmit={submitForm} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="cupon-codigo">
              CÓDIGO
            </label>
            <input
              id="cupon-codigo"
              className="field uppercase"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="BIENVENIDA20"
              required
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              SOLO LETRAS, NÚMEROS, GUIONES Y GUIONES BAJOS.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-descripcion">
              DESCRIPCIÓN
            </label>
            <input
              id="cupon-descripcion"
              className="field"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="DESCUENTO DE BIENVENIDA"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-tipo">
              TIPO DE DESCUENTO
            </label>
            <select
              id="cupon-tipo"
              className="field"
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value as FormState['discountType'] })
              }
            >
              <option value="PORCENTAJE">PORCENTAJE</option>
              <option value="VALOR_FIJO">VALOR FIJO</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-valor">
              VALOR DEL DESCUENTO
            </label>
            <input
              id="cupon-valor"
              type="number"
              min={1}
              className="field"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              required
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              {form.discountType === 'PORCENTAJE'
                ? 'PORCENTAJE ENTRE 1 Y 100.'
                : 'MONTO EN PESOS COLOMBIANOS.'}
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-minimo">
              COMPRA MÍNIMA
            </label>
            <input
              id="cupon-minimo"
              type="number"
              min={0}
              className="field"
              value={form.minPurchase}
              onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              USA 0 PARA NO EXIGIR UN MONTO MÍNIMO.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-tope">
              DESCUENTO MÁXIMO
            </label>
            <input
              id="cupon-tope"
              type="number"
              min={0}
              className="field"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              placeholder="SIN TOPE"
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              DÉJALO VACÍO PARA NO LIMITAR EL DESCUENTO.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-inicio">
              FECHA DE INICIO
            </label>
            <input
              id="cupon-inicio"
              type="date"
              className="field"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-fin">
              FECHA DE VENCIMIENTO
            </label>
            <input
              id="cupon-fin"
              type="date"
              className="field"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
              DÉJALA VACÍA PARA UN CUPÓN SIN VENCIMIENTO.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-usos">
              LÍMITE DE USOS TOTALES
            </label>
            <input
              id="cupon-usos"
              type="number"
              min={0}
              className="field"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              placeholder="SIN LÍMITE"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="cupon-usos-cliente">
              USOS POR CLIENTE
            </label>
            <input
              id="cupon-usos-cliente"
              type="number"
              min={1}
              className="field"
              value={form.maxUsesPerUser}
              onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-3 border border-smoke-300 bg-white px-4 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-rose-500"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="text-[10px] font-semibold tracking-brand text-ink-900">
                CUPÓN ACTIVO Y DISPONIBLE PARA LOS CLIENTES
              </span>
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="ELIMINAR CUPÓN"
        message={`¿SEGURO QUE DESEAS ELIMINAR EL CUPÓN ${confirmDelete?.code ?? ''}? ESTA ACCIÓN NO SE PUEDE DESHACER.`}
        confirmText="SÍ, ELIMINAR"
        danger
        onConfirm={() => {
          if (confirmDelete) void removeCoupon(confirmDelete);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
