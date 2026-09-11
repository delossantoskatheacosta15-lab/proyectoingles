'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { IconUser, IconBag, IconHeart, IconPin, IconLogout, IconGrid } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/mi-cuenta', label: 'MI CUENTA', icon: IconUser },
  { href: '/mis-pedidos', label: 'MIS PEDIDOS', icon: IconBag },
  { href: '/favoritos', label: 'MIS FAVORITOS', icon: IconHeart },
  { href: '/mis-direcciones', label: 'MIS DIRECCIONES', icon: IconPin },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAdmin } = useAuth();

  const onLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="flex flex-col border border-smoke-300 bg-white">
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 border-b border-smoke-200 px-5 py-4 text-[10px] font-semibold tracking-brand text-rose-500 hover:bg-rose-50"
        >
          <IconGrid className="h-4 w-4" />
          PANEL ADMINISTRATIVO
        </Link>
      )}
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 border-b border-smoke-200 px-5 py-4 text-[10px] font-semibold tracking-brand transition-colors',
              active ? 'bg-ink-950 text-white' : 'text-ink-800 hover:bg-smoke-100'
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-3 px-5 py-4 text-left text-[10px] font-semibold tracking-brand text-ink-800 transition-colors hover:bg-smoke-100"
      >
        <IconLogout className="h-4 w-4" />
        CERRAR SESIÓN
      </button>
    </nav>
  );
}
