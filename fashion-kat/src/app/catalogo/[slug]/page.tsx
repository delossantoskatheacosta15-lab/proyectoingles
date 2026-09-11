import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/SafeImage';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getCatalogBySlug, listCatalogs } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCatalogBySlug(params.slug);
  if (!data) return { title: 'CATÁLOGO NO ENCONTRADO' };
  return {
    title: data.catalog.name,
    description: data.catalog.description ?? `CATÁLOGO ${data.catalog.name} DE FASHION KAT.`,
    alternates: { canonical: `/catalogo/${data.catalog.slug}` },
    openGraph: {
      title: `${data.catalog.name} · FASHION KAT`,
      description: data.catalog.description ?? '',
      images: data.catalog.coverUrl ? [data.catalog.coverUrl] : undefined,
    },
  };
}

export default async function CatalogoDetallePage({ params }: { params: { slug: string } }) {
  const data = await getCatalogBySlug(params.slug);
  if (!data || !data.catalog.active) notFound();

  const others = (await listCatalogs(true)).filter((c) => c.slug !== params.slug).slice(0, 5);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 py-24">
        <div className="absolute inset-0 opacity-45">
          <SafeImage
            src={data.catalog.coverUrl}
            alt={data.catalog.name}
            label={data.catalog.name}
            sizes="100vw"
            priority
          />
        </div>
        <div className="container-fk relative">
          <nav className="mb-6 flex items-center gap-2 text-[9px] tracking-brand text-white/60">
            <Link href="/" className="hover:text-rose-400">INICIO</Link>
            <span>/</span>
            <Link href="/catalogo" className="hover:text-rose-400">CATÁLOGOS</Link>
            <span>/</span>
            <span className="text-rose-400">{data.catalog.name}</span>
          </nav>
          <h1 className="heading-xl text-white">{data.catalog.name}</h1>
          {data.catalog.description && (
            <p className="mt-4 max-w-xl text-[11px] leading-relaxed tracking-brand text-white/70">
              {data.catalog.description}
            </p>
          )}
          <p className="mt-5 text-[10px] font-semibold tracking-brand text-rose-400">
            {data.products.length} PRODUCTOS EN ESTE CATÁLOGO
          </p>
        </div>
      </section>

      <section className="container-fk py-14">
        <ProductGrid
          products={data.products}
          emptyTitle="ESTE CATÁLOGO AÚN NO TIENE PRODUCTOS."
          emptyDescription="VUELVE PRONTO O EXPLORA NUESTROS OTROS CATÁLOGOS."
        />
      </section>

      {others.length > 0 && (
        <section className="border-t border-smoke-300 bg-smoke-100 py-14">
          <div className="container-fk">
            <p className="label-xs mb-5">OTROS CATÁLOGOS</p>
            <div className="flex flex-wrap gap-3">
              {others.map((c) => (
                <Link key={c.id} href={`/catalogo/${c.slug}`} className="btn-ghost">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
