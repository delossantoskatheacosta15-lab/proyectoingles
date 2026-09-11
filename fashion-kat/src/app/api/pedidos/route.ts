import { ok, handleError, assertRate } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { checkoutSchema } from '@/lib/validation';
import { createOrder, listUserOrders } from '@/services/orders';
import { toOrderDTO } from '@/lib/serializers';
import { createPaymentIntent, getPaymentProviderName } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ orders: [] });
    const orders = await listUserOrders(user.id);
    return ok({ orders: orders.map(toOrderDTO) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertRate(request, 'checkout', 12, 60_000);
    const user = await getCurrentUser();
    const data = checkoutSchema.parse(await request.json());

    const order = await createOrder(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        street: data.street,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode || undefined,
        notes: data.notes || undefined,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode || undefined,
        items: data.items,
      },
      user?.id ?? null
    );

    // PAGO ONLINE — SE PREPARA LA INTENCIÓN DE PAGO SI HAY PASARELA CONFIGURADA
    let payment: Record<string, unknown> | null = null;
    if (data.paymentMethod === 'PAGO_ONLINE') {
      const intent = await createPaymentIntent({
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: 'COP',
        customerEmail: order.email,
        customerName: `${order.firstName} ${order.lastName}`,
        customerPhone: order.phone,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/pedido-confirmado?numero=${order.orderNumber}`,
      });
      payment = { ...intent, provider: getPaymentProviderName() };
    }

    return ok({
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
      payment,
      message: '¡GRACIAS POR TU COMPRA! 💗',
    });
  } catch (error) {
    return handleError(error);
  }
}
