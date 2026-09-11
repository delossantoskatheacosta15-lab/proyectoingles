import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { couponSchema } from '@/lib/validation';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('cupones');
    const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!existing) return fail('NO ENCONTRAMOS ESTE CUPÓN.', 404);

    const data = couponSchema.parse(await request.json());

    const conflict = await prisma.coupon.findFirst({
      where: { code: data.code, NOT: { id: params.id } },
    });
    if (conflict) return fail('YA EXISTE OTRO CUPÓN CON ESE CÓDIGO.', 409);

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: data.code,
        description: data.description ? data.description.toUpperCase() : null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? 0,
        maxDiscount: data.maxDiscount ?? null,
        startsAt: data.startsAt ? new Date(data.startsAt) : existing.startsAt,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxUses: data.maxUses ?? null,
        maxUsesPerUser: data.maxUsesPerUser ?? 1,
        categories: data.categories ?? '',
        active: data.active ?? existing.active,
      },
    });

    return ok({ coupon, message: 'CUPÓN ACTUALIZADO.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('cupones');
    await prisma.coupon.delete({ where: { id: params.id } });
    return ok({ message: 'CUPÓN ELIMINADO.' });
  } catch (error) {
    return handleError(error);
  }
}
