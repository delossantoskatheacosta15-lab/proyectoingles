'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SessionUser } from '@/lib/types';

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<SessionUser | null>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: SessionUser }>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string; user?: SessionUser }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_ROLES = ['ADMIN', 'EDITOR', 'OPERADOR'];

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/sesion', { cache: 'no-store' });
      const json = await response.json();
      const nextUser = json?.data?.user ?? null;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) void refresh();
    else setLoading(false);
  }, [initialUser, refresh]);

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await response.json();
    if (!response.ok || !json.ok) {
      return { ok: false, error: json?.error ?? 'NO FUE POSIBLE INICIAR SESIÓN.' };
    }
    setUser(json.data.user);
    return { ok: true, user: json.data.user };
  }, []);

  const register = useCallback<AuthContextValue['register']>(async (payload) => {
    const response = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!response.ok || !json.ok) {
      return { ok: false, error: json?.error ?? 'NO FUE POSIBLE CREAR TU CUENTA.' };
    }
    setUser(json.data.user);
    return { ok: true, user: json.data.user };
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refresh,
      login,
      register,
      logout,
      isAdmin: Boolean(user && ADMIN_ROLES.includes(user.role)),
    }),
    [user, loading, refresh, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth DEBE USARSE DENTRO DE AuthProvider');
  return context;
}
