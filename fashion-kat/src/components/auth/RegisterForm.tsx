'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Spinner } from '@/components/ui/Skeleton';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (form.password !== form.confirm) {
      setMessage('LAS CONTRASEÑAS NO COINCIDEN.');
      return;
    }
    if (!accept) {
      setMessage('DEBES ACEPTAR LOS TÉRMINOS Y CONDICIONES.');
      return;
    }

    setLoading(true);
    const result = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setLoading(false);

    if (!result.ok) {
      setMessage(result.error ?? 'NO FUE POSIBLE CREAR TU CUENTA.');
      error(result.error ?? 'NO FUE POSIBLE CREAR TU CUENTA.');
      return;
    }

    success('¡CUENTA CREADA! BIENVENIDA A FASHION KAT.');
    router.push('/mi-cuenta');
    router.refresh();
  };

  return (
    <AuthLayout
      eyebrow="ÚNETE A FASHION KAT"
      title="CREAR CUENTA"
      subtitle="REGÍSTRATE PARA GUARDAR TUS FAVORITOS, SEGUIR TUS PEDIDOS Y RECIBIR OFERTAS EXCLUSIVAS."
      footer={
        <p className="text-center text-[10px] tracking-brand text-smoke-600">
          ¿YA TIENES CUENTA?{' '}
          <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600">
            INICIAR SESIÓN
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        {message && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-semibold tracking-brand text-red-700">
            {message}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="form-label">
              NOMBRE
            </label>
            <input
              id="firstName"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="form-label">
              APELLIDO
            </label>
            <input
              id="lastName"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
              className="field"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            CORREO ELECTRÓNICO
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            className="field normal-case-force"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="form-label">
            TELÉFONO (OPCIONAL)
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            className="field"
            placeholder="300 000 0000"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="form-label">
              CONTRASEÑA
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set({ password: e.target.value })}
              className="field"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="form-label">
              CONFIRMAR CONTRASEÑA
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => set({ confirm: e.target.value })}
              className="field"
              placeholder="••••••••"
            />
          </div>
        </div>

        <p className="text-[9px] leading-relaxed tracking-brand text-smoke-500">
          LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES, UNA LETRA Y UN NÚMERO.
        </p>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : 'CREAR MI CUENTA'}
        </button>
      </form>
    </AuthLayout>
  );
}
