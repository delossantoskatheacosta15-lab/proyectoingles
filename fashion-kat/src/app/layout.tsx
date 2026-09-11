import type { Metadata, Viewport } from 'next';
import './globals.css';

import { AppProviders } from '@/components/providers/AppProviders';
import { StoreHeader, StoreFooter } from '@/components/layout/StoreChrome';
import { getCurrentUser } from '@/lib/session';
import { listCategories, listCatalogs } from '@/services/taxonomy';
import { getSettings } from '@/lib/settings';
import { BRAND } from '@/lib/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} · ${BRAND.slogan}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    'MODA FEMENINA',
    'TIENDA ONLINE COLOMBIA',
    'VESTIDOS',
    'BLUSAS',
    'CONJUNTOS',
    'ZAPATOS',
    'BOLSOS',
    'FASHION KAT',
  ],
  authors: [{ name: BRAND.name }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: SITE_URL,
    siteName: BRAND.name,
    title: `${BRAND.name} · ${BRAND.slogan}`,
    description: BRAND.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} · ${BRAND.slogan}`,
    description: BRAND.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, categories, catalogs, settings] = await Promise.all([
    getCurrentUser(),
    listCategories(true),
    listCatalogs(true),
    getSettings(),
  ]);

  const sessionUser = user
    ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      }
    : null;

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <AppProviders initialUser={sessionUser}>
          <StoreHeader categories={categories} catalogs={catalogs} />
          <main className="flex-1">{children}</main>
          <StoreFooter categories={categories} settings={settings} />
        </AppProviders>
      </body>
    </html>
  );
}
