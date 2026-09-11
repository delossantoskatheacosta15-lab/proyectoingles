import { NextResponse, type NextRequest } from 'next/server';
// SE IMPORTA DESDE @/lib/jwt (SOLO "jose") PARA QUE EL MIDDLEWARE
// PUEDA EJECUTARSE EN EL EDGE RUNTIME SIN ARRASTRAR bcryptjs.
import { readToken, SESSION_COOKIE } from '@/lib/jwt';

// ==========================================================
// PROTECCIÓN DE RUTAS EN EL BORDE
// /admin        → SOLO ADMIN, EDITOR U OPERADOR
// /mi-cuenta    → SOLO USUARIOS AUTENTICADOS
// /login        → REDIRIGE SI YA HAY SESIÓN
// ==========================================================

const ADMIN_ROLES = ['ADMIN', 'EDITOR', 'OPERADOR'];

const PROTECTED_CUSTOMER_PATHS = ['/mi-cuenta', '/mis-pedidos', '/mis-direcciones'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await readToken(token);

  // PANEL ADMINISTRATIVO
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirigir', pathname);
      return NextResponse.redirect(url);
    }
    if (!ADMIN_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL('/mi-cuenta?error=sin-permiso', request.url));
    }
    return NextResponse.next();
  }

  // ÁREA DEL CLIENTE
  if (PROTECTED_CUSTOMER_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirigir', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // PÁGINAS DE ACCESO — NO TIENE SENTIDO VERLAS CON SESIÓN ACTIVA
  if ((pathname === '/login' || pathname === '/registro') && session) {
    const target = ADMIN_ROLES.includes(session.role) ? '/admin' : '/mi-cuenta';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mi-cuenta/:path*',
    '/mi-cuenta',
    '/mis-pedidos/:path*',
    '/mis-pedidos',
    '/mis-direcciones',
    '/login',
    '/registro',
  ],
};
