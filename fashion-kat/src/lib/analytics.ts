import { prisma } from '@/lib/prisma';

export type AnalyticsType =
  | 'VISTA_PRODUCTO'
  | 'AGREGADO_CARRITO'
  | 'FAVORITO'
  | 'COMPRA'
  | 'BUSQUEDA'
  | 'VISITA_CATEGORIA';

export const ANALYTICS_LABELS: Record<AnalyticsType, string> = {
  VISTA_PRODUCTO: 'PRODUCTOS VISTOS',
  AGREGADO_CARRITO: 'AGREGADOS AL CARRITO',
  FAVORITO: 'MARCADOS COMO FAVORITOS',
  COMPRA: 'COMPRAS',
  BUSQUEDA: 'BÚSQUEDAS',
  VISITA_CATEGORIA: 'CATEGORÍAS VISITADAS',
};

export async function trackEvent(input: {
  type: AnalyticsType;
  userId?: string | null;
  sessionId?: string | null;
  productId?: string | null;
  categoryId?: string | null;
  query?: string | null;
  value?: number;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
        productId: input.productId ?? null,
        categoryId: input.categoryId ?? null,
        query: input.query ?? null,
        value: input.value ?? 0,
      },
    });
  } catch {
    // LAS ANALÍTICAS NUNCA DEBEN ROMPER UNA PETICIÓN DEL USUARIO
  }
}

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

export const MONTH_LABELS = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

export function dayLabel(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTH_LABELS[date.getMonth()]}`;
}
