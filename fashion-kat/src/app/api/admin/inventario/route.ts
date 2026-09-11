import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { checkStockAlerts } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin('productos');

    const products = await prisma.product.findMany({
      where: { status: { not: 'BORRADOR' } },
      include: { category: true, variants: true },
      orderBy: { stock: 'asc' },
    });

    const items = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      category: p.category.name,
      stock: p.stock,
      minStock: p.minStock,
      soldCount: p.soldCount,
      status: p.status,
      lowStock: p.stock > 0 && p.stock <= p.minStock,
      outOfStock: p.stock <= 0,
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        stock: v.stock,
      })),
    }));

    return ok({
      items,
      summary: {
        total: items.length,
        outOfStock: items.filter((i) => i.outOfStock).length,
        lowStock: items.filter((i) => i.lowStock).length,
        totalUnits: items.reduce((s, i) => s + i.stock, 0),
        totalSold: items.reduce((s, i) => s + i.soldCount, 0),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

const patchSchema = z.object({
  variantId: z.string().optional(),
  productId: z.string().optional(),
  stock: z.number().int().min(0),
});

// AJUSTE RÁPIDO DE EXISTENCIAS
export async function PATCH(request: Request) {
  try {
    await requireAdmin('productos');
    const data = patchSchema.parse(await request.json());

    if (data.variantId) {
      const variant = await prisma.productVariant.update({
        where: { id: data.variantId },
        data: { stock: data.stock },
      });
      const variants = await prisma.productVariant.findMany({ where: { productId: variant.productId } });
      const total = variants.reduce((s, v) => s + v.stock, 0);
      await prisma.product.update({
        where: { id: variant.productId },
        data: { stock: total, status: total <= 0 ? 'AGOTADO' : 'ACTIVO' },
      });
      await checkStockAlerts(variant.productId);
      return ok({ message: 'EXISTENCIAS ACTUALIZADAS.', stock: total });
    }

    if (data.productId) {
      await prisma.product.update({
        where: { id: data.productId },
        data: { stock: data.stock, status: data.stock <= 0 ? 'AGOTADO' : 'ACTIVO' },
      });
      await checkStockAlerts(data.productId);
      return ok({ message: 'EXISTENCIAS ACTUALIZADAS.', stock: data.stock });
    }

    return fail('INDICA EL PRODUCTO O LA VARIANTE A ACTUALIZAR.', 400);
  } catch (error) {
    return handleError(error);
  }
}
