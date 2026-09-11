import type { PaymentAdapter, PaymentIntentInput, PaymentIntentResult } from './index';

// ==========================================================
// WOMPI (COLOMBIA) — https://docs.wompi.co
// VARIABLES NECESARIAS:
//   NEXT_PUBLIC_WOMPI_PUBLIC_KEY
//   WOMPI_PRIVATE_KEY
//   WOMPI_INTEGRITY_SECRET
//   WOMPI_EVENTS_SECRET (PARA WEBHOOKS)
// LOS MONTOS SE ENVÍAN EN CENTAVOS.
// ==========================================================

function missingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY) missing.push('NEXT_PUBLIC_WOMPI_PUBLIC_KEY');
  if (!process.env.WOMPI_INTEGRITY_SECRET) missing.push('WOMPI_INTEGRITY_SECRET');
  return missing;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const wompiAdapter: PaymentAdapter = {
  name: 'wompi',
  missingEnv,
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    const missing = missingEnv();
    if (missing.length) {
      return { ready: false, provider: 'wompi', reason: 'CONFIGURACIÓN INCOMPLETA.', missingEnv: missing };
    }

    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY as string;
    const integrity = process.env.WOMPI_INTEGRITY_SECRET as string;
    const amountInCents = Math.round(input.amount * 100);
    const reference = input.orderNumber;

    // FIRMA DE INTEGRIDAD EXIGIDA POR WOMPI
    const signature = await sha256Hex(`${reference}${amountInCents}${input.currency}${integrity}`);

    const base =
      (process.env.WOMPI_ENV || 'sandbox') === 'production'
        ? 'https://checkout.wompi.co/p/'
        : 'https://checkout.wompi.co/p/';

    const params = new URLSearchParams({
      'public-key': publicKey,
      currency: input.currency,
      'amount-in-cents': String(amountInCents),
      reference,
      'signature:integrity': signature,
      'redirect-url': input.redirectUrl,
      'customer-data:email': input.customerEmail,
      'customer-data:full-name': input.customerName,
      'customer-data:phone-number': input.customerPhone.replace(/\D/g, ''),
    });

    return {
      ready: true,
      provider: 'wompi',
      checkoutUrl: `${base}?${params.toString()}`,
      reference,
      publicData: { publicKey },
    };
  },
  async verifyWebhook(rawBody: string, _signature: string | null) {
    // WOMPI FIRMA LOS EVENTOS CON WOMPI_EVENTS_SECRET.
    // LA VERIFICACIÓN COMPLETA SE IMPLEMENTA AL ACTIVAR LA INTEGRACIÓN REAL.
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (!secret) return false;
    try {
      const event = JSON.parse(rawBody);
      const props: string[] = event?.signature?.properties ?? [];
      const timestamp = event?.timestamp ?? '';
      const values = props
        .map((path: string) =>
          path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), event.data)
        )
        .join('');
      const expected = await sha256Hex(`${values}${timestamp}${secret}`);
      return expected === event?.signature?.checksum;
    } catch {
      return false;
    }
  },
};
