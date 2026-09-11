import { prisma } from '@/lib/prisma';

type NotifyInput = {
  userId?: string | null;
  audience?: 'CLIENTE' | 'ADMIN';
  type: string;
  title: string;
  body: string;
  link?: string | null;
};

export async function notify(input: NotifyInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId ?? null,
      audience: input.audience ?? (input.userId ? 'CLIENTE' : 'ADMIN'),
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });
}

export async function notifyAdmin(type: string, title: string, body: string, link?: string) {
  return notify({ audience: 'ADMIN', type, title, body, link });
}

export async function notifyCustomer(
  userId: string | null | undefined,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  if (!userId) return null;
  return notify({ userId, audience: 'CLIENTE', type, title, body, link });
}

// TEXTOS DE NOTIFICACIÓN POR ESTADO DE PEDIDO
export const ORDER_NOTIFICATIONS: Record<string, { title: string; body: string }> = {
  PENDIENTE: {
    title: 'PEDIDO RECIBIDO',
    body: 'HEMOS RECIBIDO TU PEDIDO Y LO ESTAMOS REVISANDO.',
  },
  CONFIRMADO: {
    title: 'PEDIDO CONFIRMADO',
    body: 'TU PEDIDO FUE CONFIRMADO. PRONTO COMENZAREMOS A PREPARARLO.',
  },
  PREPARANDO: {
    title: 'PREPARANDO TU PEDIDO',
    body: 'ESTAMOS ALISTANDO TUS PRENDAS CON MUCHO CUIDADO.',
  },
  ENVIADO: {
    title: 'PEDIDO ENVIADO',
    body: 'TU PEDIDO YA SALIÓ DE NUESTRA BODEGA.',
  },
  EN_CAMINO: {
    title: 'PEDIDO EN CAMINO',
    body: 'TU PEDIDO ESTÁ EN CAMINO A TU DIRECCIÓN.',
  },
  ENTREGADO: {
    title: 'PEDIDO ENTREGADO',
    body: '¡TU PEDIDO FUE ENTREGADO! CUÉNTANOS QUÉ TE PARECIÓ CON UNA RESEÑA.',
  },
  CANCELADO: {
    title: 'PEDIDO CANCELADO',
    body: 'TU PEDIDO FUE CANCELADO. SI TIENES DUDAS, ESCRÍBENOS.',
  },
};

// ALERTAS DE INVENTARIO
export async function checkStockAlerts(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true, minStock: true, slug: true },
  });
  if (!product) return;

  if (product.stock <= 0) {
    await notifyAdmin(
      'PRODUCTO_AGOTADO',
      'PRODUCTO AGOTADO',
      `EL PRODUCTO "${product.name}" SE QUEDÓ SIN EXISTENCIAS.`,
      `/admin/productos`
    );
  } else if (product.stock <= product.minStock) {
    await notifyAdmin(
      'STOCK_BAJO',
      'STOCK BAJO',
      `EL PRODUCTO "${product.name}" TIENE SOLO ${product.stock} UNIDADES.`,
      `/admin/inventario`
    );
  }
}
