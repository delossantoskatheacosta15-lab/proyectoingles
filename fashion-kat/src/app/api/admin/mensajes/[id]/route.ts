import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, sanitize } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { sendEmail } from '@/lib/email';

type Params = { params: { id: string } };

const schema = z.object({
  status: z.enum(['NUEVO', 'LEIDO', 'RESPONDIDO']).optional(),
  reply: z.string().trim().max(2000).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('mensajes');
    const message = await prisma.contactMessage.findUnique({ where: { id: params.id } });
    if (!message) return fail('NO ENCONTRAMOS ESTE MENSAJE.', 404);

    const data = schema.parse(await request.json());
    const reply = data.reply ? sanitize(data.reply) : undefined;

    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: reply ? 'RESPONDIDO' : data.status ?? message.status,
        reply: reply ?? message.reply,
        repliedAt: reply ? new Date() : message.repliedAt,
      },
    });

    if (reply) {
      await sendEmail({
        to: message.email,
        subject: `RESPUESTA A TU MENSAJE · FASHION KAT`,
        template: 'MENSAJE_CONTACTO',
        heading: 'TENEMOS UNA RESPUESTA PARA TI',
        intro: reply,
        rows: [{ label: 'TU ASUNTO', value: message.subject }],
      });
    }

    return ok({ message: reply ? 'RESPUESTA ENVIADA.' : 'MENSAJE ACTUALIZADO.', contact: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('mensajes');
    await prisma.contactMessage.delete({ where: { id: params.id } });
    return ok({ message: 'MENSAJE ELIMINADO.' });
  } catch (error) {
    return handleError(error);
  }
}
