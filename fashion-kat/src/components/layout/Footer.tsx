'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import {
  IconHanger,
  IconInstagram,
  IconFacebook,
  IconTiktok,
  IconMail,
  IconPhone,
  IconPin,
  IconClock,
} from '@/components/ui/Icons';
import type { CategoryDTO } from '@/lib/types';

export function Footer({
  categories,
  settings,
}: {
  categories: CategoryDTO[];
  settings: Record<string, string>;
}) {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'FOOTER' }),
      });
      const json = await response.json();
      if (json.ok) {
        success(json.data.message);
        setEmail('');
      } else {
        error(json.error);
      }
    } catch {
      error('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="mt-24 bg-ink-950 text-white">
      <div className="container-fk py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* MARCA */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center border border-rose-500 text-rose-500">
                <IconHanger className="h-5 w-5" />
              </span>
              <span className="text-[17px] font-semibold tracking-brand">FASHION KAT</span>
            </div>
            <p className="mt-4 max-w-sm text-[11px] leading-relaxed tracking-wider2 text-white/60">
              {settings.store_slogan ?? 'TU ESTILO, TU ACTITUD, TU MOMENTO.'} MODA FEMENINA PREMIUM CON
              ENVÍOS A TODA COLOMBIA Y PAGO CONTRA ENTREGA.
            </p>

            <form onSubmit={subscribe} className="mt-7 max-w-sm">
              <p className="label-xs mb-2 text-white/70">SUSCRÍBETE Y RECIBE NUESTRAS OFERTAS</p>
              <div className="flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TU CORREO"
                  aria-label="CORREO PARA SUSCRIPCIÓN"
                  className="normal-case-force w-full border border-white/20 bg-transparent px-3.5 py-3 text-[11px] tracking-wide text-white outline-none placeholder:text-white/40 focus:border-rose-500"
                />
                <button type="submit" disabled={sending} className="btn-primary shrink-0 px-5 py-3">
                  {sending ? 'ENVIANDO…' : 'SUSCRIBIRME'}
                </button>
              </div>
            </form>

            <div className="mt-7 flex items-center gap-3">
              {[
                { href: settings.social_instagram, icon: IconInstagram, label: 'INSTAGRAM' },
                { href: settings.social_facebook, icon: IconFacebook, label: 'FACEBOOK' },
                { href: settings.social_tiktok, icon: IconTiktok, label: 'TIKTOK' },
              ]
                .filter((s) => s.href)
                .map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-rose-500 hover:text-rose-400"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div>
            <p className="label-xs mb-4 text-white/70">CATEGORÍAS</p>
            <ul className="flex flex-col gap-2.5">
              {categories.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/productos?categoria=${c.slug}`}
                    className="text-[10px] tracking-wider2 text-white/60 transition-colors hover:text-rose-400"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AYUDA */}
          <div>
            <p className="label-xs mb-4 text-white/70">AYUDA</p>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'NOSOTROS', href: '/nosotros' },
                { label: 'CONTACTO', href: '/contacto' },
                { label: 'PREGUNTAS FRECUENTES', href: '/faq' },
                { label: 'SEGUIMIENTO DE PEDIDO', href: '/seguimiento' },
                { label: 'CAMBIOS Y DEVOLUCIONES', href: '/cambios-y-devoluciones' },
                { label: 'TÉRMINOS Y CONDICIONES', href: '/terminos-y-condiciones' },
                { label: 'POLÍTICA DE PRIVACIDAD', href: '/politica-de-privacidad' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[10px] tracking-wider2 text-white/60 transition-colors hover:text-rose-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <p className="label-xs mb-4 text-white/70">CONTACTO</p>
            <ul className="flex flex-col gap-3.5 text-[10px] tracking-wider2 text-white/60">
              <li className="flex items-start gap-2.5">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{settings.store_address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{settings.store_phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span className="break-all">{settings.store_email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{settings.store_schedule}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-fk flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-[9px] tracking-brand text-white/45">
            © {new Date().getFullYear()} FASHION KAT. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <p className="text-[9px] tracking-brand text-white/45">
            MEDIOS DE PAGO: TARJETAS · PSE · TRANSFERENCIA · CONTRA ENTREGA
          </p>
        </div>
      </div>
    </footer>
  );
}
