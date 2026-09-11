import { CatalogProductsView } from '@/components/admin/CatalogProductsView';

export const dynamic = 'force-dynamic';

export default function AdminCatalogoDetallePage({ params }: { params: { id: string } }) {
  return <CatalogProductsView catalogId={params.id} />;
}
