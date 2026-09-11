import { prisma } from '@/lib/prisma';
import { toProductDTO } from '@/lib/serializers';
import { PAGE_SIZE } from '@/lib/constants';
import type { Paginated, ProductDTO } from '@/lib/types';

export type ProductFilters = {
  categoria?: string; // SLUG DE CATEGORÍA
  catalogo?: string; // SLUG DE CATÁLOGO
  q?: string;
  precioMin?: number;
  precioMax?: number;
  talla?: string;
  color?: string;
  marca?: string;
  disponibilidad?: 'disponible' | 'agotado';
  descuento?: boolean;
  valoracion?: number;
  oferta?: boolean;
  nuevo?: boolean;
  destacado?: boolean;
  orden?: string;
  pagina?: number;
  tamano?: number;
  incluirOcultos?: boolean;
};

const VISIBLE_STATUSES = ['ACTIVO', 'AGOTADO'];

function buildOrderBy(orden?: string) {
  switch (orden) {
    case 'vendidos':
      return [{ soldCount: 'desc' as const }, { createdAt: 'desc' as const }];
    case 'valorados':
      return [{ rating: 'desc' as const }, { reviewCount: 'desc' as const }];
    case 'precio-asc':
      return [{ price: 'asc' as const }];
    case 'precio-desc':
      return [{ price: 'desc' as const }];
    case 'recientes':
    default:
      return [{ createdAt: 'desc' as const }];
  }
}

export async function buildProductWhere(filters: ProductFilters) {
  const where: any = {};
  const and: any[] = [];

  if (!filters.incluirOcultos) {
    where.status = { in: VISIBLE_STATUSES };
  }

  if (filters.categoria) {
    and.push({ category: { slug: filters.categoria } });
  }

  if (filters.catalogo) {
    and.push({ catalogs: { some: { catalog: { slug: filters.catalogo, active: true } } } });
  }

  if (filters.q) {
    // SQLITE APLICA LIKE SIN DISTINGUIR MAYÚSCULAS EN ASCII; NORMALIZAMOS A MAYÚSCULAS
    // PORQUE TODO EL CATÁLOGO SE GUARDA EN MAYÚSCULAS.
    const term = filters.q.trim().toUpperCase();
    and.push({
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
        { shortDescription: { contains: term } },
        { sku: { contains: term } },
        { tags: { contains: term } },
        { subcategory: { contains: term } },
        { category: { name: { contains: term } } },
      ],
    });
  }

  if (typeof filters.precioMin === 'number') and.push({ price: { gte: filters.precioMin } });
  if (typeof filters.precioMax === 'number') and.push({ price: { lte: filters.precioMax } });

  if (filters.talla) {
    and.push({ variants: { some: { size: filters.talla, active: true } } });
  }
  if (filters.color) {
    and.push({ variants: { some: { color: filters.color, active: true } } });
  }
  if (filters.marca) and.push({ brand: filters.marca });

  if (filters.disponibilidad === 'disponible') and.push({ stock: { gt: 0 } });
  if (filters.disponibilidad === 'agotado') and.push({ stock: { lte: 0 } });

  if (filters.descuento) and.push({ discountPercent: { gt: 0 } });
  if (filters.oferta) and.push({ isOnSale: true });
  if (filters.nuevo) and.push({ isNew: true });
  if (filters.destacado) and.push({ isFeatured: true });
  if (typeof filters.valoracion === 'number' && filters.valoracion > 0) {
    and.push({ rating: { gte: filters.valoracion } });
  }

  if (and.length) where.AND = and;
  return where;
}

export async function listProducts(filters: ProductFilters): Promise<Paginated<ProductDTO>> {
  const page = Math.max(1, filters.pagina ?? 1);
  const pageSize = Math.min(60, Math.max(1, filters.tamano ?? PAGE_SIZE));
  const where = await buildProductWhere(filters);

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: buildOrderBy(filters.orden),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map(toProductDTO),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductBySlug(slug: string, includeHidden = false) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
    },
  });
  if (!product) return null;
  if (!includeHidden && !VISIBLE_STATUSES.includes(product.status)) return null;
  return toProductDTO(product);
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  const rows = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      status: { in: VISIBLE_STATUSES },
    },
    include: { category: true },
    orderBy: [{ soldCount: 'desc' }],
    take: limit,
  });
  if (rows.length >= limit) return rows.map(toProductDTO);

  // COMPLETA CON LOS MÁS VENDIDOS DE OTRAS CATEGORÍAS
  const extra = await prisma.product.findMany({
    where: {
      id: { notIn: [productId, ...rows.map((r) => r.id)] },
      status: { in: VISIBLE_STATUSES },
    },
    include: { category: true },
    orderBy: [{ soldCount: 'desc' }],
    take: limit - rows.length,
  });
  return [...rows, ...extra].map(toProductDTO);
}

// VENTA CRUZADA — "COMPLETA TU LOOK"
export async function getCrossSellProducts(categoryIds: string[], excludeIds: string[], limit = 4) {
  const complementary = ['BOLSOS', 'ZAPATOS', 'ACCESORIOS'];
  const categories = await prisma.category.findMany({ where: { name: { in: complementary } } });
  const rows = await prisma.product.findMany({
    where: {
      id: { notIn: excludeIds.length ? excludeIds : ['__ninguno__'] },
      categoryId: { in: categories.map((c) => c.id) },
      status: 'ACTIVO',
      stock: { gt: 0 },
    },
    include: { category: true },
    orderBy: [{ soldCount: 'desc' }],
    take: limit,
  });

  if (rows.length >= limit) return rows.map(toProductDTO);

  const extra = await prisma.product.findMany({
    where: {
      id: { notIn: [...excludeIds, ...rows.map((r) => r.id)].length ? [...excludeIds, ...rows.map((r) => r.id)] : ['__ninguno__'] },
      status: 'ACTIVO',
      stock: { gt: 0 },
    },
    include: { category: true },
    orderBy: [{ soldCount: 'desc' }],
    take: limit - rows.length,
  });
  return [...rows, ...extra].map(toProductDTO);
}

// SECCIONES DINÁMICAS DE LA HOME — CONTROLADAS DESDE EL PANEL ADMIN
export async function getHomeSections() {
  const [bestSellers, newArrivals, onSale] = await Promise.all([
    prisma.product.findMany({
      where: { status: { in: VISIBLE_STATUSES }, isFeatured: true },
      include: { category: true },
      orderBy: [{ soldCount: 'desc' }],
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: { in: VISIBLE_STATUSES }, isNew: true },
      include: { category: true },
      orderBy: [{ createdAt: 'desc' }],
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: { in: VISIBLE_STATUSES }, isOnSale: true },
      include: { category: true },
      orderBy: [{ discountPercent: 'desc' }],
      take: 8,
    }),
  ]);

  return {
    bestSellers: bestSellers.map(toProductDTO),
    newArrivals: newArrivals.map(toProductDTO),
    onSale: onSale.map(toProductDTO),
  };
}

export async function getFilterFacets() {
  const [priceAgg, variants, brands] = await Promise.all([
    prisma.product.aggregate({
      where: { status: { in: VISIBLE_STATUSES } },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.productVariant.findMany({
      where: { active: true },
      select: { size: true, color: true, colorHex: true },
    }),
    prisma.product.findMany({
      where: { status: { in: VISIBLE_STATUSES } },
      select: { brand: true },
      distinct: ['brand'],
    }),
  ]);

  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colorMap = new Map<string, string>();
  variants.forEach((v) => colorMap.set(v.color, v.colorHex));

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'ÚNICA'];
  sizes.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, 'es');
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return {
    minPrice: priceAgg._min.price ?? 0,
    maxPrice: priceAgg._max.price ?? 500000,
    sizes,
    colors: Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex })),
    brands: brands.map((b) => b.brand).filter(Boolean),
  };
}

// SUGERENCIAS DEL BUSCADOR INTELIGENTE
export async function searchSuggestions(term: string, limit = 6) {
  const q = term.trim().toUpperCase();
  if (q.length < 2) return { products: [], categories: [], total: 0 };

  const where = {
    status: { in: VISIBLE_STATUSES },
    OR: [
      { name: { contains: q } },
      { sku: { contains: q } },
      { tags: { contains: q } },
      { description: { contains: q } },
      { shortDescription: { contains: q } },
      { category: { name: { contains: q } } },
    ],
  };

  const [rows, total, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, take: limit, orderBy: [{ soldCount: 'desc' }] }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { name: { contains: q }, active: true }, take: 3 }),
  ]);

  return {
    products: rows.map(toProductDTO),
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    total,
  };
}
