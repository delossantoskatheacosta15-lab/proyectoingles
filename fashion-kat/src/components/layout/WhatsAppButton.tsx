'use client';

import { IconWhatsapp } from '@/components/ui/Icons';

// EL NÚMERO SE CONFIGURA EN .env (NEXT_PUBLIC_WHATSAPP_NUMBER) O EN EL PANEL ADMINISTRATIVO.
// NO SE INVENTA NINGÚN NÚMERO REAL.
export function WhatsAppButton({ phone }: { phone?: string }) {
  const number = (phone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const message =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    'HOLA, FASHION KAT. TENGO UNA PREGUNTA SOBRE UN PRODUCTO.';

  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : '/contacto';

  return (
    <a
      href={href}
      target={number ? '_blank' : undefined}
      rel={number ? 'noopener noreferrer' : undefined}
      aria-label={number ? 'ESCRÍBENOS POR WHATSAPP' : 'IR A CONTACTO'}
      title={
        number
          ? 'ESCRÍBENOS POR WHATSAPP'
          : 'CONFIGURA EL NÚMERO EN NEXT_PUBLIC_WHATSAPP_NUMBER O EN EL PANEL ADMINISTRATIVO'
      }
      className="group fixed bottom-5 left-4 z-[100] flex items-center gap-2.5 bg-ink-950 py-3 pl-3.5 pr-4 text-white shadow-lift transition-all hover:bg-rose-500 sm:left-6"
    >
      <IconWhatsapp className="h-5 w-5" />
      <span className="hidden text-[10px] font-semibold tracking-brand sm:block">ESCRÍBENOS</span>
    </a>
  );
}
