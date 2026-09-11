import { OrderDetailView } from '@/components/admin/OrderDetailView';

export default function AdminPedidoDetallePage({ params }: { params: { id: string } }) {
  return <OrderDetailView orderId={params.id} />;
}
