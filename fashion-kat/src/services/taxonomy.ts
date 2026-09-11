import { prisma } from '@/lib/prisma';
import { toCategoryDTO, toCatalogDTO, toProductDTO } from '@/lib/serializers';

const VISIBLE_STATUSES = ['ACTIVO', 'AGOTADO'];

export async function listCategories(onlyActive = true) {
  const rows = await prisma.category.findMany({
    where: onlyActive ? { active: true } : undefined,
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { products: { where: { status: { in: VISIBLE_STATUSES } } } } },
    },
  });
  return rows.map(toCategoryDTO);
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: { where: { status: { in: VISIBLE_STATUSES } } } } } },
  });
  return category ? toCategoryDTO(category) : null;
}

export async function listCatalogs(onlyActive = true) {
  const rows = await prisma.catalog.findMany({
    where: onlyActive ? { active: true } : undefined,
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
  return rows.map(toCatalogDTO);
}

export async function getCatalogBySlug(slug: string) {
  const catalog = await prisma.catalog.findUnique({
    where: { slug },
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { position: 'asc' },
        include: { product: { include: { category: true } } },
      },
    },
  });
  if (!catalog) return null;

  return {
    catalog: toCatalogDTO(catalog),
    products: catalog.products
      .filter((cp) => VISIBLE_STATUSES.includes(cp.product.status))
      .map((cp) => toProductDTO(cp.product)),
  };
}

export async function listActiveBanners(placement = 'HERO') {
  return prisma.banner.findMany({
    where: { active: true, placement },
    orderBy: { position: 'asc' },
  });
}
