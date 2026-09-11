import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPurchase } from '@/components/product/ProductPurchase';
import { ProductReviews } from '@/components/product/ProductReviews';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/product/SectionHeader';
import { getProductBySlug, getRelatedProducts } from '@/services/products';
import { formatCOP } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'PRODUCTO NO ENCONTRADO' };

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} · FASHION KAT`,
      description: product.shortDescription,
      images: product.images.length ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category.id, 4);
  const soldOut = product.stock <= 0 || product.status === 'AGOTADO';

  // DATOS ESTRUCTURADOS PARA BUSCADORES
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: product.price,
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-fk py-8">
        {/* MIGAS DE PAN */}
        <nav aria-label="MIGAS DE PAN" className="mb-8 flex flex-wrap items-center gap-2 text-[9px] tracking-brand text-smoke-500">
          <Link href="/" className="hover:text-rose-500">INICIO</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-rose-500">PRODUCTOS</Link>
          <span>/</span>
          <Link href={`/productos?categoria=${product.category.slug}`} className="hover:text-rose-500">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-ink-900">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery
            images={product.images}
            name={product.name}
            badges={
              <>
                {soldOut && <span className="badge bg-ink-950 text-white">AGOTADO</span>}
                {!soldOut && product.discountPercent > 0 && (
                  <span className="badge-rose">-{product.discountPercent}%</span>
                )}
                {!soldOut && product.isNew && <span className="badge bg-white text-ink-950">NUEVO</span>}
              </>
            }
          />

          <ProductPurchase product={product} />
        </div>

        {/* DESCRIPCIÓN */}
        <section className="mt-16 grid gap-10 border-t border-smoke-300 pt-14 lg:grid-cols-3">
          <div>
            <p className="eyebrow">SOBRE ESTA PRENDA</p>
            <h2 className="heading-md mt-3 text-ink-950">DESCRIPCIÓN</h2>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[11px] leading-loose tracking-wider2 text-smoke-700">
              {product.description}
            </p>

            <dl className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Detail label="MARCA" value={product.brand} />
              <Detail label="CATEGORÍA" value={product.category.name} />
              {product.subcategory && <Detail label="SUBCATEGORÍA" value={product.subcategory} />}
              <Detail label="SKU" value={product.sku} />
              <Detail label="PRECIO" value={formatCOP(product.price)} />
              <Detail label="DISPONIBILIDAD" value={soldOut ? 'AGOTADO' : `${product.stock} UNIDADES`} />
            </dl>

            {product.tags.length > 0 && (
              <div className="mt-8">
                <p className="label-xs mb-3">ETIQUETAS</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/productos?q=${encodeURIComponent(tag)}`}
                      className="badge bg-smoke-200 text-ink-800 transition-colors hover:bg-rose-500 hover:text-white"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RESEÑAS */}
        <div className="mt-16">
          <ProductReviews
            productId={product.id}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* RELACIONADOS */}
        {related.length > 0 && (
          <section className="mt-20">
            <SectionHeader
              eyebrow="COMBÍNALO CON"
              title="TAMBIÉN TE PUEDE GUSTAR"
              linkHref={`/productos?categoria=${product.category.slug}`}
            />
            <ProductGrid products={related} priorityCount={0} />
          </section>
        )}
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-smoke-200 py-2">
      <dt className="text-[9px] font-semibold tracking-brand text-smoke-500">{label}</dt>
      <dd className="text-[10px] font-medium tracking-wider2 text-ink-900">{value}</dd>
    </div>
  );
}
