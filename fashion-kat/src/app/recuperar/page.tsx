'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Spinner } from '@/components/ui/Skeleton';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await response.json();
      if (json.ok) {
        setSent(true);
        setMessage(json.data.message);
      } else {
        setMessage(json.error);
      }
    } catch {
      setMessage('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="RECUPERAR ACCESO"
      title="¿OLVIDASTE TU CONTRASEÑA?"
      subtitle="INGRESA TU CORREO Y TE ENVIAREMOS UN ENLACE PARA CREAR UNA NUEVA CONTRASEÑA."
      footer={
        <p className="text-center text-[10px] tracking-brand text-smoke-600">
          ¿RECORDASTE TU CONTRASEÑA?{' '}
          <Link href="/login" className="font-semibold text-rose-500 hover:text-rose-600">
            INICIAR SESIÓN
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="border border-smoke-300 bg-smoke-100 p-6">
          <p className="text-[11px] font-semibold tracking-brand text-ink-950">REVISA TU CORREO</p>
          <p className="mt-3 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">{message}</p>
          <p className="mt-4 text-[9px] leading-relaxed tracking-brand text-smoke-500">
            EL ENLACE ES VÁLIDO POR UNA HORA. SI NO LO VES, REVISA LA CARPETA DE CORREO NO DESEADO.
          </p>
        </div>
      ) : (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field normal-case-force"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner /> : 'ENVIAR ENLACE'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
