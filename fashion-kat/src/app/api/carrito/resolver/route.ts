import { ok, handleError } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { resolveCart } from '@/lib/cart';
import { getCrossSellProducts } from '@/services/products';
import { cartSyncSchema } from '@/lib/validation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = cartSyncSchema.extend({
  cupon: z.string().trim().max(40).optional().nullable(),
  departamento: z.string().trim().max(80).optional().nullable(),
  ciudad: z.string().trim().max(80).optional().nullable(),
  ventaCruzada: z.boolean().optional(),
});

// ENRIQUECE EL CARRITO CON PRECIOS Y STOCK REALES DE LA BASE DE DATOS.
// NUNCA CONFIAMOS EN LOS PRECIOS QUE ENVÍA EL NAVEGADOR.
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = schema.parse(await request.json());

    const cart = await resolveCart(body.items, {
      couponCode: body.cupon ?? null,
      userId: user?.id ?? null,
      state: body.departamento ?? null,
      city: body.ciudad ?? null,
    });

    let crossSell: unknown[] = [];
    if (body.ventaCruzada && cart.lines.length > 0) {
      crossSell = await getCrossSellProducts(
        Array.from(new Set(cart.lines.map((l) => l.categoryId))),
        cart.lines.map((l) => l.productId),
        4
      );
    }

    return ok({ ...cart, crossSell });
  } catch (error) {
    return handleError(error);
  }
}
