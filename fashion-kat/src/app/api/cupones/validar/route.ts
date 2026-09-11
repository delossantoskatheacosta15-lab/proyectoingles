import { z } from 'zod';
import { ok, fail, handleError, assertRate } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { resolveCart } from '@/lib/cart';
import { evaluateCoupon } from '@/lib/coupons';
import { cartItemSchema } from '@/lib/validation';

const schema = z.object({
  codigo: z.string().trim().min(1, 'INGRESA UN CÓDIGO DE CUPÓN.').max(40),
  items: z.array(cartItemSchema).min(1, 'TU CARRITO ESTÁ VACÍO.'),
});

export async function POST(request: Request) {
  try {
    assertRate(request, 'cupon', 20, 60_000);
    const user = await getCurrentUser();
    const body = schema.parse(await request.json());

    const cart = await resolveCart(body.items, { userId: user?.id ?? null });
    const result = await evaluateCoupon(
      body.codigo,
      cart.totals.subtotal,
      cart.lines.map((l) => ({ categoryId: l.categoryId, subtotal: l.subtotal })),
      user?.id ?? null
    );

    if (!result.valid) return fail(result.message, 400);

    return ok({
      code: result.code,
      discount: result.discount,
      description: result.description,
      message: '¡CUPÓN APLICADO CORRECTAMENTE!',
    });
  } catch (error) {
    return handleError(error);
  }
}
