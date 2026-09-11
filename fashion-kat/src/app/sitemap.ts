import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/productos',
    '/categorias',
    '/catalogo',
    '/ofertas',
    '/contacto',
    '/nosotros',
    '/faq',
    '/seguimiento',
    '/politica-de-privacidad',
    '/terminos-y-condiciones',
    '/cambios-y-devoluciones',
    '/login',
    '/registro',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }));

  try {
    const [products, categories, catalogs] = await Promise.all([
      prisma.product.findMany({
        where: { status: { in: ['ACTIVO', 'AGOTADO'] } },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
      prisma.catalog.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticRoutes,
      ...products.map((p) => ({
        url: `${SITE_URL}/producto/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })),
      ...categories.map((c) => ({
        url: `${SITE_URL}/productos?categoria=${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...catalogs.map((c) => ({
        url: `${SITE_URL}/catalogo/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
