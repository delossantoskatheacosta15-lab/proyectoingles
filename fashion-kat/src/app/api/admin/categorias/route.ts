import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { categorySchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { listCategories } from '@/services/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('categorias');
    const categories = await listCategories(false);
    return ok({ categories });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin('categorias');
    const data = categorySchema.parse(await request.json());
    const name = data.name.toUpperCase();
    const slug = (data.slug && data.slug.trim()) || slugify(name);

    const exists = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (exists) return fail('YA EXISTE UNA CATEGORÍA CON ESE NOMBRE O URL.', 409);

    const count = await prisma.category.count();
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: data.description ? data.description.toUpperCase() : null,
        imageUrl: data.imageUrl || null,
        position: data.position ?? count,
        active: data.active ?? true,
      },
    });

    return ok({ category, message: 'CATEGORÍA CREADA CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}
