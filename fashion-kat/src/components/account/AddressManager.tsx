'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/providers/ToastProvider';
import { IconPlus, IconEdit, IconTrash, IconPin } from '@/components/ui/Icons';
import { DEPARTMENTS, DEPARTMENT_LIST } from '@/lib/constants';
import { Spinner } from '@/components/ui/Skeleton';

export type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string | null;
  notes: string | null;
  isDefault: boolean;
};

const EMPTY = {
  label: 'CASA',
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  notes: '',
  isDefault: false,
};

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const { success, error } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const cities = DEPARTMENTS[form.state] ?? [];

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, isDefault: initialAddresses.length === 0 });
    setOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setForm({
      label: address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode ?? '',
      notes: address.notes ?? '',
      isDefault: address.isDefault,
    });
    setOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/cuenta/direcciones/${editing.id}` : '/api/cuenta/direcciones';
      const response = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        setOpen(false);
        router.refresh();
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`/api/cuenta/direcciones/${id}`, { method: 'DELETE' });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        router.refresh();
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button type="button" onClick={openNew} className="btn-primary">
          <IconPlus className="h-4 w-4" />
          AGREGAR DIRECCIÓN
        </button>
      </div>

      {initialAddresses.length === 0 ? (
        <EmptyState
          title="AÚN NO TIENES DIRECCIONES GUARDADAS"
          description="AGREGA UNA DIRECCIÓN PARA QUE TUS PRÓXIMAS COMPRAS SEAN MÁS RÁPIDAS."
          icon={<IconPin className="h-6 w-6" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {initialAddresses.map((address) => (
            <article key={address.id} className="border border-smoke-300 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-brand text-ink-950">{address.label}</p>
                  {address.isDefault && (
                    <span className="badge-rose mt-2 inline-block">PREDETERMINADA</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(address)}
                    aria-label="EDITAR DIRECCIÓN"
                    className="text-smoke-500 transition-colors hover:text-rose-500"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(address.id)}
                    aria-label="ELIMINAR DIRECCIÓN"
                    className="text-smoke-500 transition-colors hover:text-red-600"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-[10px] leading-relaxed tracking-wider2 text-smoke-700">
                {address.firstName} {address.lastName}
                <br />
                {address.street}
                <br />
                {address.neighborhood}, {address.city}
                <br />
                {address.state}
                {address.postalCode ? ` · ${address.postalCode}` : ''}
                <br />
                TEL: {address.phone}
              </p>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'EDITAR DIRECCIÓN' : 'NUEVA DIRECCIÓN'}
        size="md"
      >
        <form id="address-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="form-label">ETIQUETA</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="field"
              placeholder="CASA, OFICINA…"
            />
          </div>
          <div>
            <label className="form-label">NOMBRE</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="form-label">APELLIDO</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="form-label">TELÉFONO</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="form-label">CÓDIGO POSTAL (OPCIONAL)</label>
            <input
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">DIRECCIÓN</label>
            <input
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="field"
              placeholder="CALLE 10 # 40-20, APTO 302"
            />
          </div>
          <div>
            <label className="form-label">BARRIO</label>
            <input
              required
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label className="form-label">DEPARTAMENTO</label>
            <select
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value, city: '' })}
              className="field"
            >
              <option value="">SELECCIONA…</option>
              {DEPARTMENT_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">CIUDAD</label>
            {cities.length > 0 ? (
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="field"
              >
                <option value="">SELECCIONA…</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="OTRA">OTRA CIUDAD</option>
              </select>
            ) : (
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="field"
                placeholder="SELECCIONA PRIMERO EL DEPARTAMENTO"
              />
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">NOTAS (OPCIONAL)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="field resize-none"
              placeholder="PUNTO DE REFERENCIA, PORTERÍA…"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 accent-rose-500"
            />
            <span className="text-[10px] tracking-brand text-ink-800">
              USAR COMO DIRECCIÓN PREDETERMINADA
            </span>
          </label>

          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              CANCELAR
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner /> : 'GUARDAR DIRECCIÓN'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="ELIMINAR DIRECCIÓN"
        message="¿SEGURO QUE QUIERES ELIMINAR ESTA DIRECCIÓN? ESTA ACCIÓN NO SE PUEDE DESHACER."
        confirmText="ELIMINAR"
        danger
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
