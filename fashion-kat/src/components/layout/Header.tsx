'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SearchBar } from '@/components/layout/SearchBar';
import { useAuth } from '@/components/providers/AuthProvider';
import { useStore } from '@/components/providers/StoreProvider';
import {
  IconBag,
  IconHanger,
  IconHeart,
  IconMenu,
  IconClose,
  IconUser,
  IconChevron,
  IconLogout,
  IconGrid,
} from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import type { CategoryDTO, CatalogDTO } from '@/lib/types';

const NAV = [
  { label: 'INICIO', href: '/' },
  { label: 'CATEGORÍAS', href: '/categorias' },
  { label: 'PRODUCTOS', href: '/productos' },
  { label: 'CATÁLOGOS', href: '/catalogo' },
  { label: 'OFERTAS', href: '/ofertas' },
  { label: 'CONTACTO', href: '/contacto' },
];

export function Header({
  categories,
  catalogs,
}: {
  categories: CategoryDTO[];
  catalogs: CatalogDTO[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, favorites } = useStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMegaOpen(null);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const onLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-[90] w-full">
      {/* BARRA DE ANUNCIO */}
      <div className="bg-rose-500 py-2 text-center text-[9px] font-semibold tracking-brand text-white">
        ENVÍO GRATIS EN COMPRAS SUPERIORES A $200.000 · PAGO CONTRA ENTREGA EN TODA COLOMBIA
      </div>

      <div className="border-b border-white/10 bg-ink-950 text-white">
        <div className="container-fk">
          <div className="flex h-[70px] items-center justify-between gap-6">
            {/* IZQUIERDA — LOGO */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="ABRIR MENÚ"
                className="-ml-2 flex h-10 w-10 items-center justify-center text-white lg:hidden"
              >
                <IconMenu />
              </button>

              <Link href="/" className="flex items-center gap-2.5" aria-label="FASHION KAT INICIO">
                <span className="flex h-9 w-9 items-center justify-center border border-rose-500 text-rose-500">
                  <IconHanger className="h-5 w-5" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-[15px] font-semibold tracking-brand text-white sm:text-[17px]">
                    FASHION KAT
                  </span>
                  <span className="mt-1 hidden text-[8px] tracking-brand text-rose-400 sm:block">
                    TU ESTILO, TU ACTITUD, TU MOMENTO.
                  </span>
                </span>
              </Link>
            </div>

            {/* CENTRO — NAVEGACIÓN */}
            <nav className="hidden items-center gap-7 lg:flex">
              {NAV.map((item) => {
                const hasMega = item.href === '/categorias' || item.href === '/catalogo';
                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => hasMega && setMegaOpen(item.href)}
                    onMouseLeave={() => hasMega && setMegaOpen(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'relative py-6 text-[10px] font-semibold tracking-brand transition-colors',
                        isActive(item.href) ? 'text-rose-400' : 'text-white/85 hover:text-rose-400'
                      )}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <span className="absolute bottom-4 left-0 h-px w-full bg-rose-500" />
                      )}
                    </Link>

                    {hasMega && megaOpen === item.href && (
                      <div className="absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 border border-smoke-300 bg-white p-5 shadow-lift animate-scale-in">
                        <p className="label-xs mb-3">
                          {item.href === '/categorias' ? 'EXPLORA POR CATEGORÍA' : 'NUESTROS CATÁLOGOS'}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {(item.href === '/categorias' ? categories : catalogs).slice(0, 10).map((entry) => (
                            <Link
                              key={entry.id}
                              href={
                                item.href === '/categorias'
                                  ? `/productos?categoria=${entry.slug}`
                                  : `/catalogo/${entry.slug}`
                              }
                              className="flex items-center justify-between border-b border-smoke-200 py-2 text-[10px] font-medium tracking-wider2 text-ink-800 transition-colors hover:text-rose-500"
                            >
                              <span>{entry.name}</span>
                              <span className="text-[9px] text-smoke-500">{entry.productCount}</span>
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={item.href}
                          className="mt-4 block text-[10px] font-semibold tracking-brand text-rose-500 hover:text-rose-600"
                        >
                          VER TODO →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* DERECHA — ACCIONES */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden w-56 xl:block">
                <SearchBar />
              </div>

              <Link
                href="/favoritos"
                aria-label="FAVORITOS"
                className="relative flex h-10 w-10 items-center justify-center text-white/90 transition-colors hover:text-rose-400"
              >
                <IconHeart />
                {favorites.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link
                href="/carrito"
                aria-label="CARRITO"
                className="relative flex h-10 w-10 items-center justify-center text-white/90 transition-colors hover:text-rose-400"
              >
                <IconBag />
                {itemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 border border-white/20 px-3 py-2 text-[10px] font-semibold tracking-brand text-white transition-colors hover:border-rose-500"
                  >
                    <IconUser className="h-4 w-4" />
                    <span className="hidden max-w-[110px] truncate sm:block">{user.firstName}</span>
                    <IconChevron className="hidden h-3 w-3 rotate-90 sm:block" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-smoke-300 bg-white py-2 shadow-lift animate-scale-in">
                      <div className="border-b border-smoke-200 px-4 py-3">
                        <p className="text-[11px] font-semibold tracking-wider2 text-ink-950">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="normal-case-force mt-0.5 truncate text-[10px] text-smoke-600">
                          {user.email}
                        </p>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-semibold tracking-brand text-rose-500 hover:bg-rose-50"
                        >
                          <IconGrid className="h-4 w-4" /> PANEL ADMINISTRATIVO
                        </Link>
                      )}
                      <Link
                        href="/mi-cuenta"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-semibold tracking-brand text-ink-800 hover:bg-smoke-100"
                      >
                        <IconUser className="h-4 w-4" /> MI CUENTA
                      </Link>
                      <Link
                        href="/mis-pedidos"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-semibold tracking-brand text-ink-800 hover:bg-smoke-100"
                      >
                        <IconBag className="h-4 w-4" /> MIS PEDIDOS
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-semibold tracking-brand text-ink-800 hover:bg-smoke-100"
                      >
                        <IconHeart className="h-4 w-4" /> MIS FAVORITOS
                      </Link>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-2.5 border-t border-smoke-200 px-4 py-2.5 text-left text-[10px] font-semibold tracking-brand text-ink-800 hover:bg-smoke-100"
                      >
                        <IconLogout className="h-4 w-4" /> CERRAR SESIÓN
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-primary ml-1 hidden px-5 py-2.5 text-[10px] sm:inline-flex">
                  INICIAR SESIÓN
                </Link>
              )}

              {!user && (
                <Link
                  href="/login"
                  aria-label="INICIAR SESIÓN"
                  className="flex h-10 w-10 items-center justify-center text-white/90 sm:hidden"
                >
                  <IconUser />
                </Link>
              )}
            </div>
          </div>

          {/* BUSCADOR EN PANTALLAS MEDIANAS */}
          <div className="pb-3 xl:hidden">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/70 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-smoke-300 bg-ink-950 px-5 py-4 text-white">
              <span className="text-[13px] font-semibold tracking-brand">FASHION KAT</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="CERRAR MENÚ">
                <IconClose />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="flex flex-col">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'border-b border-smoke-200 px-5 py-4 text-[11px] font-semibold tracking-brand',
                      isActive(item.href) ? 'text-rose-500' : 'text-ink-900'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="px-5 py-5">
                <p className="label-xs mb-3">CATEGORÍAS</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/productos?categoria=${c.slug}`}
                      className="badge bg-smoke-200 text-ink-800"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-smoke-200 px-5 py-5">
                <p className="label-xs mb-3">MI CUENTA</p>
                <div className="flex flex-col gap-2.5">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link href="/admin" className="text-[11px] font-semibold tracking-brand text-rose-500">
                          PANEL ADMINISTRATIVO
                        </Link>
                      )}
                      <Link href="/mi-cuenta" className="text-[11px] tracking-wider2 text-ink-800">
                        MI CUENTA
                      </Link>
                      <Link href="/mis-pedidos" className="text-[11px] tracking-wider2 text-ink-800">
                        MIS PEDIDOS
                      </Link>
                      <Link href="/favoritos" className="text-[11px] tracking-wider2 text-ink-800">
                        MIS FAVORITOS
                      </Link>
                      <Link href="/seguimiento" className="text-[11px] tracking-wider2 text-ink-800">
                        SEGUIMIENTO DE PEDIDO
                      </Link>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="text-left text-[11px] tracking-wider2 text-ink-800"
                      >
                        CERRAR SESIÓN
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="btn-primary w-full">
                        INICIAR SESIÓN
                      </Link>
                      <Link href="/registro" className="btn-outline w-full">
                        CREAR CUENTA
                      </Link>
                      <Link href="/seguimiento" className="mt-2 text-[11px] tracking-wider2 text-ink-800">
                        SEGUIMIENTO DE PEDIDO
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
