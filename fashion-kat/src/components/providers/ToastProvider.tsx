'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastKind = 'exito' | 'error' | 'info';

type Toast = { id: number; message: string; kind: ToastKind };

type ToastContextValue = {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++counter;
      setToasts((current) => [...current.slice(-3), { id, message, kind }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message: string) => toast(message, 'exito'),
      error: (message: string) => toast(message, 'error'),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2 sm:right-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => remove(t.id)}
            className={cn(
              'pointer-events-auto flex w-full items-start gap-3 border px-4 py-3.5 text-left text-[11px] font-medium tracking-wide shadow-lift animate-slide-in-right',
              t.kind === 'exito' && 'border-rose-500 bg-ink-950 text-white',
              t.kind === 'error' && 'border-red-500 bg-white text-red-700',
              t.kind === 'info' && 'border-ink-950 bg-white text-ink-900'
            )}
          >
            <span
              className={cn(
                'mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full',
                t.kind === 'exito' && 'bg-rose-500',
                t.kind === 'error' && 'bg-red-500',
                t.kind === 'info' && 'bg-ink-950'
              )}
            />
            <span className="flex-1 leading-relaxed">{t.message}</span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // FALLBACK SEGURO PARA COMPONENTES FUERA DEL PROVEEDOR
    return {
      toast: () => undefined,
      success: () => undefined,
      error: () => undefined,
    };
  }
  return context;
}
