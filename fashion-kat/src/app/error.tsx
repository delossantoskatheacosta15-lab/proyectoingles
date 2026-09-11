'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // SE REGISTRA EN EL SERVIDOR; EL CLIENTE NUNCA VE DETALLES TÉCNICOS
    console.error('[FASHION KAT][ERROR]', error);
  }, [error]);

  return (
    <div className="container-fk flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="heading-lg text-ink-950">ALGO SALIÓ MAL. INTENTA NUEVAMENTE.</h1>
      <p className="mt-4 max-w-md text-[11px] leading-relaxed tracking-brand text-smoke-600">
        TUVIMOS UN INCONVENIENTE AL CARGAR ESTA PÁGINA. SI EL PROBLEMA CONTINÚA, ESCRÍBENOS Y TE
        AYUDAMOS.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          REINTENTAR
        </button>
        <Link href="/" className="btn-outline">
          VOLVER AL INICIO
        </Link>
      </div>
    </div>
  );
}
