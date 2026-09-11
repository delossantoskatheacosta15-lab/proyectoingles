import { SignJWT, jwtVerify } from 'jose';

// ==========================================================
// SESIONES FIRMADAS (JWT EN COOKIE httpOnly)
// ESTE ARCHIVO SOLO DEPENDE DE "jose", QUE FUNCIONA EN EL EDGE RUNTIME.
// POR ESO EL MIDDLEWARE IMPORTA DESDE AQUÍ Y NO DESDE @/lib/auth
// (QUE USA bcryptjs Y SOLO PUEDE EJECUTARSE EN NODE).
// ==========================================================

const SECRET = process.env.AUTH_SECRET || 'fashion-kat-clave-de-desarrollo-cambiala-en-produccion';
const encoded = new TextEncoder().encode(SECRET);

export const SESSION_COOKIE = 'fk_sesion';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 DÍAS

export type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  name: string;
};

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('fashion-kat')
    .setSubject(payload.sub)
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(encoded);
}

export async function readToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encoded, { issuer: 'fashion-kat' });
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ''),
      role: String(payload.role ?? 'CLIENTE'),
      name: String(payload.name ?? ''),
    };
  } catch {
    return null;
  }
}
