import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { couponSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin('cupones');
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').trim().toUpperCase();

    const coupons = await prisma.coupon.findMany({
      where: q ? { code: { contains: q } } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { uses: true } } },
    });

    return ok({
      coupons: coupons.map((c) => ({
        ...c,
        startsAt: c.startsAt.toISOString(),
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        useCount: c._count.uses,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin('cupones');
    const data = couponSchema.parse(await request.json());

    const exists = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (exists) return fail('YA EXISTE UN CUPÓN CON ESE CÓDIGO.', 409);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description ? data.description.toUpperCase() : null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? 0,
        maxDiscount: data.maxDiscount ?? null,
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxUses: data.maxUses ?? null,
        maxUsesPerUser: data.maxUsesPerUser ?? 1,
        categories: data.categories ?? '',
        active: data.active ?? true,
      },
    });

    return ok({ coupon, message: 'CUPÓN CREADO CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
