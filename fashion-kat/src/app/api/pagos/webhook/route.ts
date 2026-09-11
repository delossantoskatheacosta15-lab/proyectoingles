import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { getPaymentAdapter, getPaymentProviderName } from '@/lib/payments';

// ==========================================================
// WEBHOOK DE CONFIRMACIÓN DE PAGO
// LA FIRMA SE VERIFICA CON EL SECRETO DEFINIDO EN VARIABLES DE ENTORNO.
// NUNCA SE GUARDAN DATOS DE TARJETA: SOLO LA REFERENCIA Y EL ESTADO.
// ==========================================================

export async function POST(request: Request) {
  try {
    const provider = getPaymentProviderName();
    if (provider === 'none') {
      return fail('NO HAY PASARELA DE PAGO CONFIGURADA.', 503);
    }

    const rawBody = await request.text();
    const adapter = getPaymentAdapter();
    const signature =
      request.headers.get('x-event-checksum') ?? request.headers.get('x-signature') ?? null;

    if (adapter?.verifyWebhook) {
      const valid = await adapter.verifyWebhook(rawBody, signature);
      if (!valid) return fail('FIRMA DE EVENTO NO VÁLIDA.', 401);
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(rawBody));
    }

    // LOCALIZA EL PEDIDO POR SU REFERENCIA
    const reference: string =
      payload?.data?.transaction?.reference ??
      payload?.external_reference ??
      payload?.reference_sale ??
      payload?.referenceCode ??
      '';

    const statusRaw: string = String(
      payload?.data?.transaction?.status ?? payload?.status ?? payload?.state_pol ?? ''
    ).toUpperCase();

    if (!reference) return ok({ ignored: true });

    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) return ok({ ignored: true });

    const approved = ['APPROVED', 'APROBADA', 'APPROVED_PARTIAL', '4', 'PAID'].includes(statusRaw);
    const declined = ['DECLINED', 'ERROR', 'VOIDED', '6', '5'].includes(statusRaw);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: approved ? 'PAGADO' : declined ? 'FALLIDO' : 'PENDIENTE',
        paymentProvider: provider,
        paymentRef: payload?.data?.transaction?.id ?? payload?.id ?? order.paymentRef,
      },
    });

    return ok({ processed: true });
  } catch (error) {
    return handleError(error);
  }
}
