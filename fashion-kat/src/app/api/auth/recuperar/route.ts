import { prisma } from '@/lib/prisma';
import { ok, handleError, assertRate } from '@/lib/api';
import { forgotSchema } from '@/lib/validation';
import { randomToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    assertRate(request, 'recuperar', 6, 60_000);
    const body = await request.json();
    const { email } = forgotSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // RESPUESTA IDÉNTICA EXISTA O NO LA CUENTA — EVITA ENUMERAR CORREOS
    if (user) {
      const token = randomToken(32);
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 HORA
        },
      });

      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/restablecer?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: 'RECUPERA TU CONTRASEÑA · FASHION KAT',
        template: 'RECUPERAR_PASSWORD',
        heading: 'RECUPERA TU CONTRASEÑA',
        intro:
          'RECIBIMOS UNA SOLICITUD PARA RESTABLECER TU CONTRASEÑA. EL ENLACE ES VÁLIDO POR UNA HORA. SI NO FUISTE TÚ, IGNORA ESTE CORREO.',
        ctaText: 'CREAR NUEVA CONTRASEÑA',
        ctaUrl: url,
        footnote: `SI EL BOTÓN NO FUNCIONA, COPIA ESTE ENLACE: ${url}`,
      });

      // EN DESARROLLO EL ENLACE TAMBIÉN APARECE EN LA CONSOLA DEL SERVIDOR
      if (process.env.NODE_ENV !== 'production') {
        console.info('[FASHION KAT] ENLACE DE RECUPERACIÓN:', url);
      }
    }

    return ok({
      message: 'SI EL CORREO ESTÁ REGISTRADO, TE ENVIAMOS UN ENLACE PARA RESTABLECER TU CONTRASEÑA.',
    });
  } catch (error) {
    return handleError(error);
  }
}
