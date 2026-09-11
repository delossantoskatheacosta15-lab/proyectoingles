'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { IconClose } from '@/components/ui/Icons';

const STORAGE_KEY = 'fk_popup_cerrado';

export function PromoPopup({
  enabled,
  title,
  text,
  coupon,
}: {
  enabled: boolean;
  title: string;
  text: string;
  coupon: string;
}) {
  const { success, error } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      dismissed = false;
    }
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(timer);
  }, [enabled]);

  // NO VOLVER A MOSTRARLO A QUIEN YA LO CERRÓ
  const close = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // SIN ALMACENAMIENTO DISPONIBLE
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'POPUP' }),
      });
      const json = await response.json();
      if (json.ok) {
        setDone(true);
        success(json.data.message);
        try {
          window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {
          // SIN ALMACENAMIENTO DISPONIBLE
        }
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink-950/75 animate-fade-in" onClick={close} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 grid w-full max-w-3xl overflow-hidden bg-white shadow-lift animate-scale-in sm:grid-cols-2"
      >
        <div className="relative hidden bg-gradient-to-br from-ink-950 via-ink-800 to-rose-600 p-10 sm:flex sm:flex-col sm:justify-end">
          <p className="text-[10px] font-semibold tracking-brand text-rose-300">FASHION KAT</p>
          <p className="mt-3 text-2xl font-light leading-tight tracking-wider2 text-white">
            TU ESTILO,<br />TU ACTITUD,<br />TU MOMENTO.
          </p>
        </div>

        <div className="relative p-8 sm:p-10">
          <button
            type="button"
            onClick={close}
            aria-label="CERRAR"
            className="absolute right-4 top-4 text-smoke-500 transition-colors hover:text-rose-500"
          >
            <IconClose className="h-5 w-5" />
          </button>

          {done ? (
            <div className="flex h-full flex-col justify-center text-center">
              <p className="eyebrow">¡LISTO!</p>
              <h2 className="heading-md mt-3 text-ink-950">TU CUPÓN ES</h2>
              <p className="my-5 border border-dashed border-rose-500 py-4 text-xl font-semibold tracking-brand text-rose-500">
                {coupon}
              </p>
              <p className="text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                APLÍCALO EN EL CARRITO ANTES DE PAGAR.
              </p>
              <button type="button" onClick={close} className="btn-dark mt-6">
                EMPEZAR A COMPRAR
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">OFERTA DE BIENVENIDA</p>
              <h2 className="heading-md mt-3 text-ink-950">{title}</h2>
              <p className="mt-3 text-[11px] leading-relaxed tracking-wider2 text-smoke-600">{text}</p>

              <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TU CORREO"
                  aria-label="CORREO PARA RECIBIR EL CUPÓN"
                  className="field normal-case-force"
                />
                <button type="submit" disabled={sending} className="btn-primary w-full">
                  {sending ? 'ENVIANDO…' : 'OBTENER DESCUENTO'}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="text-[10px] tracking-brand text-smoke-500 hover:text-ink-900"
                >
                  NO, GRACIAS
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
