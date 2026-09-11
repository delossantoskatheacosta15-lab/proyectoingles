import { prisma } from '@/lib/prisma';
import { startOfDay, startOfMonth, daysAgo, dayLabel, MONTH_LABELS } from '@/lib/analytics';

const NOT_CANCELLED = { status: { not: 'CANCELADO' } };

export async function getDashboardData() {
  const today = startOfDay();
  const monthStart = startOfMonth();

  const [
    todayOrders,
    monthOrders,
    allOrders,
    customerCount,
    productCount,
    outOfStock,
    lowStockProducts,
    pendingOrders,
    unreadMessages,
    pendingReviews,
  ] = await Promise.all([
    prisma.order.findMany({ where: { ...NOT_CANCELLED, createdAt: { gte: today } }, select: { total: true } }),
    prisma.order.findMany({ where: { ...NOT_CANCELLED, createdAt: { gte: monthStart } }, select: { total: true } }),
    prisma.order.findMany({ where: NOT_CANCELLED, select: { total: true } }),
    prisma.user.count({ where: { role: 'CLIENTE' } }),
    prisma.product.count({ where: { status: { not: 'BORRADOR' } } }),
    prisma.product.count({ where: { stock: { lte: 0 }, status: { not: 'BORRADOR' } } }),
    prisma.product.findMany({
      where: { stock: { gt: 0 }, status: { not: 'BORRADOR' } },
      select: { id: true, name: true, sku: true, stock: true, minStock: true, slug: true },
      orderBy: { stock: 'asc' },
      take: 40,
    }),
    prisma.order.count({ where: { status: 'PENDIENTE' } }),
    prisma.contactMessage.count({ where: { status: 'NUEVO' } }),
    prisma.review.count({ where: { status: 'PENDIENTE' } }),
  ]);

  const lowStock = lowStockProducts.filter((p) => p.stock <= p.minStock);

  const revenueToday = todayOrders.reduce((s, o) => s + o.total, 0);
  const revenueMonth = monthOrders.reduce((s, o) => s + o.total, 0);
  const revenueTotal = allOrders.reduce((s, o) => s + o.total, 0);
  const averageTicket = allOrders.length ? Math.round(revenueTotal / allOrders.length) : 0;

  // VENTAS POR DÍA — ÚLTIMOS 14 DÍAS
  const since = daysAgo(13);
  const recent = await prisma.order.findMany({
    where: { ...NOT_CANCELLED, createdAt: { gte: since } },
    select: { total: true, createdAt: true },
  });

  const dailyMap = new Map<string, { label: string; ventas: number; pedidos: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = daysAgo(i);
    dailyMap.set(d.toDateString(), { label: dayLabel(d), ventas: 0, pedidos: 0 });
  }
  recent.forEach((o) => {
    const key = startOfDay(o.createdAt).toDateString();
    const entry = dailyMap.get(key);
    if (entry) {
      entry.ventas += o.total;
      entry.pedidos += 1;
    }
  });
  const salesByDay = Array.from(dailyMap.values());

  // VENTAS POR MES — ÚLTIMOS 6 MESES
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthly = await prisma.order.findMany({
    where: { ...NOT_CANCELLED, createdAt: { gte: sixMonthsAgo } },
    select: { total: true, createdAt: true },
  });

  const monthMap = new Map<string, { label: string; ventas: number; pedidos: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap.set(key, { label: MONTH_LABELS[d.getMonth()], ventas: 0, pedidos: 0 });
  }
  monthly.forEach((o) => {
    const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
    const entry = monthMap.get(key);
    if (entry) {
      entry.ventas += o.total;
      entry.pedidos += 1;
    }
  });
  const salesByMonth = Array.from(monthMap.values());

  // PRODUCTOS MÁS VENDIDOS
  const topItems = await prisma.orderItem.groupBy({
    by: ['productName'],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 6,
  });
  const topProducts = topItems.map((t) => ({
    name: t.productName,
    unidades: t._sum.quantity ?? 0,
    ventas: t._sum.subtotal ?? 0,
  }));

  // CATEGORÍAS MÁS VENDIDAS
  const itemsWithProduct = await prisma.orderItem.findMany({
    where: { productId: { not: null } },
    select: { quantity: true, subtotal: true, product: { select: { category: { select: { name: true } } } } },
  });
  const categoryMap = new Map<string, { name: string; unidades: number; ventas: number }>();
  itemsWithProduct.forEach((i) => {
    const name = i.product?.category.name ?? 'SIN CATEGORÍA';
    const entry = categoryMap.get(name) ?? { name, unidades: 0, ventas: 0 };
    entry.unidades += i.quantity;
    entry.ventas += i.subtotal;
    categoryMap.set(name, entry);
  });
  const topCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 6);

  // ESTADOS DE PEDIDO
  const statusGroups = await prisma.order.groupBy({ by: ['status'], _count: { _all: true } });

  // ÚLTIMOS PEDIDOS
  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      orderNumber: true,
      firstName: true,
      lastName: true,
      total: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  return {
    cards: {
      revenueToday,
      revenueMonth,
      revenueTotal,
      ordersToday: todayOrders.length,
      ordersMonth: monthOrders.length,
      ordersTotal: allOrders.length,
      customerCount,
      productCount,
      outOfStock,
      lowStock: lowStock.length,
      averageTicket,
      pendingOrders,
      unreadMessages,
      pendingReviews,
    },
    salesByDay,
    salesByMonth,
    topProducts,
    topCategories,
    statusGroups: statusGroups.map((s) => ({ status: s.status, count: s._count._all })),
    lowStockProducts: lowStock.slice(0, 8),
    latestOrders: latestOrders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
  };
}

export async function getAnalyticsData() {
  const since = daysAgo(29);

  const [events, searches, topViewed] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['query'],
      _count: { _all: true },
      where: { type: 'BUSQUEDA', createdAt: { gte: since }, query: { not: null } },
      orderBy: { _count: { query: 'desc' } },
      take: 10,
    }),
    prisma.product.findMany({
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { id: true, name: true, slug: true, viewCount: true, soldCount: true, stock: true },
    }),
  ]);

  const addedToCart = await prisma.analyticsEvent.groupBy({
    by: ['productId'],
    _count: { _all: true },
    where: { type: 'AGREGADO_CARRITO', createdAt: { gte: since }, productId: { not: null } },
    orderBy: { _count: { productId: 'desc' } },
    take: 10,
  });

  const cartProductIds = addedToCart.map((a) => a.productId!).filter(Boolean);
  const cartProducts = cartProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: cartProductIds } },
        select: { id: true, name: true },
      })
    : [];

  const favorites = await prisma.favorite.groupBy({
    by: ['productId'],
    _count: { _all: true },
    orderBy: { _count: { productId: 'desc' } },
    take: 10,
  });
  const favProductIds = favorites.map((f) => f.productId);
  const favProducts = favProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: favProductIds } },
        select: { id: true, name: true },
      })
    : [];

  return {
    eventTotals: events.map((e) => ({ type: e.type, count: e._count._all })),
    topSearches: searches.map((s) => ({ query: s.query ?? '', count: s._count._all })),
    topViewed,
    topAddedToCart: addedToCart.map((a) => ({
      name: cartProducts.find((p) => p.id === a.productId)?.name ?? 'PRODUCTO ELIMINADO',
      count: a._count._all,
    })),
    topFavorites: favorites.map((f) => ({
      name: favProducts.find((p) => p.id === f.productId)?.name ?? 'PRODUCTO ELIMINADO',
      count: f._count._all,
    })),
  };
}
