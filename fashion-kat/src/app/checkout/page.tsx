import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { isOnlinePaymentReady } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CHECKOUT',
  description: 'COMPLETA TUS DATOS Y FINALIZA TU COMPRA EN FASHION KAT.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const addresses = user
    ? await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      })
    : [];

  return (
    <CheckoutView
      user={
        user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone ?? '',
            }
          : null
      }
      addresses={addresses.map((a) => ({
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
        isDefault: a.isDefault,
      }))}
      onlinePaymentReady={isOnlinePaymentReady()}
    />
  );
}
