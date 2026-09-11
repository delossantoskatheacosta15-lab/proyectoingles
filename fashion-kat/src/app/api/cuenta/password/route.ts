import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, assertRate } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { changePasswordSchema } from '@/lib/validation';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    assertRate(request, 'cambiar-password', 10, 60_000);
    const user = await requireUser();
    const data = changePasswordSchema.parse(await request.json());

    const record = await prisma.user.findUnique({ where: { id: user.id } });
    if (!record) return fail('NO ENCONTRAMOS TU CUENTA.', 404);

    const valid = await verifyPassword(data.currentPassword, record.passwordHash);
    if (!valid) return fail('LA CONTRASEÑA ACTUAL NO ES CORRECTA.', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(data.newPassword) },
    });

    return ok({ message: 'TU CONTRASEÑA FUE ACTUALIZADA CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
