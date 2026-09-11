import { prisma } from '@/lib/prisma';
import { ok, handleError, rateLimit, clientKey } from '@/lib/api';
import { getSession } from '@/lib/session';
import { analyticsEventSchema } from '@/lib/validation';
import { trackEvent } from '@/lib/analytics';

// REGISTRO DE EVENTOS DE NAVEGACIÓN — NUNCA DEBE BLOQUEAR AL USUARIO
export async function POST(request: Request) {
  try {
    if (!rateLimit(clientKey(request, 'analitica'), 120, 60_000)) {
      return ok({ tracked: false });
    }

    const data = analyticsEventSchema.parse(await request.json());
    const session = await getSession();

    await trackEvent({
      type: data.type,
      userId: session?.sub ?? null,
      sessionId: data.sessionId ?? null,
      productId: data.productId ?? null,
      categoryId: data.categoryId ?? null,
      query: data.query ?? null,
      value: data.value ?? 0,
    });

    // CONTADOR RÁPIDO DE VISTAS EN EL PRODUCTO
    if (data.type === 'VISTA_PRODUCTO' && data.productId) {
      await prisma.product
        .update({ where: { id: data.productId }, data: { viewCount: { increment: 1 } } })
        .catch(() => undefined);
    }

    return ok({ tracked: true });
  } catch (error) {
    return handleError(error);
  }
}
