import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { addressSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return ok({ addresses });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const data = addressSchema.parse(await request.json());

    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }

    const count = await prisma.address.count({ where: { userId: user.id } });

    const address = await prisma.address.create({
      data: {
        userId: user.id,
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
        isDefault: data.isDefault || count === 0,
      },
    });

    return ok({ address, message: 'DIRECCIÓN GUARDADA CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
