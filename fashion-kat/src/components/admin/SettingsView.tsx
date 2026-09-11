'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Panel, Badge, ErrorMessage } from '@/components/admin/AdminUI';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { DEFAULT_SETTINGS } from '@/lib/constants';

type Settings = Record<string, string>;

type PaymentStatus = {
  provider: string;
  configured: boolean;
  missingEnv: string[];
  available: string[];
};

const SI_NO = [
  { value: 'true', label: 'SÍ' },
  { value: 'false', label: 'NO' },
];

const EXPORTS = [
  { tipo: 'pedidos', label: 'EXPORTAR PEDIDOS' },
  { tipo: 'clientes', label: 'EXPORTAR CLIENTES' },
  { tipo: 'productos', label: 'EXPORTAR PRODUCTOS' },
  { tipo: 'inventario', label: 'EXPORTAR INVENTARIO' },
  { tipo: 'ventas', label: 'EXPORTAR VENTAS' },
];

function Field({
  id,
  label,
  value,
  onChange,
  hint,
  type = 'text',
  normalCase = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type?: string;
  normalCase?: boolean;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`field py-2.5 text-[11px] ${normalCase ? 'normal-case-force' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1.5 text-[9px] leading-relaxed tracking-brand text-smoke-500">{hint}</p>}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="field py-2.5 text-[11px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1.5 text-[9px] leading-relaxed tracking-brand text-smoke-500">{hint}</p>}
    </div>
  );
}

export function SettingsView() {
  const { success, error: errorToast } = useToast();

  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [settingsResponse, paymentResponse] = await Promise.all([
        fetch('/api/admin/configuracion', { cache: 'no-store' }),
        fetch('/api/pagos/estado', { cache: 'no-store' }),
      ]);
      const settingsJson = await settingsResponse.json();
      const paymentJson = await paymentResponse.json();

      if (settingsJson.ok) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsJson.data.settings });
      } else {
        setError(settingsJson.error ?? 'NO FUE POSIBLE CARGAR LA CONFIGURACIÓN.');
      }
      if (paymentJson.ok) setPayment(paymentJson.data);
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(key: string, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, string> = {};
      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        payload[key] = String(settings[key] ?? '');
      });

      const response = await fetch('/api/admin/configuracion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock text="CARGANDO LA CONFIGURACIÓN DE LA TIENDA…" />;

  return (
    <>
      <PageHeader
        title="CONFIGURACIÓN"
        description="DATOS DE CONTACTO, REDES SOCIALES, ENVÍOS Y MENSAJES QUE VE EL CLIENTE EN LA TIENDA."
        actions={
          <button type="submit" form="form-configuracion" className="btn-primary btn-sm" disabled={saving}>
            {saving ? 'GUARDANDO…' : 'GUARDAR CONFIGURACIÓN'}
          </button>
        }
      />

      <ErrorMessage message={error} />

      <form id="form-configuracion" onSubmit={save} className="flex flex-col gap-5">
        <Panel title="DATOS DE LA TIENDA">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="store_name"
              label="NOMBRE DE LA TIENDA"
              value={settings.store_name ?? ''}
              onChange={(v) => set('store_name', v)}
            />
            <Field
              id="store_slogan"
              label="ESLOGAN"
              value={settings.store_slogan ?? ''}
              onChange={(v) => set('store_slogan', v)}
            />
            <Field
              id="store_logo"
              label="URL DEL LOGO"
              value={settings.store_logo ?? ''}
              onChange={(v) => set('store_logo', v)}
              normalCase
              hint="DIRECCIÓN DE LA IMAGEN DEL LOGO. DÉJALA VACÍA PARA USAR EL LOGO EN TEXTO."
            />
            <Field
              id="store_email"
              label="CORREO DE CONTACTO"
              type="email"
              value={settings.store_email ?? ''}
              onChange={(v) => set('store_email', v)}
              normalCase
            />
            <Field
              id="store_phone"
              label="TELÉFONO"
              value={settings.store_phone ?? ''}
              onChange={(v) => set('store_phone', v)}
              normalCase
            />
            <Field
              id="store_whatsapp"
              label="NÚMERO DE WHATSAPP"
              value={settings.store_whatsapp ?? ''}
              onChange={(v) => set('store_whatsapp', v)}
              normalCase
              hint="ESCRÍBELO EN FORMATO INTERNACIONAL, SIN EL SIGNO “+” Y SIN ESPACIOS NI GUIONES. EJEMPLO: 573001112233"
            />
            <Field
              id="store_address"
              label="DIRECCIÓN"
              value={settings.store_address ?? ''}
              onChange={(v) => set('store_address', v)}
            />
            <Field
              id="store_schedule"
              label="HORARIO DE ATENCIÓN"
              value={settings.store_schedule ?? ''}
              onChange={(v) => set('store_schedule', v)}
            />
          </div>
        </Panel>

        <Panel title="REDES SOCIALES">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="social_instagram"
              label="INSTAGRAM"
              value={settings.social_instagram ?? ''}
              onChange={(v) => set('social_instagram', v)}
              normalCase
            />
            <Field
              id="social_facebook"
              label="FACEBOOK"
              value={settings.social_facebook ?? ''}
              onChange={(v) => set('social_facebook', v)}
              normalCase
            />
            <Field
              id="social_tiktok"
              label="TIKTOK"
              value={settings.social_tiktok ?? ''}
              onChange={(v) => set('social_tiktok', v)}
              normalCase
            />
          </div>
          <p className="mt-3 text-[9px] leading-relaxed tracking-brand text-smoke-500">
            PEGA LA DIRECCIÓN COMPLETA DEL PERFIL. SI DEJAS UN CAMPO VACÍO, ESE ÍCONO NO SE MOSTRARÁ EN LA
            TIENDA.
          </p>
        </Panel>

        <Panel title="ENVÍOS">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="shipping_default_cost"
              label="COSTO DE ENVÍO POR DEFECTO"
              type="number"
              value={settings.shipping_default_cost ?? ''}
              onChange={(v) => set('shipping_default_cost', v)}
              hint="SE COBRA CUANDO EL DESTINO NO TIENE UNA TARIFA ESPECIAL."
            />
            <Field
              id="shipping_free_threshold"
              label="MONTO PARA ENVÍO GRATIS"
              type="number"
              value={settings.shipping_free_threshold ?? ''}
              onChange={(v) => set('shipping_free_threshold', v)}
              hint="LOS PEDIDOS IGUALES O MAYORES A ESTE VALOR NO PAGAN ENVÍO."
            />
          </div>
        </Panel>

        <Panel title="POPUP DE OFERTA">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="popup_enabled"
              label="MOSTRAR EL POPUP"
              value={settings.popup_enabled ?? 'true'}
              onChange={(v) => set('popup_enabled', v)}
              options={SI_NO}
              hint="APARECE UNA SOLA VEZ POR VISITANTE."
            />
            <Field
              id="popup_coupon"
              label="CUPÓN QUE SE ENTREGA"
              value={settings.popup_coupon ?? ''}
              onChange={(v) => set('popup_coupon', v)}
              hint="DEBE COINCIDIR CON UN CUPÓN ACTIVO EN LA SECCIÓN DE CUPONES."
            />
            <Field
              id="popup_title"
              label="TÍTULO DEL POPUP"
              value={settings.popup_title ?? ''}
              onChange={(v) => set('popup_title', v)}
            />
            <Field
              id="popup_text"
              label="TEXTO DEL POPUP"
              value={settings.popup_text ?? ''}
              onChange={(v) => set('popup_text', v)}
            />
          </div>
        </Panel>

        <Panel title="ALERTAS">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id="low_stock_alert"
              label="AVISAR CUANDO EL STOCK ESTÉ BAJO"
              value={settings.low_stock_alert ?? 'true'}
              onChange={(v) => set('low_stock_alert', v)}
              options={SI_NO}
              hint="MUESTRA UNA ALERTA EN EL DASHBOARD CUANDO UN PRODUCTO LLEGA A SU STOCK MÍNIMO."
            />
          </div>
        </Panel>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary btn-sm" disabled={saving}>
            {saving ? 'GUARDANDO…' : 'GUARDAR CONFIGURACIÓN'}
          </button>
        </div>
      </form>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="PASARELA DE PAGO"
          action={
            payment?.configured ? (
              <Badge tone="green">CONFIGURADA</Badge>
            ) : (
              <Badge tone="amber">SIN CONFIGURAR</Badge>
            )
          }
        >
          {!payment ? (
            <p className="text-[10px] tracking-brand text-smoke-600">
              NO FUE POSIBLE CONSULTAR EL ESTADO DE LA PASARELA.
            </p>
          ) : (
            <>
              <dl className="mb-4 flex flex-col gap-2 text-[10px] tracking-brand">
                <div className="flex justify-between gap-3">
                  <dt className="text-smoke-600">PROVEEDOR ACTIVO</dt>
                  <dd className="font-semibold text-ink-900">
                    {payment.provider === 'none' ? 'NINGUNO' : payment.provider.toUpperCase()}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-smoke-600">PROVEEDORES DISPONIBLES</dt>
                  <dd className="font-semibold text-ink-900">
                    {payment.available.map((a) => a.toUpperCase()).join(' · ')}
                  </dd>
                </div>
              </dl>

              {payment.configured ? (
                <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] leading-relaxed tracking-brand text-emerald-700">
                  LA PASARELA ESTÁ LISTA. LOS CLIENTES YA PUEDEN PAGAR EN LÍNEA CON TARJETA O PSE.
                </p>
              ) : (
                <div className="border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[10px] font-semibold leading-relaxed tracking-brand text-amber-800">
                    FALTAN ESTAS VARIABLES DE ENTORNO EN EL ARCHIVO .env:
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {payment.missingEnv.map((env) => (
                      <li
                        key={env}
                        className="normal-case-force font-mono text-[11px] text-amber-900"
                      >
                        {env}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[9px] leading-relaxed tracking-brand text-amber-800">
                    AGREGA ESAS CLAVES AL ARCHIVO .env Y REINICIA EL SERVIDOR. MIENTRAS TANTO, LOS PEDIDOS
                    PUEDEN COMPLETARSE CON PAGO CONTRA ENTREGA O TRANSFERENCIA BANCARIA. ESTAS CLAVES SON
                    SECRETAS Y NUNCA SE MUESTRAN AL CLIENTE.
                  </p>
                </div>
              )}
            </>
          )}
        </Panel>

        <Panel title="EXPORTACIONES">
          <p className="mb-4 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
            DESCARGA TU INFORMACIÓN EN ARCHIVOS CSV LISTOS PARA ABRIR EN EXCEL O EN GOOGLE SHEETS.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {EXPORTS.map((item) => (
              <button
                key={item.tipo}
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => window.open(`/api/admin/exportar?tipo=${item.tipo}`, '_blank')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
