import { prisma } from '@/lib/prisma';
import { MESSAGES } from '@/lib/constants';

export type CouponResult =
  | { valid: true; couponId: string; code: string; discount: number; description: string }
  | { valid: false; message: string };

export type CouponLine = { categoryId: string; subtotal: number };

// VALIDA UN CUPÓN Y CALCULA EL DESCUENTO SOBRE LAS LÍNEAS APLICABLES
export async function evaluateCoupon(
  rawCode: string,
  subtotal: number,
  lines: CouponLine[],
  userId?: string | null
): Promise<CouponResult> {
  const code = (rawCode ?? '').trim().toUpperCase();
  if (!code) return { valid: false, message: 'INGRESA UN CÓDIGO DE CUPÓN.' };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { valid: false, message: MESSAGES.couponInvalid };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, message: 'ESTE CUPÓN AÚN NO ESTÁ DISPONIBLE.' };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, message: MESSAGES.couponInvalid };
  }
  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: 'ESTE CUPÓN YA ALCANZÓ SU LÍMITE DE USOS.' };
  }
  if (userId) {
    const used = await prisma.couponUse.count({ where: { couponId: coupon.id, userId } });
    if (used >= coupon.maxUsesPerUser) {
      return { valid: false, message: 'YA UTILIZASTE ESTE CUPÓN.' };
    }
  }
  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      message: `ESTE CUPÓN APLICA DESDE $${coupon.minPurchase.toLocaleString('es-CO')} DE COMPRA.`,
    };
  }

  // BASE APLICABLE SEGÚN CATEGORÍAS PERMITIDAS
  const allowed = (coupon.categories ?? '').split(',').map((c) => c.trim()).filter(Boolean);
  const base =
    allowed.length === 0
      ? subtotal
      : lines.filter((l) => allowed.includes(l.categoryId)).reduce((sum, l) => sum + l.subtotal, 0);

  if (base <= 0) {
    return { valid: false, message: 'ESTE CUPÓN NO APLICA A LOS PRODUCTOS DE TU CARRITO.' };
  }

  let discount =
    coupon.discountType === 'PORCENTAJE'
      ? Math.round((base * coupon.discountValue) / 100)
      : coupon.discountValue;

  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  if (discount > base) discount = base;

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
    description: coupon.description ?? '',
  };
}
