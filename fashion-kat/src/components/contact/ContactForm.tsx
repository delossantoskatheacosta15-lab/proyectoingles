'use client';

import { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { Spinner } from '@/components/ui/Skeleton';

const SUBJECTS = [
  'CONSULTA SOBRE UN PRODUCTO',
  'ESTADO DE MI PEDIDO',
  'CAMBIO O DEVOLUCIÓN',
  'PROBLEMA CON EL PAGO',
  'VENTA AL POR MAYOR',
  'OTRO',
];

export function ContactForm() {
  const { success, error } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [issues, setIssues] = useState<Record<string, string>>({});

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIssues({});
    setLoading(true);
    try {
      const response = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await response.json();
      if (json.ok) {
        setSent(true);
        success(json.data.message);
        setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
      } else {
        if (Array.isArray(json.issues)) {
          const map: Record<string, string> = {};
          json.issues.forEach((i: { campo: string; mensaje: string }) => {
            map[i.campo] = i.mensaje;
          });
          setIssues(map);
        }
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="border border-smoke-300 bg-smoke-100 p-8 text-center">
        <p className="text-[13px] font-semibold tracking-brand text-ink-950">¡MENSAJE ENVIADO!</p>
        <p className="mt-3 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
          GRACIAS POR ESCRIBIRNOS. NUESTRO EQUIPO TE RESPONDERÁ EN UN PLAZO MÁXIMO DE 24 HORAS HÁBILES.
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-6">
          ENVIAR OTRO MENSAJE
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="form-label">
            NOMBRE COMPLETO
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            className="field"
          />
          {issues.name && <p className="form-hint">{issues.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="form-label">
            CORREO ELECTRÓNICO
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            className="field normal-case-force"
          />
          {issues.email && <p className="form-hint">{issues.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="form-label">
            TELÉFONO (OPCIONAL)
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            className="field"
            placeholder="300 000 0000"
          />
          {issues.phone && <p className="form-hint">{issues.phone}</p>}
        </div>
        <div>
          <label htmlFor="subject" className="form-label">
            ASUNTO
          </label>
          <select
            id="subject"
            value={form.subject}
            onChange={(e) => set({ subject: e.target.value })}
            className="field"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {issues.subject && <p className="form-hint">{issues.subject}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="form-label">
          MENSAJE
        </label>
        <textarea
          id="message"
          required
          minLength={10}
          rows={6}
          value={form.message}
          onChange={(e) => set({ message: e.target.value })}
          className="field resize-none"
          placeholder="CUÉNTANOS CÓMO PODEMOS AYUDARTE…"
        />
        {issues.message && <p className="form-hint">{issues.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary self-start px-10">
        {loading ? <Spinner /> : 'ENVIAR MENSAJE'}
      </button>
    </form>
  );
}
