import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountNav } from '@/components/account/AccountNav';
import { AddressManager } from '@/components/account/AddressManager';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MIS DIRECCIONES',
  robots: { index: false, follow: false },
};

export default async function MisDireccionesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirigir=/mis-direcciones');

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="container-fk py-12">
      <p className="eyebrow">ENTREGAS MÁS RÁPIDAS</p>
      <h1 className="heading-lg mt-3 text-ink-950">MIS DIRECCIONES</h1>
      <p className="mt-2 text-[11px] tracking-brand text-smoke-600">
        GUARDA TUS DIRECCIONES PARA COMPLETAR EL CHECKOUT EN SEGUNDOS.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <AccountNav />
        </aside>
        <AddressManager
          initialAddresses={addresses.map((a) => ({
            id: a.id,
            label: a.label,
            firstName: a.firstName,
            lastName: a.lastName,
            phone: a.phone,
            street: a.street,
            neighborhood: a.neighborhood,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            notes: a.notes,
            isDefault: a.isDefault,
          }))}
        />
      </div>
    </div>
  );
}
