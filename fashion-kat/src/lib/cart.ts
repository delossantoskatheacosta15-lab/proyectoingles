import { prisma } from '@/lib/prisma';
import { evaluateCoupon } from '@/lib/coupons';
import { quoteShipping } from '@/lib/shipping';
import { splitImages } from '@/lib/utils';
import type { CartLine, ResolvedCart, ResolvedCartLine } from '@/lib/types';

export function lineKey(productId: string, variantId: string | null | undefined): string {
  return `${productId}::${variantId ?? 'sin-variante'}`;
}

// ENRIQUECE LAS LÍNEAS DEL CARRITO CON DATOS REALES DE LA BASE DE DATOS.
// LOS PRECIOS NUNCA SE TOMAN DEL CLIENTE.
export async function resolveCart(
  rawLines: CartLine[],
  options: {
    couponCode?: string | null;
    userId?: string | null;
    state?: string | null;
    city?: string | null;
  } = {}
): Promise<ResolvedCart> {
  const clean = (rawLines ?? []).filter((l) => l && l.productId && l.quantity > 0);
  const productIds = Array.from(new Set(clean.map((l) => l.productId)));

  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true, variants: true },
      })
    : [];

  const productMap = new Map(products.map((p) => [p.id, p] as const));

  const active: ResolvedCartLine[] = [];
  const saved: ResolvedCartLine[] = [];

  for (const line of clean) {
    const product = productMap.get(line.productId);
    if (!product) continue;

    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : null;
    const unitPrice = product.price + (variant?.priceDiff ?? 0);
    const availableStock = variant ? variant.stock : product.stock;

    const hidden = product.status === 'OCULTO' || product.status === 'BORRADOR';
    const quantity = Math.max(1, Math.min(line.quantity, 50));

    let issue: string | undefined;
    if (hidden) issue = 'ESTE PRODUCTO YA NO ESTÁ DISPONIBLE.';
    else if (availableStock <= 0) issue = 'AGOTADO';
    else if (quantity > availableStock) issue = `SOLO QUEDAN ${availableStock} UNIDADES.`;

    const usableQty = issue && availableStock > 0 ? Math.min(quantity, availableStock) : quantity;
    const effectiveQty = availableStock <= 0 || hidden ? 0 : usableQty;

    const resolved: ResolvedCartLine = {
      key: lineKey(product.id, variant?.id ?? null),
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      name: product.name,
      sku: variant?.sku ?? product.sku,
      image: splitImages(product.images)[0] ?? null,
      size: variant?.size ?? null,
      color: variant?.color ?? null,
      colorHex: variant?.colorHex ?? null,
      unitPrice,
      comparePrice: product.comparePrice,
      quantity,
      availableStock,
      subtotal: unitPrice * effectiveQty,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      savedForLater: Boolean(line.savedForLater),
      available: !hidden && availableStock > 0,
      issue,
    };

    if (resolved.savedForLater) saved.push(resolved);
    else active.push(resolved);
  }

  const subtotal = active.reduce((sum, l) => sum + l.subtotal, 0);
  const itemCount = active.reduce((sum, l) => sum + (l.available ? l.quantity : 0), 0);

  // CUPÓN
  let discount = 0;
  let couponValid = false;
  let couponMessage: string | null = null;
  let couponCode: string | null = null;

  if (options.couponCode) {
    const result = await evaluateCoupon(
      options.couponCode,
      subtotal,
      active.map((l) => ({ categoryId: l.categoryId, subtotal: l.subtotal })),
      options.userId ?? null
    );
    if (result.valid) {
      discount = result.discount;
      couponValid = true;
      couponCode = result.code;
      couponMessage = '¡CUPÓN APLICADO CORRECTAMENTE!';
    } else {
      couponMessage = result.message;
    }
  }

  // ENVÍO
  const shippingQuote = await quoteShipping(subtotal - discount, options.state, options.city);
  const shipping = subtotal > 0 ? shippingQuote.cost : 0;

  return {
    lines: active,
    savedLines: saved,
    totals: {
      subtotal,
      discount,
      shipping,
      total: Math.max(0, subtotal - discount + shipping),
      itemCount,
      freeShippingThreshold: shippingQuote.freeThreshold,
      missingForFreeShipping: shippingQuote.missingForFree,
      couponCode,
      couponMessage,
      couponValid,
    },
  };
}
