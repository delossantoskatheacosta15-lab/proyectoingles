import { ok, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { getDashboardData } from '@/services/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('dashboard');
    const data = await getDashboardData();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
