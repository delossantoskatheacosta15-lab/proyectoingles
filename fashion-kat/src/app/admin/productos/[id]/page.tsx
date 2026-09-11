import { ProductForm } from '@/components/admin/ProductForm';

export default function EditarProductoPage({ params }: { params: { id: string } }) {
  return <ProductForm productId={params.id} />;
}
