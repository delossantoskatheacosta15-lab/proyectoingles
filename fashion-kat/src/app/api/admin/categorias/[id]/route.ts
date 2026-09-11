import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('categorias');
    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) return fail('NO ENCONTRAMOS ESTA CATEGORÍA.', 404);

    const data = categorySchema.parse(await request.json());
    const name = data.name.toUpperCase();
    const slug = (data.slug && data.slug.trim()) || slugify(name);

    const conflict = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }], NOT: { id: params.id } },
    });
    if (conflict) return fail('YA EXISTE OTRA CATEGORÍA CON ESE NOMBRE O URL.', 409);

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description: data.description ? data.description.toUpperCase() : null,
        imageUrl: data.imageUrl || null,
        position: data.position ?? existing.position,
        active: data.active ?? existing.active,
      },
    });

    return ok({ category, message: 'CATEGORÍA ACTUALIZADA.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('categorias');
    const productCount = await prisma.product.count({ where: { categoryId: params.id } });
    if (productCount > 0) {
      return fail(
        `NO PUEDES ELIMINAR ESTA CATEGORÍA PORQUE TIENE ${productCount} PRODUCTOS. MUÉVELOS PRIMERO O DESACTÍVALA.`,
        409
      );
    }
    await prisma.category.delete({ where: { id: params.id } });
    return ok({ message: 'CATEGORÍA ELIMINADA.' });
  } catch (error) {
    return handleError(error);
  }
}
