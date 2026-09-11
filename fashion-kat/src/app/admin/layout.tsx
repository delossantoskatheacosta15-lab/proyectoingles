import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentUser } from '@/lib/session';
import { ADMIN_ROLES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'PANEL ADMINISTRATIVO',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect('/login?redirigir=/admin');
  if (!ADMIN_ROLES.includes(user.role)) redirect('/mi-cuenta?error=sin-permiso');

  return (
    <AdminShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
