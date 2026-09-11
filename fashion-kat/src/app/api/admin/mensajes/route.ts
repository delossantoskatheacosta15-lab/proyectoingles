import { prisma } from '@/lib/prisma';
import { ok, handleError, getPagination } from '@/lib/api';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin('mensajes');
    const { searchParams } = new URL(request.url);
    const { page, size, skip, take } = getPagination(searchParams, 20);
    const estado = searchParams.get('estado') ?? '';

    const where = estado ? { status: estado } : {};

    const [total, rows, counts] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.contactMessage.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const summary: Record<string, number> = { TODOS: 0, NUEVO: 0, LEIDO: 0, RESPONDIDO: 0 };
    counts.forEach((c) => {
      summary[c.status] = c._count._all;
      summary.TODOS += c._count._all;
    });

    return ok({
      items: rows.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), repliedAt: m.repliedAt?.toISOString() ?? null })),
      summary,
      page,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    });
  } catch (error) {
    return handleError(error);
  }
}
