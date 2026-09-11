import { ok, fail, handleError } from '@/lib/api';
import { getProductBySlug, getRelatedProducts } from '@/services/products';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return fail('NO ENCONTRAMOS ESTE PRODUCTO.', 404);

    const related = await getRelatedProducts(product.id, product.category.id, 4);
    return ok({ product, related });
  } catch (error) {
    return handleError(error);
  }
}
