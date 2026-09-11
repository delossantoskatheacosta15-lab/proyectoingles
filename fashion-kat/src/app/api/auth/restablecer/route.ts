import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, assertRate } from '@/lib/api';
import { resetSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    assertRate(request, 'restablecer', 10, 60_000);
    const body = await request.json();
    const data = resetSchema.parse(body);

    const reset = await prisma.passwordReset.findUnique({ where: { token: data.token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return fail('EL ENLACE NO ES VÁLIDO O YA EXPIRÓ. SOLICITA UNO NUEVO.', 400);
    }

    await prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(data.password) },
    });
    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

    return ok({ message: 'TU CONTRASEÑA FUE ACTUALIZADA. YA PUEDES INICIAR SESIÓN.' });
  } catch (error) {
    return handleError(error);
  }
}
