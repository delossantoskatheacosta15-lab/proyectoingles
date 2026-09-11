'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, TableWrapper, ErrorMessage } from '@/components/admin/AdminUI';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/providers/ToastProvider';
import { formatCOP } from '@/lib/utils';
import { DEPARTMENT_LIST, DEPARTMENTS } from '@/lib/constants';

type Rate = {
  id: string;
  state: string;
  city: string | null;
  cost: number;
  etaDays: string;
  active: boolean;
};

type RateForm = {
  state: string;
  city: string;
  cost: string;
  etaDays: string;
  active: boolean;
};

const EMPTY_FORM: RateForm = {
  state: DEPARTMENT_LIST[0] ?? '',
  city: '',
  cost: '15000',
  etaDays: '2 A 5 DÍAS HÁBILES',
  active: true,
};

export function ShippingView() {
  const { success, error: errorToast } = useToast();

  const [rates, setRates] = useState<Rate[]>([]);
  const [defaultCost, setDefaultCost] = useState('');
  const [freeThreshold, setFreeThreshold] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RateForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/admin/envios', { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) {
        setRates(json.data.rates ?? []);
        setDefaultCost(String(json.data.defaultCost ?? 0));
        setFreeThreshold(String(json.data.freeThreshold ?? 0));
      } else {
        setError(json.error ?? 'NO FUE POSIBLE CARGAR LA CONFIGURACIÓN DE ENVÍOS.');
      }
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveGeneral(event: React.FormEvent) {
    event.preventDefault();
    setSavingSettings(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_default_cost: String(Number(defaultCost) || 0),
          shipping_free_threshold: String(Number(freeThreshold) || 0),
        }),
      });
      const json = await response.json();
      if (json.ok) {
        await load();
        success(json.data.message);
      } else {
        setError(json.error ?? 'NO FUE POSIBLE GUARDAR LA CONFIGURACIÓN.');
        errorToast(json.error ?? 'NO FUE POSIBLE GUARDAR LA CONFIGURACIÓN.');
      }
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setSavingSettings(false);
    }
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(rate: Rate) {
    setEditingId(rate.id);
    setForm({
      state: rate.state,
      city: rate.city ?? '',
      cost: String(rate.cost),
      etaDays: rate.etaDays,
      active: rate.active,
    });
    setModalOpen(true);
  }

  async function saveRate(event: React.FormEvent) {
    event.preventDefault();
    setSavingRate(true);
    setError(null);
    try {
      const response = await fetch(
        editingId ? `/api/admin/envios/${editingId}` : '/api/admin/envios',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: form.state,
            city: form.city,
            cost: Number(form.cost) || 0,
            etaDays: form.etaDays,
            active: form.active,
          }),
        }
      );
      const json = await response.json();
      if (json.ok) {
        setModalOpen(false);
        await load();
        success(json.data.message);
      } else {
        setError(json.error ?? 'NO FUE POSIBLE GUARDAR LA TARIFA.');
        errorToast(json.error ?? 'NO FUE POSIBLE GUARDAR LA TARIFA.');
      }
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setSavingRate(false);
    }
  }

  async function removeRate(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/envios/${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (json.ok) {
        await load();
        success(json.data.message);
      } else {
        setError(json.error ?? 'NO FUE POSIBLE ELIMINAR LA TARIFA.');
        errorToast(json.error ?? 'NO FUE POSIBLE ELIMINAR LA TARIFA.');
      }
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    }
  }

  const cityOptions = DEPARTMENTS[form.state] ?? [];

  if (loading) return <LoadingBlock text="CARGANDO LA CONFIGURACIÓN DE ENVÍOS…" />;

  return (
    <>
      <PageHeader
        title="ENVÍOS"
        description="DEFINE EL COSTO GENERAL DE ENVÍO Y LAS TARIFAS ESPECIALES POR DEPARTAMENTO O CIUDAD."
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={openNew}>
            NUEVA TARIFA
          </button>
        }
      />

      <ErrorMessage message={error} />

      <Panel title="CONFIGURACIÓN GENERAL DE ENVÍOS" className="mb-5">
        <form onSubmit={saveGeneral} className="flex flex-wrap items-end gap-4">
          <div className="w-full sm:w-56">
            <label className="form-label" htmlFor="envio-costo">
              COSTO DE ENVÍO POR DEFECTO
            </label>
            <input
              id="envio-costo"
              type="number"
              min={0}
              step={100}
              className="field py-2.5 text-[11px]"
              value={defaultCost}
              onChange={(e) => setDefaultCost(e.target.value)}
            />
            <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">
              SE APLICA CUANDO NO EXISTE UNA TARIFA PARA EL DESTINO.
            </p>
          </div>

          <div className="w-full sm:w-56">
            <label className="form-label" htmlFor="envio-gratis">
              MONTO PARA ENVÍO GRATIS
            </label>
            <input
              id="envio-gratis"
              type="number"
              min={0}
              step={1000}
              className="field py-2.5 text-[11px]"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
            />
            <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">
              LOS PEDIDOS IGUALES O MAYORES A ESTE VALOR NO PAGAN ENVÍO.
            </p>
          </div>

          <button type="submit" className="btn-dark btn-sm" disabled={savingSettings}>
            {savingSettings ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </Panel>

      <h2 className="mb-3 text-[11px] font-semibold tracking-brand text-ink-950">
        TARIFAS POR DEPARTAMENTO Y CIUDAD
      </h2>

      {rates.length === 0 ? (
        <p className="border border-smoke-300 bg-white px-5 py-12 text-center text-[11px] font-semibold tracking-brand text-smoke-600">
          AÚN NO HAY TARIFAS ESPECIALES. TODOS LOS PEDIDOS USAN EL COSTO POR DEFECTO.
        </p>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th>DEPARTAMENTO</th>
              <th>CIUDAD</th>
              <th className="text-right">COSTO</th>
              <th>TIEMPO DE ENTREGA</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id}>
                <td className="font-semibold text-ink-900">{rate.state}</td>
                <td>{rate.city || 'TODO EL DEPARTAMENTO'}</td>
                <td className="text-right font-semibold">{formatCOP(rate.cost)}</td>
                <td>{rate.etaDays}</td>
                <td>
                  <Badge tone={rate.active ? 'green' : 'neutral'}>
                    {rate.active ? 'ACTIVA' : 'INACTIVA'}
                  </Badge>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(rate)}>
                      EDITAR
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-sm text-red-600 hover:border-red-500 hover:text-red-700"
                      onClick={() => setDeleteId(rate.id)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'EDITAR TARIFA DE ENVÍO' : 'NUEVA TARIFA DE ENVÍO'}
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              CANCELAR
            </button>
            <button
              type="submit"
              form="form-tarifa"
              className="btn-primary btn-sm"
              disabled={savingRate}
            >
              {savingRate ? 'GUARDANDO…' : 'GUARDAR TARIFA'}
            </button>
          </div>
        }
      >
        <form id="form-tarifa" onSubmit={saveRate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="tarifa-departamento">
              DEPARTAMENTO
            </label>
            <select
              id="tarifa-departamento"
              className="field py-2.5 text-[11px]"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value, city: '' })}
            >
              {DEPARTMENT_LIST.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="tarifa-ciudad">
              CIUDAD
            </label>
            <select
              id="tarifa-ciudad"
              className="field py-2.5 text-[11px]"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              <option value="">TODO EL DEPARTAMENTO</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="tarifa-costo">
              COSTO DEL ENVÍO
            </label>
            <input
              id="tarifa-costo"
              type="number"
              min={0}
              step={100}
              required
              className="field py-2.5 text-[11px]"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="tarifa-tiempo">
              TIEMPO DE ENTREGA
            </label>
            <input
              id="tarifa-tiempo"
              type="text"
              maxLength={60}
              className="field py-2.5 text-[11px]"
              value={form.etaDays}
              onChange={(e) => setForm({ ...form, etaDays: e.target.value })}
              placeholder="2 A 5 DÍAS HÁBILES"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2.5 text-[11px] font-semibold tracking-brand text-ink-800">
              <input
                type="checkbox"
                className="h-4 w-4 accent-rose-500"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              TARIFA ACTIVA
            </label>
            <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">
              SI LA DESACTIVAS, LOS PEDIDOS DE ESTE DESTINO USARÁN EL COSTO POR DEFECTO.
            </p>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="ELIMINAR TARIFA"
        message="¿SEGURO QUE DESEAS ELIMINAR ESTA TARIFA DE ENVÍO? LOS PEDIDOS DE ESE DESTINO PASARÁN A USAR EL COSTO POR DEFECTO."
        confirmText="ELIMINAR"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) removeRate(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
