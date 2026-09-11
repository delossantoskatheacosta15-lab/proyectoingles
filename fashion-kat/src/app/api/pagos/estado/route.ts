import { ok, handleError } from '@/lib/api';
import { paymentStatusReport } from '@/lib/payments';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

// ESTADO DE CONFIGURACIÓN DE LA PASARELA — SOLO VISIBLE PARA ADMINISTRACIÓN
export async function GET() {
  try {
    await requireAdmin('dashboard');
    return ok(paymentStatusReport());
  } catch (error) {
    return handleError(error);
  }
}
