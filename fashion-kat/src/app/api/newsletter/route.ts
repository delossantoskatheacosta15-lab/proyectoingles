import { prisma } from '@/lib/prisma';
import { ok, handleError, assertRate } from '@/lib/api';
import { newsletterSchema } from '@/lib/validation';
import { getSetting } from '@/lib/settings';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    assertRate(request, 'newsletter', 8, 60_000);
    const data = newsletterSchema.parse(await request.json());
    const coupon = await getSetting('popup_coupon', 'BIENVENIDA10');

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: data.email } });
    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: { email: data.email, source: data.source || 'POPUP', couponCode: coupon },
      });

      await sendEmail({
        to: data.email,
        subject: 'TU CUPÓN DE BIENVENIDA · FASHION KAT',
        template: 'CUPON_BIENVENIDA',
        heading: 'TU CUPÓN ESTÁ LISTO',
        intro: 'USA ESTE CÓDIGO EN TU PRIMERA COMPRA Y DISFRUTA TU DESCUENTO.',
        rows: [{ label: 'CÓDIGO', value: coupon }],
        ctaText: 'COMPRAR AHORA',
        ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/productos`,
      });
    }

    return ok({ coupon, message: `¡LISTO! TU CUPÓN ES ${coupon}.` });
  } catch (error) {
    return handleError(error);
  }
}
