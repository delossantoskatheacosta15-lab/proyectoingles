'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { MESSAGES } from '@/lib/constants';
import type { CartLine } from '@/lib/types';

const CART_KEY = 'fk_carrito';
const FAV_KEY = 'fk_favoritos';
const COUPON_KEY = 'fk_cupon';
const REMINDER_KEY = 'fk_recordatorio_carrito';

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ALMACENAMIENTO NO DISPONIBLE (MODO PRIVADO): SE IGNORA
  }
}

function lineId(productId: string, variantId: string | null) {
  return `${productId}::${variantId ?? 'base'}`;
}

function mergeLines(a: CartLine[], b: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  [...a, ...b].forEach((line) => {
    const key = lineId(line.productId, line.variantId ?? null);
    const existing = map.get(key);
    if (existing) {
      existing.quantity = Math.max(existing.quantity, line.quantity);
      existing.savedForLater = existing.savedForLater && Boolean(line.savedForLater);
    } else {
      map.set(key, { ...line, variantId: line.variantId ?? null });
    }
  });
  return Array.from(map.values());
}

type StoreContextValue = {
  ready: boolean;
  items: CartLine[];
  favorites: string[];
  coupon: string | null;
  itemCount: number;
  addItem: (productId: string, variantId: string | null, quantity?: number) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  toggleSavedForLater: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  setCoupon: (code: string | null) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { toast, success } = useToast();

  const [items, setItems] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [coupon, setCouponState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const syncedUserRef = useRef<string | null>(null);

  // 1. CARGA INICIAL DESDE LOCALSTORAGE (CLIENTES SIN SESIÓN)
  useEffect(() => {
    setItems(readLocal<CartLine[]>(CART_KEY, []));
    setFavorites(readLocal<string[]>(FAV_KEY, []));
    setCouponState(readLocal<string | null>(COUPON_KEY, null));
    setReady(true);
  }, []);

  // 2. SINCRONIZACIÓN CON LA BASE DE DATOS AL INICIAR SESIÓN
  useEffect(() => {
    if (!ready || loading) return;

    if (!user) {
      syncedUserRef.current = null;
      return;
    }
    if (syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;

    (async () => {
      try {
        const [cartResponse, favResponse] = await Promise.all([
          fetch('/api/carrito', { cache: 'no-store' }),
          fetch('/api/favoritos', { cache: 'no-store' }),
        ]);
        const cartJson = await cartResponse.json();
        const favJson = await favResponse.json();

        const localItems = readLocal<CartLine[]>(CART_KEY, []);
        const remoteItems: CartLine[] = cartJson?.data?.items ?? [];
        const merged = mergeLines(remoteItems, localItems);
        setItems(merged);
        writeLocal(CART_KEY, merged);

        await fetch('/api/carrito', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: merged }),
        });

        const localFavs = readLocal<string[]>(FAV_KEY, []);
        const remoteFavs: string[] = favJson?.data?.productIds ?? [];
        const mergedFavs = Array.from(new Set([...remoteFavs, ...localFavs]));

        const syncResponse = await fetch('/api/favoritos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds: mergedFavs }),
        });
        const syncJson = await syncResponse.json();
        const finalFavs: string[] = syncJson?.data?.productIds ?? mergedFavs;
        setFavorites(finalFavs);
        writeLocal(FAV_KEY, finalFavs);
      } catch {
        // SI FALLA LA SINCRONIZACIÓN, EL CARRITO LOCAL SIGUE FUNCIONANDO
      }
    })();
  }, [ready, loading, user]);

  // 3. RECORDATORIO DE CARRITO ABANDONADO
  useEffect(() => {
    if (!ready || items.length === 0) return;
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(REMINDER_KEY)) return;
      window.sessionStorage.setItem(REMINDER_KEY, '1');
      const timer = setTimeout(() => toast(MESSAGES.cartReminder, 'info'), 1600);
      return () => clearTimeout(timer);
    } catch {
      return;
    }
    // SOLO SE EJECUTA UNA VEZ AL ESTAR LISTO
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const persistCart = useCallback(
    (next: CartLine[]) => {
      setItems(next);
      writeLocal(CART_KEY, next);
      if (user) {
        void fetch('/api/carrito', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: next }),
        });
      }
    },
    [user]
  );

  const addItem = useCallback<StoreContextValue['addItem']>(
    (productId, variantId, quantity = 1) => {
      const key = lineId(productId, variantId);
      const existing = items.find((i) => lineId(i.productId, i.variantId ?? null) === key);
      const next = existing
        ? items.map((i) =>
            lineId(i.productId, i.variantId ?? null) === key
              ? { ...i, quantity: Math.min(50, i.quantity + quantity), savedForLater: false }
              : i
          )
        : [...items, { productId, variantId, quantity, savedForLater: false }];
      persistCart(next);
      success(MESSAGES.addedToCart);

      void fetch('/api/analiticas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'AGREGADO_CARRITO', productId }),
      }).catch(() => undefined);
    },
    [items, persistCart, success]
  );

  const setQuantity = useCallback<StoreContextValue['setQuantity']>(
    (productId, variantId, quantity) => {
      const key = lineId(productId, variantId);
      if (quantity <= 0) {
        persistCart(items.filter((i) => lineId(i.productId, i.variantId ?? null) !== key));
        return;
      }
      persistCart(
        items.map((i) =>
          lineId(i.productId, i.variantId ?? null) === key
            ? { ...i, quantity: Math.min(50, quantity) }
            : i
        )
      );
    },
    [items, persistCart]
  );

  const removeItem = useCallback<StoreContextValue['removeItem']>(
    (productId, variantId) => {
      const key = lineId(productId, variantId);
      persistCart(items.filter((i) => lineId(i.productId, i.variantId ?? null) !== key));
      toast('PRODUCTO ELIMINADO DEL CARRITO.', 'info');
    },
    [items, persistCart, toast]
  );

  const toggleSavedForLater = useCallback<StoreContextValue['toggleSavedForLater']>(
    (productId, variantId) => {
      const key = lineId(productId, variantId);
      persistCart(
        items.map((i) =>
          lineId(i.productId, i.variantId ?? null) === key
            ? { ...i, savedForLater: !i.savedForLater }
            : i
        )
      );
    },
    [items, persistCart]
  );

  const clearCart = useCallback(() => {
    persistCart([]);
    setCouponState(null);
    writeLocal(COUPON_KEY, null);
  }, [persistCart]);

  const toggleFavorite = useCallback<StoreContextValue['toggleFavorite']>(
    (productId) => {
      const active = !favorites.includes(productId);
      const next = active ? [...favorites, productId] : favorites.filter((id) => id !== productId);
      setFavorites(next);
      writeLocal(FAV_KEY, next);
      toast(active ? MESSAGES.addedToFavorites : MESSAGES.removedFromFavorites, 'exito');

      if (user) {
        void fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, active }),
        });
      }
    },
    [favorites, toast, user]
  );

  const setCoupon = useCallback((code: string | null) => {
    setCouponState(code);
    writeLocal(COUPON_KEY, code);
  }, []);

  const itemCount = useMemo(
    () => items.filter((i) => !i.savedForLater).reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      ready,
      items,
      favorites,
      coupon,
      itemCount,
      addItem,
      setQuantity,
      removeItem,
      toggleSavedForLater,
      clearCart,
      isFavorite: (productId: string) => favorites.includes(productId),
      toggleFavorite,
      setCoupon,
    }),
    [
      ready,
      items,
      favorites,
      coupon,
      itemCount,
      addItem,
      setQuantity,
      removeItem,
      toggleSavedForLater,
      clearCart,
      toggleFavorite,
      setCoupon,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore DEBE USARSE DENTRO DE StoreProvider');
  return context;
}
