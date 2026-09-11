import type { PaymentAdapter, PaymentIntentInput, PaymentIntentResult } from './index';

// ==========================================================
// MERCADO PAGO — https://www.mercadopago.com.co/developers
// VARIABLES NECESARIAS:
//   MERCADOPAGO_ACCESS_TOKEN
//   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY (OPCIONAL, PARA EL BRICK DE PAGO)
// ==========================================================

function missingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) missing.push('MERCADOPAGO_ACCESS_TOKEN');
  return missing;
}

export const mercadoPagoAdapter: PaymentAdapter = {
  name: 'mercadopago',
  missingEnv,
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    const missing = missingEnv();
    if (missing.length) {
      return {
        ready: false,
        provider: 'mercadopago',
        reason: 'CONFIGURACIÓN INCOMPLETA.',
        missingEnv: missing,
      };
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_reference: input.orderNumber,
        items: [
          {
            title: `PEDIDO ${input.orderNumber} · FASHION KAT`,
            quantity: 1,
            unit_price: input.amount,
            currency_id: input.currency,
          },
        ],
        payer: { email: input.customerEmail, name: input.customerName },
        back_urls: {
          success: input.redirectUrl,
          failure: input.redirectUrl,
          pending: input.redirectUrl,
        },
        auto_return: 'approved',
      }),
    });

    if (!response.ok) {
      return {
        ready: false,
        provider: 'mercadopago',
        reason: 'NO FUE POSIBLE CREAR LA PREFERENCIA DE PAGO.',
        missingEnv: [],
      };
    }

    const data = (await response.json()) as { id: string; init_point: string; sandbox_init_point: string };
    return {
      ready: true,
      provider: 'mercadopago',
      checkoutUrl: data.init_point || data.sandbox_init_point,
      reference: data.id,
    };
  },
};
