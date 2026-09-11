import { ok, handleError } from '@/lib/api';
import { listCategories } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await listCategories(true);
    return ok({ categories });
  } catch (error) {
    return handleError(error);
  }
}
