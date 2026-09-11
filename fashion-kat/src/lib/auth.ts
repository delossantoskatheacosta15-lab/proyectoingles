import bcrypt from 'bcryptjs';

// ==========================================================
// UTILIDADES DE AUTENTICACIÓN QUE REQUIEREN NODE (bcryptjs).
// LAS FUNCIONES DE SESIÓN VIVEN EN @/lib/jwt PORQUE TAMBIÉN
// SE USAN EN EL MIDDLEWARE (EDGE RUNTIME).
// ==========================================================

export {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createToken,
  readToken,
  type SessionPayload,
} from '@/lib/jwt';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// TOKEN ALEATORIO PARA RECUPERACIÓN DE CONTRASEÑA
export function randomToken(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// VALIDACIÓN DE FORTALEZA DE CONTRASEÑA
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push('DEBE TENER AL MENOS 8 CARACTERES.');
  if (!/[A-Za-z]/.test(password)) issues.push('DEBE INCLUIR AL MENOS UNA LETRA.');
  if (!/[0-9]/.test(password)) issues.push('DEBE INCLUIR AL MENOS UN NÚMERO.');
  return issues;
}
