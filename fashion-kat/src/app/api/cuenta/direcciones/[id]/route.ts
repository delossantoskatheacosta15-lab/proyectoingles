import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { addressSchema } from '@/lib/validation';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const existing = await prisma.address.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.id) return fail('NO ENCONTRAMOS ESTA DIRECCIÓN.', 404);

    const data = addressSchema.parse(await request.json());

    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({
      where: { id: params.id },
      data: {
        label: (data.label || 'CASA').toUpperCase(),
        firstName: data.firstName.toUpperCase(),
        lastName: data.lastName.toUpperCase(),
        phone: data.phone,
        street: data.street.toUpperCase(),
        neighborhood: data.neighborhood.toUpperCase(),
        city: data.city.toUpperCase(),
        state: data.state.toUpperCase(),
        postalCode: data.postalCode || null,
        notes: data.notes || null,
        isDefault: Boolean(data.isDefault),
      },
    });

    return ok({ address, message: 'DIRECCIÓN ACTUALIZADA.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const existing = await prisma.address.findUnique({ where: { id: params.id } });
    if (!existing || existing.userId !== user.id) return fail('NO ENCONTRAMOS ESTA DIRECCIÓN.', 404);

    await prisma.address.delete({ where: { id: params.id } });
    return ok({ message: 'DIRECCIÓN ELIMINADA.' });
  } catch (error) {
    return handleError(error);
  }
}
