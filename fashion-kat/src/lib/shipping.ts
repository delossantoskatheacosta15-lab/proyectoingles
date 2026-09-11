import { prisma } from '@/lib/prisma';
import { getNumericSetting } from '@/lib/settings';

export type ShippingQuote = {
  cost: number;
  freeThreshold: number;
  isFree: boolean;
  etaDays: string;
  missingForFree: number;
};

// CALCULA EL COSTO DE ENVÍO SEGÚN DEPARTAMENTO/CIUDAD Y EL UMBRAL DE ENVÍO GRATIS
export async function quoteShipping(
  subtotal: number,
  state?: string | null,
  city?: string | null
): Promise<ShippingQuote> {
  const defaultCost = await getNumericSetting('shipping_default_cost', 15000);
  const freeThreshold = await getNumericSetting('shipping_free_threshold', 200000);

  let cost = defaultCost;
  let etaDays = '2 A 5 DÍAS HÁBILES';

  if (state) {
    const normalizedState = state.trim().toUpperCase();
    const normalizedCity = (city ?? '').trim().toUpperCase();

    const rates = await prisma.shippingRate.findMany({
      where: { state: normalizedState, active: true },
    });

    const cityRate = rates.find((r) => (r.city ?? '').toUpperCase() === normalizedCity && r.city);
    const stateRate = rates.find((r) => !r.city);
    const chosen = cityRate ?? stateRate;
    if (chosen) {
      cost = chosen.cost;
      etaDays = chosen.etaDays;
    }
  }

  const isFree = freeThreshold > 0 && subtotal >= freeThreshold;
  return {
    cost: isFree ? 0 : cost,
    freeThreshold,
    isFree,
    etaDays,
    missingForFree: isFree ? 0 : Math.max(0, freeThreshold - subtotal),
  };
}
