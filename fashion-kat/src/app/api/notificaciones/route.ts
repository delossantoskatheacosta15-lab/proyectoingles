import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { ADMIN_ROLES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ notifications: [], unread: 0 });

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('ambito') === 'admin' ? 'ADMIN' : 'CLIENTE';

    if (scope === 'ADMIN' && !ADMIN_ROLES.includes(user.role)) {
      return ok({ notifications: [], unread: 0 });
    }

    const where =
      scope === 'ADMIN' ? { audience: 'ADMIN' as const } : { userId: user.id, audience: 'CLIENTE' as const };

    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.notification.count({ where: { ...where, read: false } }),
    ]);

    return ok({ notifications, unread });
  } catch (error) {
    return handleError(error);
  }
}

const patchSchema = z.object({
  id: z.string().optional(),
  todas: z.boolean().optional(),
  ambito: z.enum(['cliente', 'admin']).optional(),
});

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return ok({ updated: 0 });

    const body = patchSchema.parse(await request.json());
    const scope = body.ambito === 'admin' ? 'ADMIN' : 'CLIENTE';

    if (scope === 'ADMIN' && !ADMIN_ROLES.includes(user.role)) return ok({ updated: 0 });

    if (body.id) {
      const notification = await prisma.notification.findUnique({ where: { id: body.id } });
      if (!notification) return ok({ updated: 0 });
      if (notification.audience === 'CLIENTE' && notification.userId !== user.id) {
        return ok({ updated: 0 });
      }
      await prisma.notification.update({ where: { id: body.id }, data: { read: true } });
      return ok({ updated: 1 });
    }

    const where =
      scope === 'ADMIN' ? { audience: 'ADMIN' as const } : { userId: user.id, audience: 'CLIENTE' as const };
    const result = await prisma.notification.updateMany({ where, data: { read: true } });
    return ok({ updated: result.count });
  } catch (error) {
    return handleError(error);
  }
}
