import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { catalogSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { listCatalogs } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('catalogos');
    const catalogs = await listCatalogs(false);
    return ok({ catalogs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin('catalogos');
    const data = catalogSchema.parse(await request.json());
    const name = data.name.toUpperCase();
    const slug = (data.slug && data.slug.trim()) || slugify(name);

    const exists = await prisma.catalog.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (exists) return fail('YA EXISTE UN CATÁLOGO CON ESE NOMBRE O URL.', 409);

    const count = await prisma.catalog.count();
    const catalog = await prisma.catalog.create({
      data: {
        name,
        slug,
        description: data.description ? data.description.toUpperCase() : null,
        coverUrl: data.coverUrl || null,
        position: data.position ?? count,
        active: data.active ?? true,
        products: {
          create: (data.productIds ?? []).map((productId, index) => ({ productId, position: index })),
        },
      },
    });

    return ok({ catalog, message: 'CATÁLOGO CREADO CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
