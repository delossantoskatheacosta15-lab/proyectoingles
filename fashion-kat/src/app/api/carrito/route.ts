import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { cartSyncSchema } from '@/lib/validation';
import type { CartLine } from '@/lib/types';

export const dynamic = 'force-dynamic';

// DEVUELVE EL CARRITO GUARDADO EN BASE DE DATOS DEL USUARIO AUTENTICADO.
// LOS INVITADOS USAN LOCALSTORAGE EN EL NAVEGADOR.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ items: [] as CartLine[], persisted: false });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    const items: CartLine[] = (cart?.items ?? []).map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      savedForLater: i.savedForLater,
    }));

    return ok({ items, persisted: true });
  } catch (error) {
    return handleError(error);
  }
}

// GUARDA EL CARRITO COMPLETO DEL USUARIO AUTENTICADO
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ persisted: false });

    const { items } = cartSyncSchema.parse(await request.json());

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // VALIDA QUE LOS PRODUCTOS EXISTAN ANTES DE GUARDAR
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const existing = productIds.length
      ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true } })
      : [];
    const validIds = new Set(existing.map((p) => p.id));

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    const valid = items.filter((i) => validIds.has(i.productId));
    if (valid.length) {
      await prisma.cartItem.createMany({
        data: valid.map((i) => ({
          cartId: cart.id,
          productId: i.productId,
          variantId: i.variantId ?? null,
          quantity: i.quantity,
          savedForLater: Boolean(i.savedForLater),
        })),
      });
    }

    return ok({ persisted: true, count: valid.length });
  } catch (error) {
    return handleError(error);
  }
}
