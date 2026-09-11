import Link from 'next/link';
import type { Metadata } from 'next';

import { SafeImage } from '@/components/ui/SafeImage';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/product/SectionHeader';
import { TrustBar } from '@/components/layout/TrustBar';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { getHomeSections } from '@/services/products';
import { listCategories, listCatalogs, listActiveBanners } from '@/services/taxonomy';
import { BRAND } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.slogan}`,
  description: BRAND.description,
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [sections, categories, catalogs, heroBanners, promoBanners] = await Promise.all([
    getHomeSections(),
    listCategories(true),
    listCatalogs(true),
    listActiveBanners('HERO'),
    listActiveBanners('PROMO'),
  ]);

  const promo = promoBanners[0];

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <HeroCarousel
        banners={heroBanners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          imageUrl: b.imageUrl,
          buttonText: b.buttonText,
          link: b.link,
        }))}
      />

      {/* ---------------- BARRA DE CONFIANZA ---------------- */}
      <TrustBar />

      {/* ---------------- CATEGORÍAS ---------------- */}
      <section className="container-fk py-20">
        <SectionHeader
          eyebrow="EXPLORA"
          title="COMPRA POR CATEGORÍA"
          description="ENCUENTRA EXACTAMENTE LO QUE BUSCAS ENTRE NUESTRAS COLECCIONES CUIDADOSAMENTE SELECCIONADAS."
          linkHref="/categorias"
          linkText="VER TODAS LAS CATEGORÍAS"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/productos?categoria=${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden bg-ink-950"
            >
              <div className="absolute inset-0 opacity-75 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60">
                <SafeImage
                  src={category.imageUrl}
                  alt={category.name}
                  label={category.name}
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[12px] font-semibold tracking-brand text-white">{category.name}</p>
                <p className="mt-1 text-[9px] tracking-brand text-rose-400">
                  {category.productCount} {category.productCount === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
                </p>
                <span className="mt-3 inline-block border-b border-rose-500 pb-0.5 text-[9px] font-semibold tracking-brand text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  VER PRODUCTOS →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- MÁS VENDIDOS ---------------- */}
      <section className="container-fk pb-20">
        <SectionHeader
          eyebrow="LO QUE MÁS AMAN NUESTRAS CLIENTAS"
          title="PRODUCTOS MÁS VENDIDOS"
          linkHref="/productos?orden=vendidos"
        />
        <ProductGrid products={sections.bestSellers} priorityCount={4} />
      </section>

      {/* ---------------- BANNER PROMOCIONAL ---------------- */}
      {promo && (
        <section className="relative overflow-hidden bg-ink-950">
          <div className="absolute inset-0 opacity-40">
            <SafeImage src={promo.imageUrl} alt={promo.title} label={promo.title} sizes="100vw" />
          </div>
          <div className="container-fk relative flex flex-col items-start gap-6 py-24 sm:items-center sm:text-center">
            <p className="eyebrow">OFERTA ESPECIAL</p>
            <h2 className="heading-xl max-w-2xl text-white">{promo.title}</h2>
            {promo.subtitle && (
              <p className="max-w-xl text-[11px] leading-relaxed tracking-brand text-white/70">
                {promo.subtitle}
              </p>
            )}
            <Link href={promo.link ?? '/ofertas'} className="btn-primary mt-2">
              {promo.buttonText ?? 'VER OFERTAS'}
            </Link>
          </div>
        </section>
      )}

      {/* ---------------- NUEVA COLECCIÓN ---------------- */}
      <section className="container-fk py-20">
        <SectionHeader
          eyebrow="RECIÉN LLEGADO"
          title="NUEVA COLECCIÓN"
          linkHref="/productos?nuevo=true"
        />
        <ProductGrid products={sections.newArrivals} priorityCount={0} />
      </section>

      {/* ---------------- CATÁLOGOS ---------------- */}
      <section className="border-y border-smoke-300 bg-smoke-100 py-20">
        <div className="container-fk">
          <SectionHeader
            eyebrow="COLECCIONES CURADAS"
            title="NUESTROS CATÁLOGOS"
            description="SELECCIONES ARMADAS POR NUESTRO EQUIPO PARA QUE ENCUENTRES TU LOOK COMPLETO MÁS RÁPIDO."
            linkHref="/catalogo"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {catalogs.slice(0, 6).map((catalog) => (
              <Link
                key={catalog.id}
                href={`/catalogo/${catalog.slug}`}
                className="group relative aspect-[16/10] overflow-hidden bg-ink-950"
              >
                <div className="absolute inset-0 opacity-70 transition-all duration-700 group-hover:scale-105">
                  <SafeImage
                    src={catalog.coverUrl}
                    alt={catalog.name}
                    label={catalog.name}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-ink-950/35 transition-colors group-hover:bg-ink-950/20" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[12px] font-semibold tracking-brand text-white">{catalog.name}</p>
                  <p className="mt-1 text-[9px] tracking-brand text-rose-300">
                    {catalog.productCount} PRODUCTOS
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- OFERTAS DE LA SEMANA ---------------- */}
      <section className="container-fk py-20">
        <SectionHeader
          eyebrow="POR TIEMPO LIMITADO"
          title="OFERTAS DE LA SEMANA"
          linkHref="/ofertas"
        />
        <ProductGrid products={sections.onSale} priorityCount={0} />
      </section>

      {/* ---------------- MANIFIESTO DE MARCA ---------------- */}
      <section className="bg-ink-950 py-24 text-center text-white">
        <div className="container-fk flex flex-col items-center">
          <p className="eyebrow">FASHION KAT</p>
          <p className="mt-5 max-w-3xl text-2xl font-light leading-relaxed tracking-wider2 sm:text-3xl">
            {BRAND.slogan}
          </p>
          <p className="mt-6 max-w-xl text-[11px] leading-relaxed tracking-brand text-white/60">
            CREEMOS QUE LA MODA ES UNA FORMA DE HABLAR SIN DECIR UNA PALABRA. POR ESO CADA PRENDA QUE
            SELECCIONAMOS ESTÁ PENSADA PARA QUE TE SIENTAS SEGURA, CÓMODA Y COMPLETAMENTE TÚ.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/productos" className="btn-primary">
              COMPRAR AHORA
            </Link>
            <Link href="/nosotros" className="btn-outline-light">
              CONOCE LA MARCA
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
