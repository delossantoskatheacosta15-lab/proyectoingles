import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { shippingRateSchema } from '@/lib/validation';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('envios');
    const [rates, settings] = await Promise.all([
      prisma.shippingRate.findMany({ orderBy: [{ state: 'asc' }, { city: 'asc' }] }),
      getSettings(),
    ]);

    return ok({
      rates,
      defaultCost: Number(settings.shipping_default_cost ?? 15000),
      freeThreshold: Number(settings.shipping_free_threshold ?? 200000),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin('envios');
    const data = shippingRateSchema.parse(await request.json());

    const rate = await prisma.shippingRate.create({
      data: {
        state: data.state.toUpperCase(),
        city: data.city ? data.city.toUpperCase() : null,
        cost: data.cost,
        etaDays: (data.etaDays || '2 A 5 DÍAS HÁBILES').toUpperCase(),
        active: data.active ?? true,
      },
    });

    return ok({ rate, message: 'TARIFA DE ENVÍO CREADA.' });
  } catch (error) {
    return handleError(error);
  }
}
