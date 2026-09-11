'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { useStore } from '@/components/providers/StoreProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { DEPARTMENTS, DEPARTMENT_LIST, PAYMENT_METHODS } from '@/lib/constants';
import { formatCOP, cn } from '@/lib/utils';
import type { ResolvedCart } from '@/lib/types';

type AddressOption = {
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
  isDefault: boolean;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
  paymentMethod: 'CONTRA_ENTREGA' | 'PAGO_ONLINE' | 'TRANSFERENCIA';
  acceptTerms: boolean;
};

export function CheckoutView({
  user,
  addresses,
  onlinePaymentReady,
}: {
  user: { firstName: string; lastName: string; email: string; phone: string } | null;
  addresses: AddressOption[];
  onlinePaymentReady: boolean;
}) {
  const router = useRouter();
  const { items, coupon, clearCart, ready } = useStore();
  const { error, success } = useToast();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [form, setForm] = useState<FormState>({
    firstName: defaultAddress?.firstName ?? user?.firstName ?? '',
    lastName: defaultAddress?.lastName ?? user?.lastName ?? '',
    email: user?.email ?? '',
    phone: defaultAddress?.phone ?? user?.phone ?? '',
    street: defaultAddress?.street ?? '',
    neighborhood: defaultAddress?.neighborhood ?? '',
    city: defaultAddress?.city ?? '',
    state: defaultAddress?.state ?? '',
    postalCode: defaultAddress?.postalCode ?? '',
    notes: '',
    paymentMethod: 'CONTRA_ENTREGA',
    acceptTerms: false,
  });

  const [cart, setCart] = useState<ResolvedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cities = useMemo(() => DEPARTMENTS[form.state] ?? [], [form.state]);

  const resolve = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carrito/resolver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          cupon: coupon,
          departamento: form.state || null,
          ciudad: form.city || null,
        }),
      });
      const json = await response.json();
      if (json.ok) {
        setCart({ lines: json.data.lines, savedLines: json.data.savedLines, totals: json.data.totals });
      }
    } finally {
      setLoading(false);
    }
  }, [items, coupon, form.state, form.city]);

  useEffect(() => {
    if (!ready) return;
    void resolve();
  }, [ready, resolve]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const useAddress = (address: AddressOption) => {
    set({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode ?? '',
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    if (!form.acceptTerms) {
      error('DEBES ACEPTAR LOS TÉRMINOS Y CONDICIONES.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          couponCode: coupon ?? '',
          items: items.filter((i) => !i.savedForLater),
        }),
      });
      const json = await response.json();

      if (!json.ok) {
        if (Array.isArray(json.issues)) {
          const map: Record<string, string> = {};
          json.issues.forEach((i: { campo: string; mensaje: string }) => {
            map[i.campo] = i.mensaje;
          });
          setFieldErrors(map);
        }
        error(json.error);
        return;
      }

      const { orderNumber, payment } = json.data;
      clearCart();
      success('¡GRACIAS POR TU COMPRA! 💗');

      if (form.paymentMethod === 'PAGO_ONLINE' && payment?.ready && payment?.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
        return;
      }

      router.push(`/pedido-confirmado?numero=${orderNumber}`);
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="container-fk py-16">
        <LoadingBlock text="PREPARANDO TU PEDIDO…" />
      </div>
    );
  }

  const lines = cart?.lines ?? [];
  const totals = cart?.totals;

  if (lines.length === 0) {
    return (
      <div className="container-fk py-16">
        <EmptyState
          title="NO HAY PRODUCTOS PARA PAGAR"
          description="AGREGA PRODUCTOS A TU CARRITO ANTES DE CONTINUAR CON EL CHECKOUT."
          actionText="VER PRODUCTOS"
          actionHref="/productos"
        />
      </div>
    );
  }

  return (
    <div className="container-fk py-12">
      <h1 className="heading-lg text-ink-950">CHECKOUT</h1>
      <p className="mt-2 text-[10px] tracking-brand text-smoke-600">
        COMPLETA TUS DATOS PARA FINALIZAR LA COMPRA
      </p>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* DATOS */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          {addresses.length > 0 && (
            <section>
              <h2 className="mb-4 text-[12px] font-semibold tracking-brand text-ink-950">
                MIS DIRECCIONES GUARDADAS
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => useAddress(address)}
                    className={cn(
                      'border p-4 text-left transition-colors',
                      form.street === address.street
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-smoke-300 bg-white hover:border-ink-950'
                    )}
                  >
                    <p className="text-[10px] font-semibold tracking-brand text-ink-950">
                      {address.label} {address.isDefault && '· PREDETERMINADA'}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                      {address.street}, {address.neighborhood}
                      <br />
                      {address.city}, {address.state}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-5 text-[12px] font-semibold tracking-brand text-ink-950">
              1. DATOS DE CONTACTO
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="NOMBRE" error={fieldErrors.firstName}>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => set({ firstName: e.target.value })}
                  className="field"
                  autoComplete="given-name"
                />
              </Field>
              <Field label="APELLIDO" error={fieldErrors.lastName}>
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => set({ lastName: e.target.value })}
                  className="field"
                  autoComplete="family-name"
                />
              </Field>
              <Field label="CORREO ELECTRÓNICO" error={fieldErrors.email}>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  className="field normal-case-force"
                  autoComplete="email"
                />
              </Field>
              <Field label="TELÉFONO" error={fieldErrors.phone}>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  className="field"
                  autoComplete="tel"
                  placeholder="300 000 0000"
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-[12px] font-semibold tracking-brand text-ink-950">
              2. DIRECCIÓN DE ENVÍO
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="DIRECCIÓN" error={fieldErrors.street}>
                  <input
                    required
                    value={form.street}
                    onChange={(e) => set({ street: e.target.value })}
                    className="field"
                    placeholder="CALLE 10 # 40-20, APTO 302"
                    autoComplete="street-address"
                  />
                </Field>
              </div>
              <Field label="BARRIO" error={fieldErrors.neighborhood}>
                <input
                  required
                  value={form.neighborhood}
                  onChange={(e) => set({ neighborhood: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="DEPARTAMENTO" error={fieldErrors.state}>
                <select
                  required
                  value={form.state}
                  onChange={(e) => set({ state: e.target.value, city: '' })}
                  className="field"
                >
                  <option value="">SELECCIONA…</option>
                  {DEPARTMENT_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="CIUDAD" error={fieldErrors.city}>
                {cities.length > 0 ? (
                  <select
                    required
                    value={form.city}
                    onChange={(e) => set({ city: e.target.value })}
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
                    onChange={(e) => set({ city: e.target.value })}
                    className="field"
                    placeholder="SELECCIONA PRIMERO EL DEPARTAMENTO"
                  />
                )}
              </Field>
              <Field label="CÓDIGO POSTAL (OPCIONAL)">
                <input
                  value={form.postalCode}
                  onChange={(e) => set({ postalCode: e.target.value })}
                  className="field"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="NOTAS PARA LA ENTREGA (OPCIONAL)">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    className="field resize-none"
                    placeholder="PUNTO DE REFERENCIA, HORARIO PREFERIDO…"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-[12px] font-semibold tracking-brand text-ink-950">
              3. MÉTODO DE PAGO
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => {
                const disabled = method.value === 'PAGO_ONLINE' && !onlinePaymentReady;
                return (
                  <label
                    key={method.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 border p-4 transition-colors',
                      form.paymentMethod === method.value
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-smoke-300 bg-white hover:border-ink-950',
                      disabled && 'cursor-not-allowed opacity-55'
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      disabled={disabled}
                      checked={form.paymentMethod === method.value}
                      onChange={() => set({ paymentMethod: method.value })}
                      className="mt-0.5 h-4 w-4 accent-rose-500"
                    />
                    <span>
                      <span className="block text-[11px] font-semibold tracking-brand text-ink-950">
                        {method.label}
                      </span>
                      <span className="mt-1 block text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                        {disabled
                          ? 'NO DISPONIBLE: FALTA CONFIGURAR LA PASARELA DE PAGO EN EL ARCHIVO .env'
                          : method.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* RESUMEN */}
        <aside>
          <div className="sticky top-[190px] border border-smoke-300 bg-white p-6">
            <h2 className="text-[12px] font-semibold tracking-brand text-ink-950">RESUMEN DEL PEDIDO</h2>

            <ul className="mt-5 flex max-h-72 flex-col gap-4 overflow-y-auto pr-1">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-smoke-200">
                    <SafeImage src={line.image} alt={line.name} label={line.name} sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium tracking-wider2 text-ink-900">
                      {line.name}
                    </p>
                    <p className="mt-0.5 text-[9px] tracking-brand text-smoke-500">
                      {line.size && `TALLA ${line.size} · `}
                      {line.color} · X{line.quantity}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-500">
                    {formatCOP(line.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 flex flex-col gap-3 border-t border-smoke-200 pt-5 text-[11px] tracking-wider2">
              <div className="flex justify-between">
                <dt className="text-smoke-600">SUBTOTAL</dt>
                <dd className="font-medium text-ink-900">{formatCOP(totals?.subtotal ?? 0)}</dd>
              </div>
              {(totals?.discount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-smoke-600">DESCUENTO {totals?.couponCode}</dt>
                  <dd className="font-semibold text-rose-500">- {formatCOP(totals?.discount ?? 0)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-smoke-600">ENVÍO</dt>
                <dd className="font-medium text-ink-900">
                  {(totals?.shipping ?? 0) === 0 ? 'GRATIS' : formatCOP(totals?.shipping ?? 0)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-ink-950 pt-5">
              <span className="text-[11px] font-semibold tracking-brand text-ink-950">TOTAL</span>
              <span className="text-xl font-semibold tracking-wider2 text-rose-500">
                {formatCOP(totals?.total ?? 0)}
              </span>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(e) => set({ acceptTerms: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-rose-500"
              />
              <span className="text-[9px] leading-relaxed tracking-brand text-smoke-700">
                ACEPTO LOS{' '}
                <Link href="/terminos-y-condiciones" className="text-rose-500 underline">
                  TÉRMINOS Y CONDICIONES
                </Link>{' '}
                Y LA{' '}
                <Link href="/politica-de-privacidad" className="text-rose-500 underline">
                  POLÍTICA DE PRIVACIDAD
                </Link>
                .
              </span>
            </label>

            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
              {submitting ? 'PROCESANDO…' : 'REALIZAR PEDIDO'}
            </button>

            <p className="mt-4 text-center text-[9px] leading-relaxed tracking-brand text-smoke-500">
              NO GUARDAMOS DATOS DE TU TARJETA. EL PAGO SE PROCESA EN LA PASARELA SEGURA.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="form-hint">{error}</p>}
    </div>
  );
}
