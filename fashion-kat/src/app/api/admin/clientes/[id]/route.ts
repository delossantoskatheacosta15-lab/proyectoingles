import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { customerUpdateSchema } from '@/lib/validation';
import { toOrderDTO } from '@/lib/serializers';

type Params = { params: { id: string } };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin('clientes');
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true, statusHistory: true },
        },
      },
    });
    if (!user) return fail('NO ENCONTRAMOS ESTE CLIENTE.', 404);

    return ok({
      customer: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        addresses: user.addresses,
        orderCount: user.orders.length,
        totalSpent: user.orders
          .filter((o) => o.status !== 'CANCELADO')
          .reduce((sum, o) => sum + o.total, 0),
      },
      orders: user.orders.map(toOrderDTO),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin('clientes');
    if (admin.role !== 'ADMIN') {
      return fail('SOLO UN ADMINISTRADOR PUEDE CAMBIAR ROLES O ESTADOS.', 403);
    }
    if (admin.id === params.id) {
      return fail('NO PUEDES CAMBIAR TU PROPIO ROL O ESTADO.', 400);
    }

    const data = customerUpdateSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
      select: { id: true, role: true, status: true },
    });

    return ok({ customer: user, message: 'CLIENTE ACTUALIZADO.' });
  } catch (error) {
    return handleError(error);
  }
}
