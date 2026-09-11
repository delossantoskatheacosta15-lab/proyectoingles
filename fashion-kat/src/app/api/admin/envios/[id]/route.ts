import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { shippingRateSchema } from '@/lib/validation';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('envios');
    const existing = await prisma.shippingRate.findUnique({ where: { id: params.id } });
    if (!existing) return fail('NO ENCONTRAMOS ESTA TARIFA.', 404);

    const data = shippingRateSchema.parse(await request.json());
    const rate = await prisma.shippingRate.update({
      where: { id: params.id },
      data: {
        state: data.state.toUpperCase(),
        city: data.city ? data.city.toUpperCase() : null,
        cost: data.cost,
        etaDays: (data.etaDays || existing.etaDays).toUpperCase(),
        active: data.active ?? existing.active,
      },
    });

    return ok({ rate, message: 'TARIFA ACTUALIZADA.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('envios');
    await prisma.shippingRate.delete({ where: { id: params.id } });
    return ok({ message: 'TARIFA ELIMINADA.' });
  } catch (error) {
    return handleError(error);
  }
}
