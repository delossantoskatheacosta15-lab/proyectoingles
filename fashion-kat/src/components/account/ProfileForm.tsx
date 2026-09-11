'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { Spinner } from '@/components/ui/Skeleton';

export function ProfileForm({
  user,
}: {
  user: { firstName: string; lastName: string; phone: string; email: string };
}) {
  const router = useRouter();
  const { refresh } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/cuenta/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        await refresh();
        router.refresh();
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="firstName" className="form-label">
          NOMBRE
        </label>
        <input
          id="firstName"
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="field"
        />
      </div>
      <div>
        <label htmlFor="phone" className="form-label">
          TELÉFONO
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="field"
          placeholder="300 000 0000"
        />
      </div>
      <div>
        <label htmlFor="emailReadonly" className="form-label">
          CORREO ELECTRÓNICO
        </label>
        <input
          id="emailReadonly"
          value={user.email}
          readOnly
          disabled
          className="field normal-case-force bg-smoke-100 text-smoke-600"
        />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={loading} className="btn-dark px-8">
          {loading ? <Spinner /> : 'GUARDAR CAMBIOS'}
        </button>
      </div>
    </form>
  );
}
