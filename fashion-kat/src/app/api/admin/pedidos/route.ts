import { prisma } from '@/lib/prisma';
import { ok, handleError, getPagination } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { toOrderDTO } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin('pedidos');
    const { searchParams } = new URL(request.url);
    const { page, size, skip, take } = getPagination(searchParams, 20);

    const q = (searchParams.get('q') ?? '').trim();
    const estado = searchParams.get('estado') ?? '';
    const pago = searchParams.get('pago') ?? '';

    const and: any[] = [];
    if (q) {
      and.push({
        OR: [
          { orderNumber: { contains: q.toUpperCase() } },
          { firstName: { contains: q.toUpperCase() } },
          { lastName: { contains: q.toUpperCase() } },
          { email: { contains: q.toLowerCase() } },
          { phone: { contains: q } },
        ],
      });
    }
    if (estado) and.push({ status: estado });
    if (pago) and.push({ paymentMethod: pago });

    const where = and.length ? { AND: and } : {};

    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return ok({
      items: rows.map(toOrderDTO),
      page,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    });
  } catch (error) {
    return handleError(error);
  }
}
