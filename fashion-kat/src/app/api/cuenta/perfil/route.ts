import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { profileSchema } from '@/lib/validation';

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const data = profileSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName.toUpperCase(),
        lastName: data.lastName.toUpperCase(),
        phone: data.phone || null,
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });

    return ok({ user: updated, message: 'TUS DATOS FUERON ACTUALIZADOS.' });
  } catch (error) {
    return handleError(error);
  }
}
