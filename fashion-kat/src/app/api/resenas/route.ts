import { prisma } from '@/lib/prisma';
import { ok, fail, handleError, assertRate, sanitize } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { reviewSchema } from '@/lib/validation';
import { notifyAdmin } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('producto');
    if (!productId) return fail('FALTA EL PRODUCTO.', 400);

    const reviews = await prisma.review.findMany({
      where: { productId, status: 'APROBADA' },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
    });

    return ok({ reviews });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRate(request, 'resena', 10, 60_000);
    const user = await requireUser();
    const data = reviewSchema.parse(await request.json());

    // SOLO SE PUEDE RESEÑAR UN PRODUCTO COMPRADO Y ENTREGADO
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: data.orderId,
        productId: data.productId,
        order: { userId: user.id, status: 'ENTREGADO' },
      },
    });
    if (!orderItem) {
      return fail('SOLO PUEDES RESEÑAR PRODUCTOS QUE HAYAS RECIBIDO.', 403);
    }

    // EVITA RESEÑAS DUPLICADAS PARA EL MISMO PEDIDO
    const existing = await prisma.review.findFirst({
      where: { productId: data.productId, userId: user.id, orderId: data.orderId },
    });
    if (existing) {
      return fail('YA DEJASTE UNA RESEÑA PARA ESTE PRODUCTO EN ESTE PEDIDO.', 409);
    }

    await prisma.review.create({
      data: {
        productId: data.productId,
        userId: user.id,
        orderId: data.orderId,
        authorName: `${user.firstName} ${user.lastName.charAt(0)}.`,
        rating: data.rating,
        comment: sanitize(data.comment),
        status: 'PENDIENTE',
      },
    });

    await notifyAdmin(
      'NUEVA_RESENA',
      'NUEVA RESEÑA',
      'UNA CLIENTA DEJÓ UNA RESEÑA PENDIENTE DE APROBACIÓN.',
      '/admin/resenas'
    );

    return ok({
      message: '¡GRACIAS POR TU RESEÑA! LA PUBLICAREMOS DESPUÉS DE REVISARLA.',
    });
  } catch (error) {
    return handleError(error);
  }
}
