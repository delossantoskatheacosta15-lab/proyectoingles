import { ok, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { getAnalyticsData } from '@/services/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('dashboard');
    const data = await getAnalyticsData();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
