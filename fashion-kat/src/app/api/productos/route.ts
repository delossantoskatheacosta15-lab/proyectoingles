import { ok, handleError } from '@/lib/api';
import { listProducts } from '@/services/products';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const num = (key: string) => {
      const raw = searchParams.get(key);
      if (raw === null || raw === '') return undefined;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const result = await listProducts({
      categoria: searchParams.get('categoria') ?? undefined,
      catalogo: searchParams.get('catalogo') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      precioMin: num('precioMin'),
      precioMax: num('precioMax'),
      talla: searchParams.get('talla') ?? undefined,
      color: searchParams.get('color') ?? undefined,
      marca: searchParams.get('marca') ?? undefined,
      disponibilidad: (searchParams.get('disponibilidad') as 'disponible' | 'agotado') ?? undefined,
      descuento: searchParams.get('descuento') === 'true',
      valoracion: num('valoracion'),
      oferta: searchParams.get('oferta') === 'true',
      nuevo: searchParams.get('nuevo') === 'true',
      destacado: searchParams.get('destacado') === 'true',
      orden: searchParams.get('orden') ?? undefined,
      pagina: num('pagina'),
      tamano: num('tamano'),
    });

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
