import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { toProductDTO } from '@/lib/serializers';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const syncSchema = z.object({ productIds: z.array(z.string()).max(200) });
const toggleSchema = z.object({ productId: z.string().min(1), active: z.boolean() });

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ productIds: [], products: [], persisted: false });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: { category: true } } },
    });

    return ok({
      productIds: favorites.map((f) => f.productId),
      products: favorites.map((f) => toProductDTO(f.product)),
      persisted: true,
    });
  } catch (error) {
    return handleError(error);
  }
}

// AGREGA O QUITA UN FAVORITO
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const { productId, active } = toggleSchema.parse(await request.json());

    if (!user) return ok({ persisted: false });

    if (active) {
      await prisma.favorite.upsert({
        where: { userId_productId: { userId: user.id, productId } },
        create: { userId: user.id, productId },
        update: {},
      });
      await trackEvent({ type: 'FAVORITO', userId: user.id, productId });
    } else {
      await prisma.favorite.deleteMany({ where: { userId: user.id, productId } });
    }

    return ok({ persisted: true, active });
  } catch (error) {
    return handleError(error);
  }
}

// SINCRONIZA LOS FAVORITOS LOCALES CON LA CUENTA AL INICIAR SESIÓN
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ persisted: false, productIds: [] });

    const { productIds } = syncSchema.parse(await request.json());

    if (productIds.length) {
      const valid = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      for (const p of valid) {
        await prisma.favorite.upsert({
          where: { userId_productId: { userId: user.id, productId: p.id } },
          create: { userId: user.id, productId: p.id },
          update: {},
        });
      }
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });

    return ok({ persisted: true, productIds: favorites.map((f) => f.productId) });
  } catch (error) {
    return handleError(error);
  }
}
