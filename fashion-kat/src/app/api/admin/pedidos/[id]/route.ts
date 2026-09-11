import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { orderStatusSchema } from '@/lib/validation';
import { changeOrderStatus } from '@/services/orders';
import { toOrderDTO } from '@/lib/serializers';

type Params = { params: { id: string } };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin('pedidos');
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' }, include: { changedBy: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    if (!order) return fail('NO ENCONTRAMOS ESTE PEDIDO.', 404);

    return ok({
      order: toOrderDTO(order),
      account: order.user,
      history: order.statusHistory.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        createdAt: h.createdAt.toISOString(),
        changedBy: h.changedBy ? `${h.changedBy.firstName} ${h.changedBy.lastName}` : 'SISTEMA',
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin('pedidos');
    const data = orderStatusSchema.parse(await request.json());

    const order = await changeOrderStatus(params.id, data.status, {
      note: data.note || undefined,
      changedById: admin.id,
      trackingCode: data.trackingCode || undefined,
      carrier: data.carrier ? data.carrier.toUpperCase() : undefined,
    });

    return ok({
      order: { id: order.id, status: order.status },
      message: 'ESTADO DEL PEDIDO ACTUALIZADO.',
    });
  } catch (error) {
    return handleError(error);
  }
}
