'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { canAccess, ROLE_LABELS } from '@/lib/constants';
import { cn, initials } from '@/lib/utils';
import {
  IconChart,
  IconBox,
  IconGrid,
  IconTag,
  IconBag,
  IconUsers,
  IconStar,
  IconMail,
  IconTruck,
  IconSettings,
  IconBell,
  IconMenu,
  IconClose,
  IconHanger,
  IconLogout,
} from '@/components/ui/Icons';

type NavItem = { href: string; label: string; icon: (p: { className?: string }) => JSX.Element; section: string };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'RESUMEN',
    items: [
      { href: '/admin', label: 'DASHBOARD', icon: IconChart, section: 'dashboard' },
      { href: '/admin/analiticas', label: 'ANALÍTICAS', icon: IconChart, section: 'dashboard' },
    ],
  },
  {
    group: 'CATÁLOGO',
    items: [
      { href: '/admin/productos', label: 'PRODUCTOS', icon: IconBox, section: 'productos' },
      { href: '/admin/inventario', label: 'INVENTARIO', icon: IconBox, section: 'productos' },
      { href: '/admin/categorias', label: 'CATEGORÍAS', icon: IconGrid, section: 'categorias' },
      { href: '/admin/catalogos', label: 'CATÁLOGOS', icon: IconGrid, section: 'catalogos' },
      { href: '/admin/banners', label: 'BANNERS', icon: IconGrid, section: 'productos' },
      { href: '/admin/cupones', label: 'CUPONES', icon: IconTag, section: 'cupones' },
    ],
  },
  {
    group: 'VENTAS',
    items: [
      { href: '/admin/pedidos', label: 'PEDIDOS', icon: IconBag, section: 'pedidos' },
      { href: '/admin/clientes', label: 'CLIENTES', icon: IconUsers, section: 'clientes' },
      { href: '/admin/resenas', label: 'RESEÑAS', icon: IconStar, section: 'resenas' },
      { href: '/admin/mensajes', label: 'MENSAJES', icon: IconMail, section: 'mensajes' },
    ],
  },
  {
    group: 'CONFIGURACIÓN',
    items: [
      { href: '/admin/envios', label: 'ENVÍOS', icon: IconTruck, section: 'envios' },
      { href: '/admin/configuracion', label: 'CONFIGURACIÓN', icon: IconSettings, section: 'dashboard' },
    ],
  },
];

type Notification = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function AdminShell({
  user,
  children,
}: {
  user: { firstName: string; lastName: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setPanelOpen(false);
  }, [pathname]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notificaciones?ambito=admin', { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) {
        setNotifications(json.data.notifications);
        setUnread(json.data.unread);
      }
    } catch {
      // SILENCIOSO
    }
  };

  useEffect(() => {
    void loadNotifications();
    const timer = setInterval(loadNotifications, 60_000);
    return () => clearInterval(timer);
  }, []);

  const markAll = async () => {
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todas: true, ambito: 'admin' }),
    });
    void loadNotifications();
  };

  const onLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-950 text-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="flex h-8 w-8 items-center justify-center border border-rose-500 text-rose-500">
          <IconHanger className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[12px] font-semibold tracking-brand">FASHION KAT</p>
          <p className="text-[8px] tracking-brand text-rose-400">PANEL ADMINISTRATIVO</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-5">
        {NAV.map((group) => {
          const items = group.items.filter((item) => canAccess(user.role, item.section));
          if (items.length === 0) return null;
          return (
            <div key={group.group} className="mb-6">
              <p className="px-5 pb-2 text-[8px] font-semibold tracking-brand text-white/35">
                {group.group}
              </p>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 border-l-2 px-5 py-2.5 text-[10px] font-semibold tracking-brand transition-colors',
                      isActive(item.href)
                        ? 'border-rose-500 bg-white/5 text-rose-400'
                        : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="mb-2 block px-1 text-[9px] font-semibold tracking-brand text-white/60 hover:text-rose-400"
        >
          ← VOLVER A LA TIENDA
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 px-1 text-[9px] font-semibold tracking-brand text-white/60 hover:text-rose-400"
        >
          <IconLogout className="h-3.5 w-3.5" /> CERRAR SESIÓN
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-smoke-100">
      {/* SIDEBAR ESCRITORIO */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-60">{sidebar}</div>
      </aside>

      {/* SIDEBAR MÓVIL */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 animate-slide-in-right">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* BARRA SUPERIOR */}
        <header className="sticky top-0 z-[60] flex h-16 items-center justify-between gap-4 border-b border-smoke-300 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="ABRIR MENÚ"
            className="lg:hidden"
          >
            <IconMenu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                aria-label="NOTIFICACIONES"
                className="relative flex h-9 w-9 items-center justify-center text-ink-700 transition-colors hover:text-rose-500"
              >
                <IconBell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>

              {panelOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 border border-smoke-300 bg-white shadow-lift animate-scale-in">
                  <div className="flex items-center justify-between border-b border-smoke-200 px-4 py-3">
                    <span className="text-[10px] font-semibold tracking-brand">NOTIFICACIONES</span>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={markAll}
                        className="text-[9px] tracking-brand text-rose-500 hover:text-rose-600"
                      >
                        MARCAR TODAS COMO LEÍDAS
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[10px] tracking-brand text-smoke-500">
                        NO HAY NOTIFICACIONES.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link ?? '/admin'}
                          className={cn(
                            'block border-b border-smoke-200 px-4 py-3 transition-colors hover:bg-smoke-100',
                            !n.read && 'bg-rose-50/60'
                          )}
                        >
                          <p className="text-[10px] font-semibold tracking-brand text-ink-950">
                            {n.title}
                          </p>
                          <p className="mt-1 text-[9px] leading-relaxed tracking-wider2 text-smoke-600">
                            {n.body}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 border-l border-smoke-300 pl-3">
              <span className="flex h-8 w-8 items-center justify-center bg-ink-950 text-[10px] font-semibold text-white">
                {initials(user.firstName, user.lastName)}
              </span>
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold tracking-wider2 text-ink-950">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[8px] tracking-brand text-rose-500">
                  {ROLE_LABELS[user.role] ?? user.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
