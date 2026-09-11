import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, handleError } from '@/lib/api';
import { toProductDTO } from '@/lib/serializers';

const schema = z.object({ ids: z.array(z.string()).max(200) });

// DEVUELVE VARIOS PRODUCTOS POR SUS IDENTIFICADORES (FAVORITOS LOCALES, LISTAS, ETC.)
export async function POST(request: Request) {
  try {
    const { ids } = schema.parse(await request.json());
    if (ids.length === 0) return ok({ products: [] });

    const rows = await prisma.product.findMany({
      where: { id: { in: ids }, status: { in: ['ACTIVO', 'AGOTADO'] } },
      include: { category: true },
    });

    // CONSERVA EL ORDEN EN QUE LLEGARON LOS IDENTIFICADORES
    const map = new Map(rows.map((r) => [r.id, r] as const));
    const ordered = ids.map((id) => map.get(id)).filter(Boolean);

    return ok({ products: ordered.map((p) => toProductDTO(p)) });
  } catch (error) {
    return handleError(error);
  }
}
