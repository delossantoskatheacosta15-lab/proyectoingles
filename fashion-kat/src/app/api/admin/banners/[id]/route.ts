import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { bannerSchema } from '@/lib/validation';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('productos');
    const existing = await prisma.banner.findUnique({ where: { id: params.id } });
    if (!existing) return fail('NO ENCONTRAMOS ESTE BANNER.', 404);

    const data = bannerSchema.parse(await request.json());
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: data.title.toUpperCase(),
        subtitle: data.subtitle ? data.subtitle.toUpperCase() : null,
        imageUrl: data.imageUrl,
        buttonText: data.buttonText ? data.buttonText.toUpperCase() : null,
        link: data.link || null,
        position: data.position ?? existing.position,
        placement: data.placement ?? existing.placement,
        active: data.active ?? existing.active,
      },
    });

    return ok({ banner, message: 'BANNER ACTUALIZADO.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('productos');
    await prisma.banner.delete({ where: { id: params.id } });
    return ok({ message: 'BANNER ELIMINADO.' });
  } catch (error) {
    return handleError(error);
  }
}
