import Link from 'next/link';
import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/SafeImage';
import { listCatalogs } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CATÁLOGOS',
  description: 'COLECCIONES CURADAS POR FASHION KAT: NUEVA COLECCIÓN, CASUAL, COLECCIÓN ROSA Y MÁS.',
  alternates: { canonical: '/catalogo' },
};

export default async function CatalogosPage() {
  const catalogs = await listCatalogs(true);

  return (
    <>
      <section className="border-b border-smoke-300 bg-smoke-100 py-14">
        <div className="container-fk">
          <p className="eyebrow">COLECCIONES CURADAS</p>
          <h1 className="heading-xl mt-4 text-ink-950">CATÁLOGOS</h1>
          <p className="mt-4 max-w-xl text-[11px] leading-relaxed tracking-brand text-smoke-600">
            SELECCIONES ARMADAS POR NUESTRO EQUIPO PARA INSPIRARTE Y AYUDARTE A CREAR TU LOOK COMPLETO.
          </p>
        </div>
      </section>

      <section className="container-fk py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalogs.map((catalog) => (
            <Link
              key={catalog.id}
              href={`/catalogo/${catalog.slug}`}
              className="group relative aspect-[4/3] overflow-hidden bg-ink-950"
            >
              <div className="absolute inset-0 opacity-70 transition-all duration-700 group-hover:scale-105">
                <SafeImage
                  src={catalog.coverUrl}
                  alt={catalog.name}
                  label={catalog.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="text-[13px] font-semibold tracking-brand text-white">{catalog.name}</h2>
                {catalog.description && (
                  <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed tracking-wider2 text-white/70">
                    {catalog.description}
                  </p>
                )}
                <p className="mt-3 text-[9px] font-semibold tracking-brand text-rose-400">
                  {catalog.productCount} PRODUCTOS · VER CATÁLOGO →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
