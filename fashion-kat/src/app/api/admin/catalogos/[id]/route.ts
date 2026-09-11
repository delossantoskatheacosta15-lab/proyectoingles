import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { catalogSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { toProductDTO } from '@/lib/serializers';

type Params = { params: { id: string } };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin('catalogos');
    const catalog = await prisma.catalog.findUnique({
      where: { id: params.id },
      include: {
        products: {
          orderBy: { position: 'asc' },
          include: { product: { include: { category: true } } },
        },
      },
    });
    if (!catalog) return fail('NO ENCONTRAMOS ESTE CATÁLOGO.', 404);

    return ok({
      catalog: {
        id: catalog.id,
        name: catalog.name,
        slug: catalog.slug,
        description: catalog.description,
        coverUrl: catalog.coverUrl,
        position: catalog.position,
        active: catalog.active,
      },
      products: catalog.products.map((cp) => ({
        position: cp.position,
        product: toProductDTO(cp.product),
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('catalogos');
    const existing = await prisma.catalog.findUnique({ where: { id: params.id } });
    if (!existing) return fail('NO ENCONTRAMOS ESTE CATÁLOGO.', 404);

    const data = catalogSchema.parse(await request.json());
    const name = data.name.toUpperCase();
    const slug = (data.slug && data.slug.trim()) || slugify(name);

    const conflict = await prisma.catalog.findFirst({
      where: { OR: [{ name }, { slug }], NOT: { id: params.id } },
    });
    if (conflict) return fail('YA EXISTE OTRO CATÁLOGO CON ESE NOMBRE O URL.', 409);

    const catalog = await prisma.catalog.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description: data.description ? data.description.toUpperCase() : null,
        coverUrl: data.coverUrl || null,
        position: data.position ?? existing.position,
        active: data.active ?? existing.active,
      },
    });

    // REEMPLAZA LA LISTA DE PRODUCTOS CONSERVANDO EL ORDEN ENVIADO
    if (data.productIds) {
      await prisma.catalogProduct.deleteMany({ where: { catalogId: params.id } });
      if (data.productIds.length) {
        await prisma.catalogProduct.createMany({
          data: data.productIds.map((productId, index) => ({
            catalogId: params.id,
            productId,
            position: index,
          })),
        });
      }
    }

    return ok({ catalog, message: 'CATÁLOGO ACTUALIZADO.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('catalogos');
    await prisma.catalog.delete({ where: { id: params.id } });
    return ok({ message: 'CATÁLOGO ELIMINADO.' });
  } catch (error) {
    return handleError(error);
  }
}
