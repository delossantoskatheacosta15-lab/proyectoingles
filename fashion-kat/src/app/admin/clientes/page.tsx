import { CustomersView } from '@/components/admin/CustomersView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CLIENTES · FASHION KAT',
};

export default function AdminClientesPage() {
  return <CustomersView />;
}
