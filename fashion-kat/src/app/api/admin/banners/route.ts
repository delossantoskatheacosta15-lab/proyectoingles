import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { bannerSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('productos');
    const banners = await prisma.banner.findMany({ orderBy: [{ placement: 'asc' }, { position: 'asc' }] });
    return ok({ banners });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin('productos');
    const data = bannerSchema.parse(await request.json());
    const count = await prisma.banner.count();

    const banner = await prisma.banner.create({
      data: {
        title: data.title.toUpperCase(),
        subtitle: data.subtitle ? data.subtitle.toUpperCase() : null,
        imageUrl: data.imageUrl,
        buttonText: data.buttonText ? data.buttonText.toUpperCase() : null,
        link: data.link || null,
        position: data.position ?? count,
        placement: data.placement ?? 'HERO',
        active: data.active ?? true,
      },
    });

    return ok({ banner, message: 'BANNER CREADO CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
