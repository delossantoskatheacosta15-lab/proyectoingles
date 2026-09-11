import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';

type Params = { params: { id: string } };

const schema = z.object({ status: z.enum(['PENDIENTE', 'APROBADA', 'OCULTA']) });

// RECALCULA LA VALORACIÓN PROMEDIO DEL PRODUCTO
async function refreshRating(productId: string) {
  const approved = await prisma.review.findMany({
    where: { productId, status: 'APROBADA' },
    select: { rating: true },
  });
  const avg = approved.length
    ? Math.round((approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10) / 10
    : 0;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: avg, reviewCount: approved.length },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('resenas');
    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return fail('NO ENCONTRAMOS ESTA RESEÑA.', 404);

    const { status } = schema.parse(await request.json());
    await prisma.review.update({ where: { id: params.id }, data: { status } });
    await refreshRating(review.productId);

    const labels: Record<string, string> = {
      APROBADA: 'RESEÑA APROBADA Y PUBLICADA.',
      OCULTA: 'RESEÑA OCULTA.',
      PENDIENTE: 'RESEÑA MARCADA COMO PENDIENTE.',
    };

    return ok({ message: labels[status] });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('resenas');
    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) return fail('NO ENCONTRAMOS ESTA RESEÑA.', 404);

    await prisma.review.delete({ where: { id: params.id } });
    await refreshRating(review.productId);

    return ok({ message: 'RESEÑA ELIMINADA.' });
  } catch (error) {
    return handleError(error);
  }
}
