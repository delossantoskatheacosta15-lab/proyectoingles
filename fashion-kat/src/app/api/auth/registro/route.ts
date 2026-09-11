import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, assertRate } from '@/lib/api';
import { registerSchema } from '@/lib/validation';
import { hashPassword, createToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { notifyAdmin } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    assertRate(request, 'registro', 10, 60_000);
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return fail('YA EXISTE UNA CUENTA CON ESTE CORREO.', 409);
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: await hashPassword(data.password),
        firstName: data.firstName.toUpperCase(),
        lastName: data.lastName.toUpperCase(),
        phone: data.phone || null,
        role: 'CLIENTE',
      },
    });

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

    await sendEmail({
      to: user.email,
      subject: 'BIENVENIDA A FASHION KAT',
      template: 'REGISTRO',
      heading: `¡HOLA, ${user.firstName}!`,
      intro:
        'TU CUENTA EN FASHION KAT YA ESTÁ LISTA. AHORA PUEDES GUARDAR FAVORITOS, SEGUIR TUS PEDIDOS Y ACCEDER A OFERTAS EXCLUSIVAS.',
      ctaText: 'IR A LA TIENDA',
      ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/productos`,
    });

    await notifyAdmin(
      'NUEVO_CLIENTE',
      'NUEVO CLIENTE',
      `${user.firstName} ${user.lastName} SE REGISTRÓ EN LA TIENDA.`,
      '/admin/clientes'
    );

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
