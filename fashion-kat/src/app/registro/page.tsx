import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoadingBlock } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'CREAR CUENTA',
  description: 'CREA TU CUENTA EN FASHION KAT Y DISFRUTA DE BENEFICIOS EXCLUSIVOS.',
  alternates: { canonical: '/registro' },
};

export default function RegistroPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <RegisterForm />
    </Suspense>
  );
}
