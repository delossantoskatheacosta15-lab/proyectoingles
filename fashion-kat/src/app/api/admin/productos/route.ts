import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, getPagination } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { productSchema } from '@/lib/validation';
import { joinImages, slugify, discountPercent } from '@/lib/utils';
import { toProductDTO } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin('productos');
    const { searchParams } = new URL(request.url);
    const { page, size, skip, take } = getPagination(searchParams, 20);

    const q = (searchParams.get('q') ?? '').trim().toUpperCase();
    const estado = searchParams.get('estado') ?? '';
    const categoria = searchParams.get('categoria') ?? '';

    const where: any = {};
    const and: any[] = [];
    if (q) {
      and.push({
        OR: [{ name: { contains: q } }, { sku: { contains: q } }, { tags: { contains: q } }],
      });
    }
    if (estado) and.push({ status: estado });
    if (categoria) and.push({ categoryId: categoria });
    if (and.length) where.AND = and;

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true, variants: true, _count: { select: { reviews: true } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return ok({
      items: rows.map(toProductDTO),
      page,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin('productos');
    const data = productSchema.parse(await request.json());

    const slug = (data.slug && data.slug.trim()) || slugify(data.name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) return fail('YA EXISTE UN PRODUCTO CON ESA URL. CAMBIA EL NOMBRE O EL SLUG.', 409);

    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku.toUpperCase() } });
    if (existingSku) return fail('YA EXISTE UN PRODUCTO CON ESE SKU.', 409);

    const variants = data.variants ?? [];
    const totalStock = variants.length
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : data.stock ?? 0;

    const product = await prisma.product.create({
      data: {
        sku: data.sku.toUpperCase(),
        name: data.name.toUpperCase(),
        slug,
        description: data.description.toUpperCase(),
        shortDescription: data.shortDescription.toUpperCase(),
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        discountPercent: discountPercent(data.price, data.comparePrice),
        categoryId: data.categoryId,
        subcategory: data.subcategory ? data.subcategory.toUpperCase() : null,
        brand: (data.brand || 'FASHION KAT').toUpperCase(),
        tags: (data.tags ?? '').toUpperCase(),
        images: joinImages(data.images ?? []),
        stock: totalStock,
        minStock: data.minStock ?? 5,
        status: data.status,
        isFeatured: Boolean(data.isFeatured),
        isNew: Boolean(data.isNew),
        isOnSale: Boolean(data.isOnSale),
        metaTitle: data.metaTitle || `${data.name.toUpperCase()} · FASHION KAT`,
        metaDescription: data.metaDescription || data.shortDescription.toUpperCase(),
        variants: {
          create: variants.map((v) => ({
            sku: `${data.sku.toUpperCase()}-${v.color.slice(0, 3).toUpperCase()}-${v.size.toUpperCase()}`,
            size: v.size.toUpperCase(),
            color: v.color.toUpperCase(),
            colorHex: v.colorHex || '#0A0A0A',
            stock: v.stock,
            priceDiff: v.priceDiff ?? 0,
            active: v.active ?? true,
          })),
        },
      },
      include: { category: true, variants: true },
    });

    return ok({ product: toProductDTO(product), message: 'PRODUCTO CREADO CORRECTAMENTE.', by: admin.email });
  } catch (error) {
    return handleError(error);
  }
}
