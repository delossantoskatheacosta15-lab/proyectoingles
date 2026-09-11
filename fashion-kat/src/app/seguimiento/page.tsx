import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TrackingView } from '@/components/orders/TrackingView';
import { LoadingBlock } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'SEGUIMIENTO DE PEDIDO',
  description: 'CONSULTA EL ESTADO DE TU PEDIDO EN FASHION KAT CON TU NÚMERO DE PEDIDO.',
  alternates: { canonical: '/seguimiento' },
};

export default function SeguimientoPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <TrackingView />
    </Suspense>
  );
}
