'use client';

import { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Spinner } from '@/components/ui/Skeleton';

export function PasswordForm() {
  const { success, error } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.newPassword !== form.confirm) {
      error('LAS CONTRASEÑAS NUEVAS NO COINCIDEN.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/cuenta/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        setForm({ currentPassword: '', newPassword: '', confirm: '' });
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
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="currentPassword" className="form-label">
          CONTRASEÑA ACTUAL
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          className="field"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="form-label">
          NUEVA CONTRASEÑA
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          className="field"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="form-label">
          CONFIRMAR
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="field"
        />
      </div>
      <div className="sm:col-span-3">
        <button type="submit" disabled={loading} className="btn-dark px-8">
          {loading ? <Spinner /> : 'ACTUALIZAR CONTRASEÑA'}
        </button>
      </div>
    </form>
  );
}
