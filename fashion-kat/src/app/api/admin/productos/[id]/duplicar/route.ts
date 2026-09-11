import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { slugify } from '@/lib/utils';
import { toProductDTO } from '@/lib/serializers';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin('productos');
    const original = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    });
    if (!original) return fail('NO ENCONTRAMOS ESTE PRODUCTO.', 404);

    const suffix = Date.now().toString().slice(-5);
    const name = `${original.name} (COPIA)`;

    const copy = await prisma.product.create({
      data: {
        sku: `${original.sku}-C${suffix}`,
        name,
        slug: `${slugify(name)}-${suffix}`,
        description: original.description,
        shortDescription: original.shortDescription,
        price: original.price,
        comparePrice: original.comparePrice,
        discountPercent: original.discountPercent,
        categoryId: original.categoryId,
        subcategory: original.subcategory,
        brand: original.brand,
        tags: original.tags,
        images: original.images,
        stock: original.stock,
        minStock: original.minStock,
        status: 'BORRADOR',
        isFeatured: false,
        isNew: false,
        isOnSale: original.isOnSale,
        metaTitle: `${name} · FASHION KAT`,
        metaDescription: original.metaDescription,
        variants: {
          create: original.variants.map((v) => ({
            sku: `${v.sku}-C${suffix}`,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            priceDiff: v.priceDiff,
            active: v.active,
          })),
        },
      },
      include: { category: true, variants: true },
    });

    return ok({ product: toProductDTO(copy), message: 'PRODUCTO DUPLICADO COMO BORRADOR.' });
  } catch (error) {
    return handleError(error);
  }
}
