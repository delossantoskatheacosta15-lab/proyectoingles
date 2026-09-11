import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetForm } from '@/components/auth/ResetForm';
import { LoadingBlock } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'RESTABLECER CONTRASEÑA',
  robots: { index: false, follow: false },
};

export default function RestablecerPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ResetForm />
    </Suspense>
  );
}
