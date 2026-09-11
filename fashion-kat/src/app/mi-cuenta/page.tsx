import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountNav } from '@/components/account/AccountNav';
import { ProfileForm } from '@/components/account/ProfileForm';
import { PasswordForm } from '@/components/account/PasswordForm';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { formatCOP, formatDate } from '@/lib/utils';
import { ROLE_LABELS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MI CUENTA',
  robots: { index: false, follow: false },
};

export default async function MiCuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirigir=/mi-cuenta');

  const [orders, favoriteCount, addressCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
    }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.address.count({ where: { userId: user.id } }),
  ]);

  const totalSpent = await prisma.order.aggregate({
    where: { userId: user.id, status: { not: 'CANCELADO' } },
    _sum: { total: true },
    _count: { _all: true },
  });

  return (
    <div className="container-fk py-12">
      <p className="eyebrow">TU ESPACIO EN FASHION KAT</p>
      <h1 className="heading-lg mt-3 text-ink-950">
        HOLA, {user.firstName} {user.lastName}
      </h1>
      <p className="normal-case-force mt-2 text-[11px] tracking-wider2 text-smoke-600">{user.email}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <AccountNav />
        </aside>

        <div className="flex flex-col gap-10">
          {/* RESUMEN */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="PEDIDOS" value={String(totalSpent._count._all)} />
            <Stat label="TOTAL COMPRADO" value={formatCOP(totalSpent._sum.total ?? 0)} />
            <Stat label="FAVORITOS" value={String(favoriteCount)} />
            <Stat label="DIRECCIONES" value={String(addressCount)} />
          </section>

          {/* ÚLTIMOS PEDIDOS */}
          <section className="border border-smoke-300 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold tracking-brand text-ink-950">ÚLTIMOS PEDIDOS</h2>
              <Link href="/mis-pedidos" className="text-[10px] font-semibold tracking-brand text-rose-500">
                VER TODOS →
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-[10px] tracking-wider2 text-smoke-600">
                AÚN NO HAS REALIZADO PEDIDOS.{' '}
                <Link href="/productos" className="text-rose-500 underline">
                  EMPIEZA A COMPRAR
                </Link>
                .
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-smoke-200">
                {orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider2 text-ink-950">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-[12px] font-semibold text-rose-500">
                      {formatCOP(order.total)}
                    </span>
                    <Link href={`/seguimiento?numero=${order.orderNumber}`} className="btn-ghost btn-sm">
                      SEGUIR
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* DATOS PERSONALES */}
          <section className="border border-smoke-300 bg-white p-6">
            <h2 className="mb-5 text-[12px] font-semibold tracking-brand text-ink-950">
              DATOS PERSONALES
            </h2>
            <ProfileForm
              user={{
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone ?? '',
                email: user.email,
              }}
            />
            <p className="mt-5 text-[9px] tracking-brand text-smoke-500">
              ROL DE LA CUENTA: {ROLE_LABELS[user.role] ?? user.role} · REGISTRADA EL{' '}
              {formatDate(user.createdAt)}
            </p>
          </section>

          {/* CONTRASEÑA */}
          <section className="border border-smoke-300 bg-white p-6">
            <h2 className="mb-5 text-[12px] font-semibold tracking-brand text-ink-950">
              CAMBIAR CONTRASEÑA
            </h2>
            <PasswordForm />
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-smoke-300 bg-white p-5">
      <p className="text-[9px] font-semibold tracking-brand text-smoke-500">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-wider2 text-ink-950">{value}</p>
    </div>
  );
}
