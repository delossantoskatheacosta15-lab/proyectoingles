import { cookies } from 'next/headers';
import { ok, handleError } from '@/lib/api';
import { SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  try {
    cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return ok({ message: 'SESIÓN CERRADA.' });
  } catch (error) {
    return handleError(error);
  }
}
