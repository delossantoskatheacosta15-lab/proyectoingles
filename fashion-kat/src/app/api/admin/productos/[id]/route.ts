import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { productSchema } from '@/lib/validation';
import { joinImages, slugify, discountPercent } from '@/lib/utils';
import { toProductDTO } from '@/lib/serializers';
import { checkStockAlerts } from '@/lib/notifications';

type Params = { params: { id: string } };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdmin('productos');
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    });
    if (!product) return fail('NO ENCONTRAMOS ESTE PRODUCTO.', 404);
    return ok({ product: toProductDTO(product) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin('productos');
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    });
    if (!existing) return fail('NO ENCONTRAMOS ESTE PRODUCTO.', 404);

    const data = productSchema.parse(await request.json());
    const slug = (data.slug && data.slug.trim()) || slugify(data.name);

    const slugOwner = await prisma.product.findUnique({ where: { slug } });
    if (slugOwner && slugOwner.id !== params.id) {
      return fail('YA EXISTE OTRO PRODUCTO CON ESA URL.', 409);
    }

    const variants = data.variants ?? [];

    // SINCRONIZA VARIANTES: ACTUALIZA LAS EXISTENTES, CREA LAS NUEVAS, ELIMINA LAS QUITADAS
    const keepIds = variants.filter((v) => v.id).map((v) => v.id as string);
    await prisma.productVariant.deleteMany({
      where: { productId: params.id, id: { notIn: keepIds.length ? keepIds : ['__ninguna__'] } },
    });

    for (const v of variants) {
      const payload = {
        size: v.size.toUpperCase(),
        color: v.color.toUpperCase(),
        colorHex: v.colorHex || '#0A0A0A',
        stock: v.stock,
        priceDiff: v.priceDiff ?? 0,
        active: v.active ?? true,
      };
      if (v.id) {
        await prisma.productVariant.update({ where: { id: v.id }, data: payload });
      } else {
        await prisma.productVariant.create({
          data: {
            ...payload,
            productId: params.id,
            sku: `${data.sku.toUpperCase()}-${v.color.slice(0, 3).toUpperCase()}-${v.size.toUpperCase()}-${Date.now().toString().slice(-4)}`,
          },
        });
      }
    }

    const totalStock = variants.length
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : data.stock ?? existing.stock;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        sku: data.sku.toUpperCase(),
        name: data.name.toUpperCase(),
        slug,
        description: data.description.toUpperCase(),
        shortDescription: data.shortDescription.toUpperCase(),
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        discountPercent: discountPercent(data.price, data.comparePrice),
        categoryId: data.categoryId,
        subcategory: data.subcategory ? data.subcategory.toUpperCase() : null,
        brand: (data.brand || 'FASHION KAT').toUpperCase(),
        tags: (data.tags ?? '').toUpperCase(),
        images: joinImages(data.images ?? []),
        stock: totalStock,
        minStock: data.minStock ?? existing.minStock,
        status: totalStock <= 0 && data.status === 'ACTIVO' ? 'AGOTADO' : data.status,
        isFeatured: Boolean(data.isFeatured),
        isNew: Boolean(data.isNew),
        isOnSale: Boolean(data.isOnSale),
        metaTitle: data.metaTitle || `${data.name.toUpperCase()} · FASHION KAT`,
        metaDescription: data.metaDescription || data.shortDescription.toUpperCase(),
      },
      include: { category: true, variants: true },
    });

    await checkStockAlerts(product.id);

    return ok({ product: toProductDTO(product), message: 'PRODUCTO ACTUALIZADO CORRECTAMENTE.' });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin('productos');
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return fail('NO ENCONTRAMOS ESTE PRODUCTO.', 404);

    const sold = await prisma.orderItem.count({ where: { productId: params.id } });
    if (sold > 0) {
      // NO SE ELIMINA PARA NO ROMPER EL HISTORIAL DE PEDIDOS: SE OCULTA
      await prisma.product.update({ where: { id: params.id }, data: { status: 'OCULTO' } });
      return ok({
        message: 'ESTE PRODUCTO TIENE VENTAS REGISTRADAS, POR ESO SE OCULTÓ EN LUGAR DE ELIMINARSE.',
        hidden: true,
      });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return ok({ message: 'PRODUCTO ELIMINADO CORRECTAMENTE.', hidden: false });
  } catch (error) {
    return handleError(error);
  }
}
