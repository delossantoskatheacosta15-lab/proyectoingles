import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, assertRate } from '@/lib/api';
import { loginSchema } from '@/lib/validation';
import { verifyPassword, createToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // PROTECCIÓN CONTRA FUERZA BRUTA
    assertRate(request, 'login', 12, 60_000);

    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    // MENSAJE GENÉRICO: NO REVELAMOS SI EL CORREO EXISTE
    if (!user) return fail('CORREO O CONTRASEÑA INCORRECTOS.', 401);

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) return fail('CORREO O CONTRASEÑA INCORRECTOS.', 401);

    if (user.status === 'BLOQUEADO') {
      return fail('TU CUENTA ESTÁ BLOQUEADA. ESCRÍBENOS PARA AYUDARTE.', 403);
    }

    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    });

    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return ok({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
