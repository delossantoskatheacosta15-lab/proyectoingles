'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { PromoPopup } from '@/components/layout/PromoPopup';
import type { CategoryDTO, CatalogDTO } from '@/lib/types';

// EL PANEL ADMINISTRATIVO TIENE SU PROPIA ESTRUCTURA:
// AQUÍ SE OCULTAN EL HEADER, EL FOOTER, EL BOTÓN DE WHATSAPP Y EL POPUP.
export function StoreHeader({
  categories,
  catalogs,
}: {
  categories: CategoryDTO[];
  catalogs: CatalogDTO[];
}) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <Header categories={categories} catalogs={catalogs} />;
}

export function StoreFooter({
  categories,
  settings,
}: {
  categories: CategoryDTO[];
  settings: Record<string, string>;
}) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <Footer categories={categories} settings={settings} />
      <WhatsAppButton phone={settings.store_whatsapp} />
      <PromoPopup
        enabled={settings.popup_enabled === 'true'}
        title={settings.popup_title}
        text={settings.popup_text}
        coupon={settings.popup_coupon}
      />
    </>
  );
}
