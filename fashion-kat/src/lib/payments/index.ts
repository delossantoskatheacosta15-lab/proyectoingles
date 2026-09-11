// ==========================================================
// CAPA DE PAGOS — ADAPTADORES INTERCAMBIABLES
// EL PROVEEDOR SE ELIGE CON LA VARIABLE DE ENTORNO PAYMENT_PROVIDER.
// NINGUNA CLAVE SECRETA SE EXPONE AL FRONTEND.
// NUNCA SE ALMACENAN DATOS DE TARJETAS EN LA BASE DE DATOS.
// ==========================================================

export type PaymentIntentInput = {
  orderNumber: string;
  amount: number; // EN PESOS COLOMBIANOS
  currency: 'COP';
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  redirectUrl: string;
};

export type PaymentIntentResult =
  | { ready: true; provider: string; checkoutUrl: string; reference: string; publicData?: Record<string, string> }
  | { ready: false; provider: string; reason: string; missingEnv: string[] };

export type PaymentAdapter = {
  name: string;
  missingEnv: () => string[];
  createIntent: (input: PaymentIntentInput) => Promise<PaymentIntentResult>;
  verifyWebhook?: (rawBody: string, signature: string | null) => Promise<boolean>;
};

import { wompiAdapter } from './wompi';
import { mercadoPagoAdapter } from './mercadopago';
import { payuAdapter } from './payu';

const adapters: Record<string, PaymentAdapter> = {
  wompi: wompiAdapter,
  mercadopago: mercadoPagoAdapter,
  payu: payuAdapter,
};

export function getPaymentProviderName(): string {
  return (process.env.PAYMENT_PROVIDER || 'none').toLowerCase();
}

export function getPaymentAdapter(): PaymentAdapter | null {
  const name = getPaymentProviderName();
  return adapters[name] ?? null;
}

export function isOnlinePaymentReady(): boolean {
  const adapter = getPaymentAdapter();
  return Boolean(adapter) && adapter!.missingEnv().length === 0;
}

export async function createPaymentIntent(
  input: PaymentIntentInput
): Promise<PaymentIntentResult> {
  const adapter = getPaymentAdapter();
  if (!adapter) {
    return {
      ready: false,
      provider: 'none',
      reason:
        'NO HAY PASARELA DE PAGO CONFIGURADA. DEFINE PAYMENT_PROVIDER EN EL ARCHIVO .env (wompi, mercadopago O payu).',
      missingEnv: ['PAYMENT_PROVIDER'],
    };
  }
  const missing = adapter.missingEnv();
  if (missing.length > 0) {
    return {
      ready: false,
      provider: adapter.name,
      reason: `FALTAN VARIABLES DE ENTORNO PARA ${adapter.name.toUpperCase()}.`,
      missingEnv: missing,
    };
  }
  return adapter.createIntent(input);
}

// ESTADO DE CONFIGURACIÓN — SE MUESTRA EN EL PANEL ADMINISTRATIVO
export function paymentStatusReport() {
  const name = getPaymentProviderName();
  const adapter = getPaymentAdapter();
  return {
    provider: name,
    configured: Boolean(adapter) && adapter!.missingEnv().length === 0,
    missingEnv: adapter ? adapter.missingEnv() : ['PAYMENT_PROVIDER'],
    available: Object.keys(adapters),
  };
}
