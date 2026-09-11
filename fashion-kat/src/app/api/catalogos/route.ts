import { ok, handleError } from '@/lib/api';
import { listCatalogs } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalogs = await listCatalogs(true);
    return ok({ catalogs });
  } catch (error) {
    return handleError(error);
  }
}
