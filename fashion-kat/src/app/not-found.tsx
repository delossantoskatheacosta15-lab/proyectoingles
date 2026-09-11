import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-fk flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-[80px] font-light leading-none tracking-wider2 text-rose-500 sm:text-[120px]">
        404
      </p>
      <h1 className="heading-lg mt-6 text-ink-950">¡UPS! ESTA PÁGINA NO EXISTE.</h1>
      <p className="mt-4 max-w-md text-[11px] leading-relaxed tracking-brand text-smoke-600">
        ES POSIBLE QUE EL ENLACE HAYA CAMBIADO O QUE EL PRODUCTO YA NO ESTÉ DISPONIBLE.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          VOLVER AL INICIO
        </Link>
        <Link href="/productos" className="btn-outline">
          VER PRODUCTOS
        </Link>
      </div>
    </div>
  );
}
