import { z } from 'zod';
import { ok, handleError } from '@/lib/api';
import { quoteShipping } from '@/lib/shipping';

const schema = z.object({
  subtotal: z.number().int().min(0),
  departamento: z.string().trim().max(80).optional().nullable(),
  ciudad: z.string().trim().max(80).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json());
    const quote = await quoteShipping(data.subtotal, data.departamento, data.ciudad);
    return ok(quote);
  } catch (error) {
    return handleError(error);
  }
}
