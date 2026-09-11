import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '@/lib/session';
import { MESSAGES } from '@/lib/constants';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...(extra ?? {}) }, { status });
}

// MANEJO CENTRALIZADO DE ERRORES — NUNCA EXPONE DETALLES TÉCNICOS AL CLIENTE
export function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return fail(error.message, error.status);
  }
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return fail(first?.message ?? 'REVISA LOS DATOS INGRESADOS.', 422, {
      issues: error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }
  if (error instanceof ApiError) {
    return fail(error.message, error.status);
  }
  // REGISTRO EN EL BACKEND, MENSAJE AMIGABLE AL CLIENTE
  console.error('[FASHION KAT][ERROR]', error);
  return fail(MESSAGES.genericError, 500);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ---------------------------------------------------------
// RATE LIMITING EN MEMORIA (SUFICIENTE PARA UN SOLO PROCESO).
// EN PRODUCCIÓN DISTRIBUIDA, SUSTITUIR POR REDIS O UPSTASH.
// ---------------------------------------------------------
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get('x-forwarded-for') ?? '';
  const ip = fwd.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  return `${scope}:${ip}`;
}

export function assertRate(request: Request, scope: string, limit = 30, windowMs = 60_000) {
  if (!rateLimit(clientKey(request, scope), limit, windowMs)) {
    throw new ApiError('DEMASIADAS SOLICITUDES. ESPERA UN MOMENTO E INTENTA NUEVAMENTE.', 429);
  }
}

// SANITIZACIÓN BÁSICA DE TEXTO LIBRE
export function sanitize(text: string): string {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

export function getPagination(searchParams: URLSearchParams, defaultSize = 12) {
  const page = Math.max(1, Number(searchParams.get('pagina') ?? 1) || 1);
  const size = Math.min(60, Math.max(1, Number(searchParams.get('tamano') ?? defaultSize) || defaultSize));
  return { page, size, skip: (page - 1) * size, take: size };
}
