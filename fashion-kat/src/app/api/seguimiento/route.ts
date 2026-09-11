import { ok, fail, handleError, assertRate } from '@/lib/api';
import { getOrderByNumber } from '@/services/orders';

export const dynamic = 'force-dynamic';

// SEGUIMIENTO PÚBLICO — REQUIERE NÚMERO DE PEDIDO Y CORREO PARA PROTEGER LOS DATOS
export async function GET(request: Request) {
  try {
    assertRate(request, 'seguimiento', 30, 60_000);
    const { searchParams } = new URL(request.url);
    const numero = (searchParams.get('numero') ?? '').trim().toUpperCase();
    const correo = (searchParams.get('correo') ?? '').trim().toLowerCase();

    if (!numero) return fail('INGRESA TU NÚMERO DE PEDIDO.', 400);

    const order = await getOrderByNumber(numero);
    if (!order) return fail('NO ENCONTRAMOS UN PEDIDO CON ESE NÚMERO.', 404);

    if (correo && order.email.toLowerCase() !== correo) {
      return fail('EL CORREO NO COINCIDE CON EL PEDIDO.', 403);
    }

    return ok({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        total: order.total,
        carrier: order.carrier,
        trackingCode: order.trackingCode,
        city: order.city,
        state: order.state,
        customerName: `${order.firstName} ${order.lastName}`,
        items: order.items.map((i) => ({
          productName: i.productName,
          productImage: i.productImage,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          subtotal: i.subtotal,
        })),
        history: order.statusHistory.map((h) => ({
          toStatus: h.toStatus,
          createdAt: h.createdAt.toISOString(),
          note: h.note,
        })),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
