import { prisma } from '@/lib/prisma';
import { ok, handleError, getPagination } from '@/lib/api';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin('resenas');
    const { searchParams } = new URL(request.url);
    const { page, size, skip, take } = getPagination(searchParams, 20);
    const estado = searchParams.get('estado') ?? '';
    const q = (searchParams.get('q') ?? '').trim().toUpperCase();

    const and: any[] = [];
    if (estado) and.push({ status: estado });
    if (q) {
      and.push({
        OR: [{ authorName: { contains: q } }, { product: { name: { contains: q } } }],
      });
    }
    const where = and.length ? { AND: and } : {};

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: { product: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return ok({
      items: rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        productSlug: r.product.slug,
        authorName: r.authorName,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
      page,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    });
  } catch (error) {
    return handleError(error);
  }
}
