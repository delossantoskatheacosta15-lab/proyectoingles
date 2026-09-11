import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingBlock } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'INICIAR SESIÓN',
  description: 'ACCEDE A TU CUENTA DE FASHION KAT PARA VER TUS PEDIDOS Y FAVORITOS.',
  alternates: { canonical: '/login' },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <LoginForm />
    </Suspense>
  );
}
