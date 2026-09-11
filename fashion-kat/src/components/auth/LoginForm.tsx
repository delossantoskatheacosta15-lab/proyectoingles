'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Spinner } from '@/components/ui/Skeleton';

const ADMIN_ROLES = ['ADMIN', 'EDITOR', 'OPERADOR'];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setMessage(result.error ?? 'NO FUE POSIBLE INICIAR SESIÓN.');
      error(result.error ?? 'NO FUE POSIBLE INICIAR SESIÓN.');
      return;
    }

    success(`¡HOLA DE NUEVO, ${result.user?.firstName ?? ''}!`);
    const redirect = searchParams.get('redirigir');
    const destination =
      redirect ?? (result.user && ADMIN_ROLES.includes(result.user.role) ? '/admin' : '/mi-cuenta');
    router.push(destination);
    router.refresh();
  };

  return (
    <AuthLayout
      eyebrow="BIENVENIDA DE NUEVO"
      title="INICIAR SESIÓN"
      subtitle="INGRESA TUS DATOS PARA ACCEDER A TU CUENTA DE FASHION KAT."
      footer={
        <div className="flex flex-col gap-3 text-center">
          <p className="text-[10px] tracking-brand text-smoke-600">
            ¿AÚN NO TIENES CUENTA?{' '}
            <Link href="/registro" className="font-semibold text-rose-500 hover:text-rose-600">
              CREAR CUENTA
            </Link>
          </p>
          <Link href="/seguimiento" className="text-[10px] tracking-brand text-smoke-500 hover:text-ink-900">
            CONSULTAR UN PEDIDO SIN INICIAR SESIÓN
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        {message && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-semibold tracking-brand text-red-700">
            {message}
          </p>
        )}

        <div>
          <label htmlFor="email" className="form-label">
            CORREO ELECTRÓNICO
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field normal-case-force"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="form-label mb-0">
              CONTRASEÑA
            </label>
            <Link
              href="/recuperar"
              className="text-[9px] font-semibold tracking-brand text-rose-500 hover:text-rose-600"
            >
              ¿OLVIDASTE TU CONTRASEÑA?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : 'INICIAR SESIÓN'}
        </button>
      </form>

      {/* CUENTAS DE DEMOSTRACIÓN — ELIMINA ESTE BLOQUE ANTES DE PUBLICAR LA TIENDA */}
      <div className="mt-7 border border-dashed border-smoke-300 bg-smoke-100 p-4">
        <p className="label-xs mb-2">CUENTAS DE DEMOSTRACIÓN</p>
        <ul className="flex flex-col gap-1 text-[9px] tracking-brand text-smoke-600">
          <li className="normal-case-force">ADMIN: admin@fashionkat.co / Admin123*</li>
          <li className="normal-case-force">EDITOR: editor@fashionkat.co / Admin123*</li>
          <li className="normal-case-force">OPERADOR: operador@fashionkat.co / Admin123*</li>
          <li className="normal-case-force">CLIENTA: cliente@fashionkat.co / Cliente123*</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
