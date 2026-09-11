import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api';
import { resolveCart } from '@/lib/cart';
import { evaluateCoupon } from '@/lib/coupons';
import { orderNumberFromSeq, formatCOP } from '@/lib/utils';
import {
  notifyAdmin,
  notifyCustomer,
  ORDER_NOTIFICATIONS,
  checkStockAlerts,
} from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { trackEvent } from '@/lib/analytics';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import type { CartLine } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export type CheckoutInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode?: string;
  notes?: string;
  paymentMethod: 'CONTRA_ENTREGA' | 'PAGO_ONLINE' | 'TRANSFERENCIA';
  couponCode?: string;
  items: CartLine[];
};

async function nextOrderNumber(): Promise<string> {
  const last = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });
  const lastSeq = last ? Number(last.orderNumber.replace('FK-', '')) : 0;
  const count = await prisma.order.count();
  const seq = Math.max(Number.isFinite(lastSeq) ? lastSeq : 0, count) + 1;
  return orderNumberFromSeq(seq);
}

export async function createOrder(input: CheckoutInput, userId: string | null) {
  // 1. RESOLVER EL CARRITO CON PRECIOS REALES
  const cart = await resolveCart(input.items, {
    userId,
    state: input.state,
    city: input.city,
  });

  if (cart.lines.length === 0) {
    throw new ApiError('TU CARRITO ESTÁ VACÍO.', 400);
  }

  const unavailable = cart.lines.filter((l) => !l.available);
  if (unavailable.length > 0) {
    throw new ApiError(
      `ESTOS PRODUCTOS YA NO ESTÁN DISPONIBLES: ${unavailable.map((l) => l.name).join(', ')}.`,
      409
    );
  }

  const insufficient = cart.lines.filter((l) => l.quantity > l.availableStock);
  if (insufficient.length > 0) {
    throw new ApiError(
      `NO HAY SUFICIENTES EXISTENCIAS DE: ${insufficient.map((l) => l.name).join(', ')}.`,
      409
    );
  }

  // 2. CUPÓN
  let discount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;

  if (input.couponCode) {
    const result = await evaluateCoupon(
      input.couponCode,
      cart.totals.subtotal,
      cart.lines.map((l) => ({ categoryId: l.categoryId, subtotal: l.subtotal })),
      userId
    );
    if (result.valid) {
      discount = result.discount;
      couponId = result.couponId;
      couponCode = result.code;
    }
  }

  const subtotal = cart.totals.subtotal;
  const shippingCost = cart.totals.shipping;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const orderNumber = await nextOrderNumber();

  // 3. CREAR EL PEDIDO Y DESCONTAR INVENTARIO EN UNA TRANSACCIÓN
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail: userId ? null : input.email,
        firstName: input.firstName.toUpperCase(),
        lastName: input.lastName.toUpperCase(),
        email: input.email,
        phone: input.phone,
        street: input.street.toUpperCase(),
        neighborhood: input.neighborhood.toUpperCase(),
        city: input.city.toUpperCase(),
        state: input.state.toUpperCase(),
        postalCode: input.postalCode || null,
        notes: input.notes ? input.notes.toUpperCase() : null,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'PENDIENTE',
        status: 'PENDIENTE',
        subtotal,
        shippingCost,
        discount,
        total,
        couponCode,
        items: {
          create: cart.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            productName: l.name,
            productSku: l.sku,
            productImage: l.image,
            size: l.size,
            color: l.color,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            subtotal: l.subtotal,
          })),
        },
        statusHistory: {
          create: {
            toStatus: 'PENDIENTE',
            note: 'PEDIDO CREADO POR EL CLIENTE.',
          },
        },
      },
      include: { items: true },
    });

    // DESCUENTO DE INVENTARIO
    for (const line of cart.lines) {
      if (line.variantId) {
        await tx.productVariant.update({
          where: { id: line.variantId },
          data: { stock: { decrement: line.quantity } },
        });
      }
      await tx.product.update({
        where: { id: line.productId },
        data: {
          stock: { decrement: line.quantity },
          soldCount: { increment: line.quantity },
        },
      });
    }

    // MARCAR COMO AGOTADO LO QUE LLEGÓ A CERO
    for (const line of cart.lines) {
      const product = await tx.product.findUnique({
        where: { id: line.productId },
        select: { stock: true, status: true },
      });
      if (product && product.stock <= 0 && product.status === 'ACTIVO') {
        await tx.product.update({ where: { id: line.productId }, data: { status: 'AGOTADO' } });
      }
    }

    // REGISTRO DE USO DEL CUPÓN
    if (couponId) {
      await tx.couponUse.create({
        data: { couponId, userId, orderId: created.id, amount: discount },
      });
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    // VACIAR EL CARRITO PERSISTIDO DEL USUARIO
    if (userId) {
      const cartRow = await tx.cart.findUnique({ where: { userId } });
      if (cartRow) {
        await tx.cartItem.deleteMany({ where: { cartId: cartRow.id, savedForLater: false } });
      }
    }

    return created;
  });

  // 4. NOTIFICACIONES, CORREOS Y ALERTAS (FUERA DE LA TRANSACCIÓN)
  await notifyAdmin(
    'NUEVO_PEDIDO',
    'NUEVO PEDIDO',
    `PEDIDO ${orderNumber} POR ${formatCOP(total)} DE ${input.firstName.toUpperCase()} ${input.lastName.toUpperCase()}.`,
    `/admin/pedidos/${order.id}`
  );

  await notifyCustomer(
    userId,
    'PEDIDO_RECIBIDO',
    ORDER_NOTIFICATIONS.PENDIENTE.title,
    `${ORDER_NOTIFICATIONS.PENDIENTE.body} NÚMERO: ${orderNumber}.`,
    `/mis-pedidos`
  );

  await sendEmail({
    to: input.email,
    subject: `PEDIDO ${orderNumber} CONFIRMADO · FASHION KAT`,
    template: 'PEDIDO_CONFIRMADO',
    heading: '¡GRACIAS POR TU COMPRA! 💗',
    intro: `HEMOS RECIBIDO TU PEDIDO ${orderNumber}. TE AVISAREMOS CUANDO CAMBIE DE ESTADO.`,
    rows: [
      { label: 'NÚMERO DE PEDIDO', value: orderNumber },
      { label: 'SUBTOTAL', value: formatCOP(subtotal) },
      { label: 'DESCUENTO', value: discount ? `- ${formatCOP(discount)}` : formatCOP(0) },
      { label: 'ENVÍO', value: shippingCost === 0 ? 'GRATIS' : formatCOP(shippingCost) },
      { label: 'TOTAL', value: formatCOP(total) },
      { label: 'MÉTODO DE PAGO', value: PAYMENT_METHOD_LABELS[input.paymentMethod] },
    ],
    ctaText: 'SEGUIR MI PEDIDO',
    ctaUrl: `${SITE_URL}/seguimiento?numero=${orderNumber}`,
  });

  for (const line of cart.lines) {
    await checkStockAlerts(line.productId);
    await trackEvent({ type: 'COMPRA', userId, productId: line.productId, value: line.subtotal });
  }

  return order;
}

// CAMBIO DE ESTADO CON HISTORIAL, NOTIFICACIÓN Y CORREO
export async function changeOrderStatus(
  orderId: string,
  toStatus: string,
  options: { note?: string; changedById?: string; trackingCode?: string; carrier?: string } = {}
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError('NO ENCONTRAMOS ESTE PEDIDO.', 404);

  if (order.status === toStatus) {
    throw new ApiError('EL PEDIDO YA SE ENCUENTRA EN ESE ESTADO.', 400);
  }

  const allowed = ORDER_STATUS_FLOW[order.status] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new ApiError(
      `NO SE PUEDE PASAR DE ${ORDER_STATUS_LABELS[order.status]} A ${ORDER_STATUS_LABELS[toStatus]}.`,
      400
    );
  }

  // AL CANCELAR SE DEVUELVE EL INVENTARIO
  if (toStatus === 'CANCELADO') {
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        });
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, status: true },
        });
        if (product && product.stock > 0 && product.status === 'AGOTADO') {
          await prisma.product.update({ where: { id: item.productId }, data: { status: 'ACTIVO' } });
        }
      }
    }
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: toStatus,
      trackingCode: options.trackingCode ?? order.trackingCode,
      carrier: options.carrier ?? order.carrier,
      paymentStatus:
        toStatus === 'ENTREGADO' && order.paymentMethod === 'CONTRA_ENTREGA'
          ? 'PAGADO'
          : order.paymentStatus,
    },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      fromStatus: order.status,
      toStatus,
      note: options.note || 'ACTUALIZADO DESDE EL PANEL ADMINISTRATIVO.',
      changedById: options.changedById ?? null,
    },
  });

  const template = ORDER_NOTIFICATIONS[toStatus];
  if (template) {
    await notifyCustomer(
      order.userId,
      `PEDIDO_${toStatus}`,
      template.title,
      `${template.body} PEDIDO ${order.orderNumber}.`,
      '/mis-pedidos'
    );

    await sendEmail({
      to: order.email,
      subject: `TU PEDIDO ${order.orderNumber} AHORA ESTÁ ${ORDER_STATUS_LABELS[toStatus]} · FASHION KAT`,
      template: 'PEDIDO_ACTUALIZADO',
      heading: template.title,
      intro: template.body,
      rows: [
        { label: 'NÚMERO DE PEDIDO', value: order.orderNumber },
        { label: 'ESTADO', value: ORDER_STATUS_LABELS[toStatus] },
        ...(updated.trackingCode ? [{ label: 'GUÍA', value: updated.trackingCode }] : []),
        ...(updated.carrier ? [{ label: 'TRANSPORTADORA', value: updated.carrier }] : []),
      ],
      ctaText: 'VER MI PEDIDO',
      ctaUrl: `${SITE_URL}/seguimiento?numero=${order.orderNumber}`,
    });
  }

  return updated;
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function listUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
  });
}
