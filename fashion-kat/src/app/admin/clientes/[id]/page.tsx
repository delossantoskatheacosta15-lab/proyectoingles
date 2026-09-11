import { CustomerDetailView } from '@/components/admin/CustomerDetailView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'DETALLE DEL CLIENTE · FASHION KAT',
};

export default function AdminClienteDetallePage({ params }: { params: { id: string } }) {
  return <CustomerDetailView id={params.id} />;
}
