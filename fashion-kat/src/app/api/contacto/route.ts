import { prisma } from '@/lib/prisma';
import { ok, handleError, assertRate, sanitize } from '@/lib/api';
import { contactSchema } from '@/lib/validation';
import { notifyAdmin } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    assertRate(request, 'contacto', 6, 60_000);
    const data = contactSchema.parse(await request.json());

    const message = await prisma.contactMessage.create({
      data: {
        name: sanitize(data.name).toUpperCase(),
        email: data.email,
        phone: data.phone || null,
        subject: sanitize(data.subject).toUpperCase(),
        message: sanitize(data.message),
        status: 'NUEVO',
      },
    });

    await notifyAdmin(
      'NUEVO_MENSAJE',
      'NUEVO MENSAJE',
      `${message.name} ESCRIBIÓ SOBRE: ${message.subject}.`,
      '/admin/mensajes'
    );

    await sendEmail({
      to: data.email,
      subject: 'RECIBIMOS TU MENSAJE · FASHION KAT',
      template: 'MENSAJE_CONTACTO',
      heading: 'RECIBIMOS TU MENSAJE',
      intro:
        'GRACIAS POR ESCRIBIRNOS. NUESTRO EQUIPO TE RESPONDERÁ EN UN PLAZO MÁXIMO DE 24 HORAS HÁBILES.',
      rows: [
        { label: 'ASUNTO', value: message.subject },
        { label: 'MENSAJE', value: data.message.slice(0, 160) },
      ],
    });

    return ok({ message: '¡MENSAJE ENVIADO! TE RESPONDEREMOS MUY PRONTO.' });
  } catch (error) {
    return handleError(error);
  }
}
