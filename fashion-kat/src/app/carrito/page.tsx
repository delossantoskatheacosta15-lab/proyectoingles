import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';

export const metadata: Metadata = {
  title: 'CARRITO',
  description: 'REVISA LOS PRODUCTOS DE TU CARRITO Y APLICA TUS CUPONES ANTES DE PAGAR.',
  robots: { index: false, follow: true },
};

export default function CarritoPage() {
  return <CartView />;
}
