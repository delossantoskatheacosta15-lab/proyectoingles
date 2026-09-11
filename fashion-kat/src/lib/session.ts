import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE, readToken, type SessionPayload } from '@/lib/jwt';
import { ADMIN_ROLES, canAccess } from '@/lib/constants';

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: Date;
};

// LEE LA SESIÓN DESDE LA COOKIE FIRMADA (NO CONSULTA LA BASE DE DATOS)
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return readToken(token);
}

// DEVUELVE EL USUARIO REAL DESDE LA BASE DE DATOS
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  if (!user || user.status === 'BLOQUEADO') return null;
  return user;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError('INICIA SESIÓN PARA CONTINUAR.', 401);
  return user;
}

export async function requireAdmin(section?: string): Promise<CurrentUser> {
  const user = await requireUser();
  if (!ADMIN_ROLES.includes(user.role)) {
    throw new AuthError('NO TIENES PERMISO PARA ACCEDER AL PANEL ADMINISTRATIVO.', 403);
  }
  if (section && !canAccess(user.role, section)) {
    throw new AuthError('TU ROL NO TIENE PERMISO PARA ESTA SECCIÓN.', 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
