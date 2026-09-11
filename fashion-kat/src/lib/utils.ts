import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------
// FORMATO DE MONEDA COLOMBIANA — SIN DECIMALES
// ---------------------------------------------------------
export function formatCOP(value: number | null | undefined): string {
  const amount = Math.round(Number(value ?? 0));
  return '$' + amount.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

export function formatNumber(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

// ---------------------------------------------------------
// FECHAS EN ESPAÑOL Y MAYÚSCULAS
// ---------------------------------------------------------
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    .toUpperCase();
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return (
    d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  ).toUpperCase();
}

// ---------------------------------------------------------
// SLUGS SEO AMIGABLES
// ---------------------------------------------------------
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ---------------------------------------------------------
// LISTAS SERIALIZADAS (SQLITE NO TIENE ARRAYS NATIVOS)
// ---------------------------------------------------------
export function splitImages(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split('|').map((s) => s.trim()).filter(Boolean);
}

export function joinImages(list: string[]): string {
  return list.map((s) => s.trim()).filter(Boolean).join('|');
}

export function splitTags(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function joinTags(list: string[]): string {
  return list.map((s) => s.trim()).filter(Boolean).join(',');
}

// ---------------------------------------------------------
// VARIOS
// ---------------------------------------------------------
export function discountPercent(price: number, comparePrice?: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function initials(first?: string | null, last?: string | null): string {
  return `${(first ?? '').charAt(0)}${(last ?? '').charAt(0)}`.toUpperCase() || 'FK';
}

export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

export function orderNumberFromSeq(seq: number): string {
  return 'FK-' + String(seq).padStart(6, '0');
}

export function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function upper(text: string | null | undefined): string {
  return (text ?? '').toUpperCase();
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}
