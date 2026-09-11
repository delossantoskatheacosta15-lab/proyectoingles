import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { getSettings, setSettings } from '@/lib/settings';
import { settingsSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('dashboard');
    const settings = await getSettings();
    return ok({ settings });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin('dashboard');
    if (admin.role !== 'ADMIN') {
      return fail('SOLO UN ADMINISTRADOR PUEDE CAMBIAR LA CONFIGURACIÓN.', 403);
    }

    const values = settingsSchema.parse(await request.json());
    await setSettings(values);
    const settings = await getSettings();

    return ok({ settings, message: 'CONFIGURACIÓN GUARDADA CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
