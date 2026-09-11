import Link from 'next/link';
import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/SafeImage';
import { listCategories } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CATEGORÍAS',
  description: 'DESCUBRE TODAS LAS CATEGORÍAS DE FASHION KAT Y ENCUENTRA TU PRÓXIMA PRENDA FAVORITA.',
  alternates: { canonical: '/categorias' },
};

export default async function CategoriasPage() {
  const categories = await listCategories(true);

  return (
    <>
      <section className="border-b border-smoke-300 bg-smoke-100 py-14">
        <div className="container-fk">
          <p className="eyebrow">EXPLORA</p>
          <h1 className="heading-xl mt-4 text-ink-950">CATEGORÍAS</h1>
          <p className="mt-4 max-w-xl text-[11px] leading-relaxed tracking-brand text-smoke-600">
            CADA CATEGORÍA REÚNE PRENDAS SELECCIONADAS PARA QUE ENCUENTRES TU ESTILO MÁS RÁPIDO.
          </p>
        </div>
      </section>

      <section className="container-fk py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article key={category.id} className="group flex flex-col border border-smoke-300 bg-white">
              <Link
                href={`/productos?categoria=${category.slug}`}
                className="relative aspect-[16/11] overflow-hidden bg-ink-950"
              >
                <div className="absolute inset-0 opacity-85 transition-transform duration-700 group-hover:scale-105">
                  <SafeImage
                    src={category.imageUrl}
                    alt={category.name}
                    label={category.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-[13px] font-semibold tracking-brand text-ink-950">{category.name}</h2>
                <p className="mt-2 flex-1 text-[10px] leading-relaxed tracking-wider2 text-smoke-600">
                  {category.description ?? 'PRENDAS SELECCIONADAS POR FASHION KAT.'}
                </p>
                <p className="mt-4 text-[9px] font-semibold tracking-brand text-rose-500">
                  {category.productCount} {category.productCount === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
                </p>
                <Link href={`/productos?categoria=${category.slug}`} className="btn-dark mt-5 w-full">
                  VER PRODUCTOS
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
