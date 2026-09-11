import type { Metadata } from 'next';
import { FavoritesView } from '@/components/account/FavoritesView';

export const metadata: Metadata = {
  title: 'MIS FAVORITOS',
  description: 'GUARDA TUS PRENDAS FAVORITAS DE FASHION KAT Y CÓMPRALAS CUANDO QUIERAS.',
  robots: { index: false, follow: true },
};

export default function FavoritosPage() {
  return <FavoritesView />;
}
