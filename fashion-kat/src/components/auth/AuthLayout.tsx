import Link from 'next/link';
import { IconHanger } from '@/components/ui/Icons';

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-200px)] lg:grid-cols-2">
      {/* PANEL DE MARCA */}
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-ink-950 via-ink-900 to-rose-800 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center border border-rose-400 text-rose-400">
            <IconHanger className="h-5 w-5" />
          </span>
          <span className="text-[16px] font-semibold tracking-brand">FASHION KAT</span>
        </Link>

        <div>
          <p className="text-3xl font-light leading-snug tracking-wider2 text-white">
            TU ESTILO,
            <br />
            TU ACTITUD,
            <br />
            TU MOMENTO.
          </p>
          <p className="mt-6 max-w-sm text-[11px] leading-relaxed tracking-brand text-white/60">
            CREA TU CUENTA PARA GUARDAR TUS FAVORITOS, SEGUIR TUS PEDIDOS Y RECIBIR OFERTAS EXCLUSIVAS
            ANTES QUE NADIE.
          </p>
        </div>

        <p className="text-[9px] tracking-brand text-white/40">
          ENVÍOS A TODA COLOMBIA · PAGO CONTRA ENTREGA
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="heading-lg mt-3 text-ink-950">{title}</h1>
          <p className="mt-3 text-[11px] leading-relaxed tracking-brand text-smoke-600">{subtitle}</p>

          <div className="mt-9">{children}</div>

          {footer && <div className="mt-8 border-t border-smoke-200 pt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
