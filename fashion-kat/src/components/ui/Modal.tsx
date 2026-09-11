'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-950/70 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col bg-white shadow-lift animate-scale-in',
          widths[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-smoke-300 px-6 py-4">
          <h2 className="text-[12px] font-semibold tracking-brand text-ink-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="CERRAR"
            className="flex h-8 w-8 items-center justify-center text-ink-500 transition-colors hover:text-rose-500"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-smoke-300 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = 'CONFIRMAR ACCIÓN',
  message,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  onConfirm,
  onClose,
  danger = false,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>
            {cancelText}
          </button>
          <button
            type="button"
            className={danger ? 'btn bg-red-600 px-6 py-2.5 text-white hover:bg-red-700' : 'btn-primary btn-sm'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-[12px] leading-relaxed tracking-wide text-ink-700">{message}</p>
    </Modal>
  );
}
