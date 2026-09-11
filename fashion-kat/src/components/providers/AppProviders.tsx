'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import type { SessionUser } from '@/lib/types';

export function AppProviders({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: SessionUser | null;
}) {
  return (
    <ToastProvider>
      <AuthProvider initialUser={initialUser}>
        <StoreProvider>{children}</StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
