import { prisma } from '@/lib/prisma';
import { ok, handleError, getPagination } from '@/lib/api';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin('clientes');
    const { searchParams } = new URL(request.url);
    const { page, size, skip, take } = getPagination(searchParams, 20);
    const q = (searchParams.get('q') ?? '').trim();
    const rol = searchParams.get('rol') ?? '';

    const and: any[] = [];
    if (q) {
      and.push({
        OR: [
          { firstName: { contains: q.toUpperCase() } },
          { lastName: { contains: q.toUpperCase() } },
          { email: { contains: q.toLowerCase() } },
          { phone: { contains: q } },
        ],
      });
    }
    if (rol) and.push({ role: rol });

    const where = and.length ? { AND: and } : {};

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { orders: true } },
          orders: { select: { total: true, status: true } },
        },
      }),
    ]);

    const items = rows.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      orderCount: u._count.orders,
      totalSpent: u.orders
        .filter((o) => o.status !== 'CANCELADO')
        .reduce((sum, o) => sum + o.total, 0),
    }));

    return ok({ items, page, pageSize: size, total, totalPages: Math.max(1, Math.ceil(total / size)) });
  } catch (error) {
    return handleError(error);
  }
}
