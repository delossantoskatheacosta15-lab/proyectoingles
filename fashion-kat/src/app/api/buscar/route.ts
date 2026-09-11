import { ok, handleError, assertRate } from '@/lib/api';
import { searchSuggestions } from '@/services/products';
import { trackEvent } from '@/lib/analytics';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    assertRate(request, 'buscar', 90, 60_000);
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') ?? '').slice(0, 80);

    const result = await searchSuggestions(q);

    if (q.trim().length >= 3) {
      const session = await getSession();
      await trackEvent({ type: 'BUSQUEDA', query: q.trim().toUpperCase(), userId: session?.sub });
    }

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
