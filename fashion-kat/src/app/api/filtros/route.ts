import { ok, handleError } from '@/lib/api';
import { getFilterFacets } from '@/services/products';
import { listCategories } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [facets, categories] = await Promise.all([getFilterFacets(), listCategories(true)]);
    return ok({ ...facets, categories });
  } catch (error) {
    return handleError(error);
  }
}
