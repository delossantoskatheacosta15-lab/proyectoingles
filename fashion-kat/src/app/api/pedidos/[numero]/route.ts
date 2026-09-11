import { ok, fail, handleError } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { getOrderByNumber } from '@/services/orders';
import { toOrderDTO } from '@/lib/serializers';
import { ADMIN_ROLES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { numero: string } }) {
  try {
    const user = await getCurrentUser();
    const order = await getOrderByNumber(params.numero.toUpperCase());
    if (!order) return fail('NO ENCONTRAMOS ESTE PEDIDO.', 404);

    const isOwner = user && order.userId === user.id;
    const isStaff = user && ADMIN_ROLES.includes(user.role);
    if (!isOwner && !isStaff) {
      return fail('NO TIENES PERMISO PARA VER ESTE PEDIDO.', 403);
    }

    return ok({ order: toOrderDTO(order) });
  } catch (error) {
    return handleError(error);
  }
}
