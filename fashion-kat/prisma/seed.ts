/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  CATEGORIES,
  PRODUCTS,
  CATALOGS,
  BANNERS,
  REVIEW_COMMENTS,
  CUSTOMERS,
  COUPONS,
  CONTACT_MESSAGES,
  type SeedProduct,
} from './seed-data';

const prisma = new PrismaClient();

// ---------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------
const COLOR_HEX: Record<string, string> = {
  NEGRO: '#0A0A0A',
  ROSA: '#F0508C',
  BLANCO: '#FFFFFF',
  GRIS: '#9CA3AF',
  BEIGE: '#D8C3A5',
  VINOTINTO: '#7A1F3D',
  AZUL: '#1E3A8A',
  VERDE: '#14532D',
};

const SIZES_BY_KIND: Record<string, string[]> = {
  ROPA: ['XS', 'S', 'M', 'L', 'XL'],
  CALZADO: ['35', '36', '37', '38', '39', '40'],
  UNICA: ['ÚNICA'],
};

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GENERADOR PSEUDOALEATORIO DETERMINISTA — LA SEMILLA SIEMPRE PRODUCE LOS MISMOS DATOS
let seedState = 20260911;
function rand(): number {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(list: T[]): T {
  return list[randInt(0, list.length - 1)];
}
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(8, 20), randInt(0, 59), 0, 0);
  return d;
}

async function reset() {
  console.log('› LIMPIANDO DATOS ANTERIORES…');
  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.couponUse.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.catalogProduct.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.catalog.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.address.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('══════════════════════════════════════════');
  console.log('  FASHION KAT — DATOS DE DEMOSTRACIÓN');
  console.log('══════════════════════════════════════════');

  await reset();

  // -------------------------------------------------------
  // 1. USUARIOS
  // -------------------------------------------------------
  console.log('› CREANDO USUARIOS…');
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123*', 10);
  const clientPassword = await bcrypt.hash(process.env.SEED_CLIENT_PASSWORD || 'Cliente123*', 10);

  const admin = await prisma.user.create({
    data: {
      email: (process.env.SEED_ADMIN_EMAIL || 'admin@fashionkat.co').toLowerCase(),
      passwordHash: adminPassword,
      firstName: 'KATHERINE',
      lastName: 'ADMINISTRADORA',
      phone: '3001112233',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'editor@fashionkat.co',
      passwordHash: adminPassword,
      firstName: 'MANUELA',
      lastName: 'EDITORA',
      phone: '3001112244',
      role: 'EDITOR',
      emailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'operador@fashionkat.co',
      passwordHash: adminPassword,
      firstName: 'SEBASTIÁN',
      lastName: 'OPERADOR',
      phone: '3001112255',
      role: 'OPERADOR',
      emailVerified: true,
    },
  });

  const demoClient = await prisma.user.create({
    data: {
      email: (process.env.SEED_CLIENT_EMAIL || 'cliente@fashionkat.co').toLowerCase(),
      passwordHash: clientPassword,
      firstName: 'LUCÍA',
      lastName: 'GARCÍA',
      phone: '3009998877',
      role: 'CLIENTE',
      emailVerified: true,
      createdAt: daysAgo(120),
    },
  });

  await prisma.address.create({
    data: {
      userId: demoClient.id,
      label: 'CASA',
      firstName: 'LUCÍA',
      lastName: 'GARCÍA',
      phone: '3009998877',
      street: 'CARRERA 43A # 18-95, APTO 802',
      neighborhood: 'EL POBLADO',
      city: 'MEDELLÍN',
      state: 'ANTIOQUIA',
      postalCode: '050021',
      isDefault: true,
    },
  });

  const customers: { firstName: string; lastName: string; email: string; phone: string; city: string; state: string; id: string }[] = [];
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const c = CUSTOMERS[i];
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: clientPassword,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        role: 'CLIENTE',
        emailVerified: true,
        createdAt: daysAgo(randInt(10, 180)),
      },
    });
    await prisma.address.create({
      data: {
        userId: user.id,
        label: 'CASA',
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        street: `CALLE ${randInt(10, 90)} # ${randInt(10, 80)}-${randInt(10, 99)}`,
        neighborhood: pick(['CENTRO', 'LAURELES', 'CHAPINERO', 'GRANADA', 'SAN ALONSO', 'LA CASTELLANA']),
        city: c.city,
        state: c.state,
        isDefault: true,
      },
    });
    customers.push({ ...c, id: user.id });
  }
  console.log(`  ✓ ${customers.length + 4} USUARIOS`);

  // -------------------------------------------------------
  // 2. CATEGORÍAS
  // -------------------------------------------------------
  console.log('› CREANDO CATEGORÍAS…');
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const created = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.image,
        position: i,
        active: true,
      },
    });
    categoryMap.set(c.name, created.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} CATEGORÍAS`);

  // -------------------------------------------------------
  // 3. PRODUCTOS Y VARIANTES
  // -------------------------------------------------------
  console.log('› CREANDO PRODUCTOS Y VARIANTES…');
  const productRecords: { id: string; seed: SeedProduct; price: number; categoryId: string }[] = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) throw new Error(`CATEGORÍA NO ENCONTRADA: ${p.category}`);

    const sizes = SIZES_BY_KIND[p.sizeKind];
    const variantsData: { sku: string; size: string; color: string; colorHex: string; stock: number; priceDiff: number; active: boolean }[] = [];
    let totalStock = 0;

    for (const color of p.colors) {
      for (let s = 0; s < sizes.length; s++) {
        const size = sizes[s];
        // LAS TALLAS EXTREMAS TIENEN MENOS EXISTENCIAS, COMO EN UNA TIENDA REAL
        const factor = p.sizeKind === 'UNICA' ? 1 : s === 0 || s === sizes.length - 1 ? 0.5 : 1;
        const stock = Math.max(0, Math.round(p.stockPerVariant * factor) + randInt(-2, 2));
        totalStock += stock;
        variantsData.push({
          sku: `${p.sku}-${color.slice(0, 3)}-${size}`,
          size,
          color,
          colorHex: COLOR_HEX[color] ?? '#0A0A0A',
          stock,
          priceDiff: 0,
          active: true,
        });
      }
    }

    const discount =
      p.comparePrice && p.comparePrice > p.price
        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
        : 0;

    const created = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        discountPercent: discount,
        categoryId,
        subcategory: p.subcategory,
        brand: 'FASHION KAT',
        tags: p.tags.join(','),
        images: p.images.join('|'),
        stock: totalStock,
        minStock: 6,
        soldCount: p.sold,
        viewCount: p.sold * randInt(4, 12),
        status: totalStock > 0 ? 'ACTIVO' : 'AGOTADO',
        isFeatured: Boolean(p.featured),
        isNew: Boolean(p.isNew),
        isOnSale: Boolean(p.onSale) || discount > 0,
        rating: p.rating,
        reviewCount: 0,
        metaTitle: `${p.name} · FASHION KAT`,
        metaDescription: p.shortDescription,
        createdAt: daysAgo(randInt(1, 200)),
        variants: { create: variantsData },
      },
    });

    productRecords.push({ id: created.id, seed: p, price: p.price, categoryId });
  }

  // UN PRODUCTO AGOTADO Y UNO OCULTO PARA PROBAR TODOS LOS ESTADOS
  const agotado = productRecords[productRecords.length - 1];
  await prisma.productVariant.updateMany({ where: { productId: agotado.id }, data: { stock: 0 } });
  await prisma.product.update({
    where: { id: agotado.id },
    data: { stock: 0, status: 'AGOTADO' },
  });

  console.log(`  ✓ ${productRecords.length} PRODUCTOS`);

  // -------------------------------------------------------
  // 4. CATÁLOGOS
  // -------------------------------------------------------
  console.log('› CREANDO CATÁLOGOS…');
  for (let i = 0; i < CATALOGS.length; i++) {
    const c = CATALOGS[i];
    const matching = productRecords.filter((pr) => c.match(pr.seed)).slice(0, 20);
    await prisma.catalog.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        coverUrl: c.cover,
        position: i,
        active: true,
        products: {
          create: matching.map((m, index) => ({ productId: m.id, position: index })),
        },
      },
    });
  }
  console.log(`  ✓ ${CATALOGS.length} CATÁLOGOS`);

  // -------------------------------------------------------
  // 5. CUPONES
  // -------------------------------------------------------
  console.log('› CREANDO CUPONES…');
  for (const c of COUPONS) {
    const resolvedCategory = c.categorySlug
      ? CATEGORIES.find((cat) => cat.slug === c.categorySlug)
      : undefined;
    const categoryIds = resolvedCategory ? categoryMap.get(resolvedCategory.name) ?? '' : '';

    await prisma.coupon.create({
      data: {
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minPurchase: c.minPurchase,
        maxDiscount: c.maxDiscount ?? null,
        startsAt: daysAgo(60),
        expiresAt: c.expired ? daysAgo(5) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        maxUses: c.maxUses,
        maxUsesPerUser: c.maxUsesPerUser,
        categories: categoryIds,
        active: !c.expired,
        usedCount: c.expired ? 87 : randInt(0, 25),
      },
    });
  }
  console.log(`  ✓ ${COUPONS.length} CUPONES`);

  // -------------------------------------------------------
  // 6. PEDIDOS
  // -------------------------------------------------------
  console.log('› CREANDO PEDIDOS DE PRUEBA…');
  const statusPlan = [
    'ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'ENTREGADO',
    'EN_CAMINO', 'EN_CAMINO',
    'ENVIADO', 'ENVIADO', 'ENVIADO',
    'PREPARANDO', 'PREPARANDO',
    'CONFIRMADO', 'CONFIRMADO', 'CONFIRMADO',
    'PENDIENTE', 'PENDIENTE', 'PENDIENTE',
    'CANCELADO',
  ];
  const FLOW = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'EN_CAMINO', 'ENTREGADO'];

  const orderRecords: { id: string; userId: string; items: { productId: string }[]; status: string }[] = [];

  for (let i = 0; i < statusPlan.length; i++) {
    const status = statusPlan[i];
    const buyer = i % 4 === 0 ? { ...CUSTOMERS[0], id: demoClient.id, firstName: 'LUCÍA', lastName: 'GARCÍA', email: demoClient.email, phone: '3009998877', city: 'MEDELLÍN', state: 'ANTIOQUIA' } : customers[i % customers.length];

    const itemCount = randInt(1, 3);
    const chosen: typeof productRecords = [];
    while (chosen.length < itemCount) {
      const candidate = pick(productRecords);
      if (!chosen.find((c) => c.id === candidate.id)) chosen.push(candidate);
    }

    const items: {
      productId: string;
      variantId: string | null;
      productName: string;
      productSku: string;
      productImage: string;
      size: string | null;
      color: string | null;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }[] = [];
    let subtotal = 0;
    for (const product of chosen) {
      const variant = await prisma.productVariant.findFirst({ where: { productId: product.id } });
      const quantity = randInt(1, 2);
      const unitPrice = product.price;
      const lineSubtotal = unitPrice * quantity;
      subtotal += lineSubtotal;
      items.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.seed.name,
        productSku: product.seed.sku,
        productImage: product.seed.images[0],
        size: variant?.size ?? null,
        color: variant?.color ?? null,
        unitPrice,
        quantity,
        subtotal: lineSubtotal,
      });
    }

    const discount = i % 5 === 0 ? Math.round(subtotal * 0.1) : 0;
    const shippingCost = subtotal - discount >= 200000 ? 0 : 15000;
    const total = subtotal - discount + shippingCost;
    const createdAt = daysAgo(randInt(0, 85));
    const paymentMethod = pick(['CONTRA_ENTREGA', 'PAGO_ONLINE', 'TRANSFERENCIA']);

    const order = await prisma.order.create({
      data: {
        orderNumber: 'FK-' + String(i + 1).padStart(6, '0'),
        userId: buyer.id,
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        email: buyer.email,
        phone: buyer.phone,
        street: `CALLE ${randInt(10, 90)} # ${randInt(10, 80)}-${randInt(10, 99)}`,
        neighborhood: pick(['CENTRO', 'LAURELES', 'CHAPINERO', 'GRANADA', 'EL PRADO']),
        city: buyer.city,
        state: buyer.state,
        paymentMethod,
        paymentStatus:
          status === 'ENTREGADO' ? 'PAGADO' : status === 'CANCELADO' ? 'FALLIDO' : paymentMethod === 'CONTRA_ENTREGA' ? 'PENDIENTE' : 'PAGADO',
        status,
        subtotal,
        shippingCost,
        discount,
        total,
        couponCode: discount > 0 ? 'BIENVENIDA10' : null,
        trackingCode: ['ENVIADO', 'EN_CAMINO', 'ENTREGADO'].includes(status)
          ? `TRK${randInt(100000, 999999)}`
          : null,
        carrier: ['ENVIADO', 'EN_CAMINO', 'ENTREGADO'].includes(status) ? 'COORDINADORA' : null,
        createdAt,
        items: { create: items },
      },
      include: { items: true },
    });

    // HISTORIAL DE ESTADOS COHERENTE CON EL ESTADO ACTUAL
    const flowIndex = FLOW.indexOf(status);
    const chain = status === 'CANCELADO' ? ['PENDIENTE', 'CANCELADO'] : FLOW.slice(0, flowIndex + 1);
    for (let s = 0; s < chain.length; s++) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: s === 0 ? null : chain[s - 1],
          toStatus: chain[s],
          note: s === 0 ? 'PEDIDO CREADO POR EL CLIENTE.' : 'ACTUALIZADO DESDE EL PANEL ADMINISTRATIVO.',
          changedById: s === 0 ? null : admin.id,
          createdAt: new Date(createdAt.getTime() + s * 1000 * 60 * 60 * 12),
        },
      });
    }

    orderRecords.push({
      id: order.id,
      userId: buyer.id,
      items: order.items.map((it) => ({ productId: it.productId! })),
      status,
    });

    // ANALÍTICAS DE COMPRA
    await prisma.analyticsEvent.create({
      data: { type: 'COMPRA', userId: buyer.id, value: total, createdAt },
    });
  }
  console.log(`  ✓ ${statusPlan.length} PEDIDOS`);

  // -------------------------------------------------------
  // 7. RESEÑAS
  // -------------------------------------------------------
  console.log('› CREANDO RESEÑAS…');
  const delivered = orderRecords.filter((o) => o.status === 'ENTREGADO');
  let reviewCount = 0;
  const usedPairs = new Set<string>();

  for (const order of delivered) {
    for (const item of order.items) {
      if (!item.productId) continue;
      const pairKey = `${item.productId}:${order.userId}:${order.id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      const buyer = await prisma.user.findUnique({ where: { id: order.userId } });
      if (!buyer) continue;

      await prisma.review.create({
        data: {
          productId: item.productId,
          userId: order.userId,
          orderId: order.id,
          authorName: `${buyer.firstName} ${buyer.lastName.charAt(0)}.`,
          rating: randInt(4, 5),
          comment: pick(REVIEW_COMMENTS),
          status: 'APROBADA',
          createdAt: daysAgo(randInt(1, 40)),
        },
      });
      reviewCount++;
    }
  }

  // ALGUNAS RESEÑAS PENDIENTES DE MODERACIÓN
  for (let i = 0; i < 4; i++) {
    const product = pick(productRecords);
    const buyer = pick(customers);
    const exists = await prisma.review.findFirst({
      where: { productId: product.id, userId: buyer.id, orderId: null },
    });
    if (exists) continue;
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: buyer.id,
        authorName: `${buyer.firstName} ${buyer.lastName.charAt(0)}.`,
        rating: randInt(3, 5),
        comment: pick(REVIEW_COMMENTS),
        status: 'PENDIENTE',
        createdAt: daysAgo(randInt(1, 10)),
      },
    });
    reviewCount++;
  }

  // RECALCULAR VALORACIÓN PROMEDIO
  for (const product of productRecords) {
    const approved = await prisma.review.findMany({
      where: { productId: product.id, status: 'APROBADA' },
      select: { rating: true },
    });
    if (approved.length > 0) {
      const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
      await prisma.product.update({
        where: { id: product.id },
        data: { rating: Math.round(avg * 10) / 10, reviewCount: approved.length },
      });
    }
  }
  console.log(`  ✓ ${reviewCount} RESEÑAS`);

  // -------------------------------------------------------
  // 8. FAVORITOS Y CARRITO DE DEMOSTRACIÓN
  // -------------------------------------------------------
  console.log('› CREANDO FAVORITOS Y CARRITO…');
  const favProducts = productRecords.slice(0, 6);
  for (const p of favProducts) {
    await prisma.favorite.create({ data: { userId: demoClient.id, productId: p.id } });
  }

  const cart = await prisma.cart.create({ data: { userId: demoClient.id } });
  for (const p of productRecords.slice(2, 4)) {
    const variant = await prisma.productVariant.findFirst({
      where: { productId: p.id, stock: { gt: 0 } },
    });
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: p.id, variantId: variant?.id ?? null, quantity: 1 },
    });
  }

  // -------------------------------------------------------
  // 9. MENSAJES DE CONTACTO
  // -------------------------------------------------------
  console.log('› CREANDO MENSAJES DE CONTACTO…');
  for (const m of CONTACT_MESSAGES) {
    await prisma.contactMessage.create({
      data: {
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        message: m.message,
        status: m.status,
        reply: m.status === 'RESPONDIDO' ? 'GRACIAS POR ESCRIBIRNOS. YA TE ENVIAMOS LA INFORMACIÓN A TU CORREO.' : null,
        repliedAt: m.status === 'RESPONDIDO' ? daysAgo(randInt(1, 8)) : null,
        createdAt: daysAgo(randInt(1, 25)),
      },
    });
  }

  // -------------------------------------------------------
  // 10. BANNERS, ENVÍOS, CONFIGURACIÓN
  // -------------------------------------------------------
  console.log('› CREANDO BANNERS, TARIFAS Y CONFIGURACIÓN…');
  for (const b of BANNERS) {
    await prisma.banner.create({ data: { ...b, active: true } });
  }

  const rates: { state: string; city?: string; cost: number; eta: string }[] = [
    { state: 'ANTIOQUIA', city: 'MEDELLÍN', cost: 8000, eta: '1 A 2 DÍAS HÁBILES' },
    { state: 'ANTIOQUIA', cost: 12000, eta: '2 A 3 DÍAS HÁBILES' },
    { state: 'BOGOTÁ D.C.', cost: 10000, eta: '1 A 3 DÍAS HÁBILES' },
    { state: 'VALLE DEL CAUCA', cost: 13000, eta: '2 A 4 DÍAS HÁBILES' },
    { state: 'ATLÁNTICO', cost: 16000, eta: '3 A 5 DÍAS HÁBILES' },
    { state: 'SANTANDER', cost: 14000, eta: '2 A 4 DÍAS HÁBILES' },
    { state: 'RISARALDA', cost: 12000, eta: '2 A 4 DÍAS HÁBILES' },
    { state: 'BOLÍVAR', cost: 18000, eta: '3 A 6 DÍAS HÁBILES' },
    { state: 'MAGDALENA', cost: 18000, eta: '3 A 6 DÍAS HÁBILES' },
    { state: 'CALDAS', cost: 12000, eta: '2 A 4 DÍAS HÁBILES' },
    { state: 'NARIÑO', cost: 20000, eta: '4 A 7 DÍAS HÁBILES' },
    { state: 'CUNDINAMARCA', cost: 11000, eta: '2 A 4 DÍAS HÁBILES' },
  ];
  for (const r of rates) {
    await prisma.shippingRate.create({
      data: { state: r.state, city: r.city ?? null, cost: r.cost, etaDays: r.eta, active: true },
    });
  }

  const settings: Record<string, string> = {
    store_name: 'FASHION KAT',
    store_slogan: 'TU ESTILO, TU ACTITUD, TU MOMENTO.',
    store_email: 'HOLA@FASHIONKAT.CO',
    store_phone: '(604) 000 0000',
    store_whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    store_address: 'CALLE 10 # 40-20, EL POBLADO, MEDELLÍN, ANTIOQUIA',
    store_schedule: 'LUNES A SÁBADO DE 9:00 A.M. A 7:00 P.M.',
    social_instagram: 'https://instagram.com',
    social_facebook: 'https://facebook.com',
    social_tiktok: 'https://tiktok.com',
    shipping_default_cost: '15000',
    shipping_free_threshold: '200000',
    popup_enabled: 'true',
    popup_title: '10% DE DESCUENTO EN TU PRIMERA COMPRA.',
    popup_text: 'SUSCRÍBETE Y RECIBE TU CUPÓN AL INSTANTE.',
    popup_coupon: 'BIENVENIDA10',
    low_stock_alert: 'true',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.create({ data: { key, value } });
  }

  // -------------------------------------------------------
  // 11. NOTIFICACIONES Y ANALÍTICAS DE NAVEGACIÓN
  // -------------------------------------------------------
  console.log('› CREANDO NOTIFICACIONES Y ANALÍTICAS…');
  await prisma.notification.createMany({
    data: [
      { audience: 'ADMIN', type: 'NUEVO_PEDIDO', title: 'NUEVO PEDIDO', body: 'SE RECIBIÓ EL PEDIDO FK-000019.', link: '/admin/pedidos', read: false },
      { audience: 'ADMIN', type: 'STOCK_BAJO', title: 'STOCK BAJO', body: 'HAY PRODUCTOS POR DEBAJO DEL STOCK MÍNIMO.', link: '/admin/inventario', read: false },
      { audience: 'ADMIN', type: 'NUEVO_MENSAJE', title: 'NUEVO MENSAJE', body: 'TIENES MENSAJES SIN LEER EN LA BANDEJA DE CONTACTO.', link: '/admin/mensajes', read: false },
      { audience: 'ADMIN', type: 'NUEVO_CLIENTE', title: 'NUEVO CLIENTE', body: 'SE REGISTRÓ UNA NUEVA CLIENTA EN LA TIENDA.', link: '/admin/clientes', read: true },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: demoClient.id, audience: 'CLIENTE', type: 'PEDIDO_ENTREGADO', title: 'PEDIDO ENTREGADO', body: 'TU PEDIDO FK-000001 FUE ENTREGADO. ¡CUÉNTANOS QUÉ TE PARECIÓ!', link: '/mis-pedidos', read: false },
      { userId: demoClient.id, audience: 'CLIENTE', type: 'PEDIDO_ENVIADO', title: 'PEDIDO ENVIADO', body: 'TU PEDIDO FK-000009 YA ESTÁ EN CAMINO.', link: '/mis-pedidos', read: true },
    ],
  });

  const eventTypes = ['VISTA_PRODUCTO', 'AGREGADO_CARRITO', 'FAVORITO', 'VISITA_CATEGORIA'] as const;
  const analyticsRows: {
    type: string;
    productId: string | null;
    categoryId: string | null;
    userId: string | null;
    query?: string;
    createdAt: Date;
  }[] = [];
  for (let i = 0; i < 400; i++) {
    const type = pick([...eventTypes]);
    const product = pick(productRecords);
    analyticsRows.push({
      type,
      productId: type === 'VISITA_CATEGORIA' ? null : product.id,
      categoryId: type === 'VISITA_CATEGORIA' ? product.categoryId : null,
      userId: rand() > 0.6 ? pick(customers).id : null,
      createdAt: daysAgo(randInt(0, 60)),
    });
  }
  for (const q of ['VESTIDO', 'VESTIDO NEGRO', 'BLUSA', 'TENIS', 'BOLSO', 'CONJUNTO', 'FALDA', 'ROSA']) {
    for (let i = 0; i < randInt(3, 12); i++) {
      analyticsRows.push({
        type: 'BUSQUEDA' as const,
        query: q,
        productId: null,
        categoryId: null,
        userId: null,
        createdAt: daysAgo(randInt(0, 60)),
      });
    }
  }
  await prisma.analyticsEvent.createMany({ data: analyticsRows });

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: 'suscriptora1@correo.co', source: 'POPUP', couponCode: 'BIENVENIDA10' },
      { email: 'suscriptora2@correo.co', source: 'POPUP', couponCode: 'BIENVENIDA10' },
      { email: 'suscriptora3@correo.co', source: 'FOOTER', couponCode: null },
    ],
  });

  // -------------------------------------------------------
  // RESUMEN
  // -------------------------------------------------------
  const counts = {
    usuarios: await prisma.user.count(),
    productos: await prisma.product.count(),
    variantes: await prisma.productVariant.count(),
    categorias: await prisma.category.count(),
    catalogos: await prisma.catalog.count(),
    pedidos: await prisma.order.count(),
    resenas: await prisma.review.count(),
    cupones: await prisma.coupon.count(),
    mensajes: await prisma.contactMessage.count(),
  };

  console.log('══════════════════════════════════════════');
  console.log('  DATOS CREADOS CORRECTAMENTE');
  console.log('══════════════════════════════════════════');
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.toUpperCase().padEnd(12)} ${v}`));
  console.log('──────────────────────────────────────────');
  console.log('  CUENTAS DE ACCESO');
  console.log(`  ADMINISTRADOR : ${process.env.SEED_ADMIN_EMAIL || 'admin@fashionkat.co'} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123*'}`);
  console.log(`  EDITOR        : editor@fashionkat.co / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123*'}`);
  console.log(`  OPERADOR      : operador@fashionkat.co / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123*'}`);
  console.log(`  CLIENTA       : ${process.env.SEED_CLIENT_EMAIL || 'cliente@fashionkat.co'} / ${process.env.SEED_CLIENT_PASSWORD || 'Cliente123*'}`);
  console.log('══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('ERROR AL CREAR LOS DATOS DE DEMOSTRACIÓN:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
