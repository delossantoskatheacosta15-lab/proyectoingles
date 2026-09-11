'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Spinner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';

export function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success } = useToast();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage('LAS CONTRASEÑAS NO COINCIDEN.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        router.push('/login');
      } else {
        setMessage(json.error);
      }
    } catch {
      setMessage('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        eyebrow="ENLACE NO VÁLIDO"
        title="RESTABLECER CONTRASEÑA"
        subtitle="EL ENLACE QUE USASTE NO ES VÁLIDO O YA EXPIRÓ."
      >
        <Link href="/recuperar" className="btn-primary w-full">
          SOLICITAR UN NUEVO ENLACE
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="CASI LISTO"
      title="CREA TU NUEVA CONTRASEÑA"
      subtitle="ESCRIBE UNA CONTRASEÑA SEGURA DE AL MENOS 8 CARACTERES CON LETRAS Y NÚMEROS."
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        {message && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-semibold tracking-brand text-red-700">
            {message}
          </p>
        )}
        <div>
          <label htmlFor="password" className="form-label">
            NUEVA CONTRASEÑA
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : 'GUARDAR CONTRASEÑA'}
        </button>
      </form>
    </AuthLayout>
  );
}
