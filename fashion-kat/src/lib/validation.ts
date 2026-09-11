import { z } from 'zod';

// ==========================================================
// VALIDACIÓN DE BACKEND — TODOS LOS MENSAJES EN ESPAÑOL
// ==========================================================

const requiredText = (label: string, min = 2, max = 120) =>
  z
    .string({ required_error: `${label} ES OBLIGATORIO.` })
    .trim()
    .min(min, `${label} DEBE TENER AL MENOS ${min} CARACTERES.`)
    .max(max, `${label} ES DEMASIADO LARGO.`);

export const emailSchema = z
  .string({ required_error: 'EL CORREO ES OBLIGATORIO.' })
  .trim()
  .toLowerCase()
  .email('EL CORREO NO ES VÁLIDO.');

export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'EL TELÉFONO NO ES VÁLIDO.')
  .max(20, 'EL TELÉFONO NO ES VÁLIDO.')
  .regex(/^[0-9+()\s-]+$/, 'EL TELÉFONO SOLO PUEDE CONTENER NÚMEROS.');

export const passwordSchema = z
  .string({ required_error: 'LA CONTRASEÑA ES OBLIGATORIA.' })
  .min(8, 'LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES.')
  .regex(/[A-Za-z]/, 'LA CONTRASEÑA DEBE INCLUIR AL MENOS UNA LETRA.')
  .regex(/[0-9]/, 'LA CONTRASEÑA DEBE INCLUIR AL MENOS UN NÚMERO.');

// ---------------------------------------------------------
// AUTENTICACIÓN
// ---------------------------------------------------------
export const registerSchema = z.object({
  firstName: requiredText('EL NOMBRE'),
  lastName: requiredText('EL APELLIDO'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'LA CONTRASEÑA ES OBLIGATORIA.'),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({
  token: z.string().min(10, 'EL ENLACE NO ES VÁLIDO.'),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'LA CONTRASEÑA ACTUAL ES OBLIGATORIA.'),
  newPassword: passwordSchema,
});

export const profileSchema = z.object({
  firstName: requiredText('EL NOMBRE'),
  lastName: requiredText('EL APELLIDO'),
  phone: phoneSchema.optional().or(z.literal('')),
});

// ---------------------------------------------------------
// DIRECCIONES
// ---------------------------------------------------------
export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().default('CASA'),
  firstName: requiredText('EL NOMBRE'),
  lastName: requiredText('EL APELLIDO'),
  phone: phoneSchema,
  street: requiredText('LA DIRECCIÓN', 5, 160),
  neighborhood: requiredText('EL BARRIO'),
  city: requiredText('LA CIUDAD'),
  state: requiredText('EL DEPARTAMENTO'),
  postalCode: z.string().trim().max(12).optional().or(z.literal('')),
  notes: z.string().trim().max(300).optional().or(z.literal('')),
  isDefault: z.boolean().optional().default(false),
});

// ---------------------------------------------------------
// CARRITO
// ---------------------------------------------------------
export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().min(1, 'LA CANTIDAD MÍNIMA ES 1.').max(50, 'LA CANTIDAD MÁXIMA ES 50.'),
  savedForLater: z.boolean().optional().default(false),
});

export const cartSyncSchema = z.object({
  items: z.array(cartItemSchema).max(100),
});

// ---------------------------------------------------------
// PEDIDOS
// ---------------------------------------------------------
export const checkoutSchema = z.object({
  firstName: requiredText('EL NOMBRE'),
  lastName: requiredText('EL APELLIDO'),
  email: emailSchema,
  phone: phoneSchema,
  street: requiredText('LA DIRECCIÓN', 5, 160),
  neighborhood: requiredText('EL BARRIO'),
  city: requiredText('LA CIUDAD'),
  state: requiredText('EL DEPARTAMENTO'),
  postalCode: z.string().trim().max(12).optional().or(z.literal('')),
  notes: z.string().trim().max(400).optional().or(z.literal('')),
  paymentMethod: z.enum(['CONTRA_ENTREGA', 'PAGO_ONLINE', 'TRANSFERENCIA'], {
    errorMap: () => ({ message: 'SELECCIONA UN MÉTODO DE PAGO.' }),
  }),
  couponCode: z.string().trim().max(40).optional().or(z.literal('')),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'DEBES ACEPTAR LOS TÉRMINOS Y CONDICIONES.' }),
  }),
  items: z.array(cartItemSchema).min(1, 'TU CARRITO ESTÁ VACÍO.'),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    'PENDIENTE',
    'CONFIRMADO',
    'PREPARANDO',
    'ENVIADO',
    'EN_CAMINO',
    'ENTREGADO',
    'CANCELADO',
  ]),
  note: z.string().trim().max(300).optional().or(z.literal('')),
  trackingCode: z.string().trim().max(60).optional().or(z.literal('')),
  carrier: z.string().trim().max(60).optional().or(z.literal('')),
});

// ---------------------------------------------------------
// RESEÑAS Y CONTACTO
// ---------------------------------------------------------
export const reviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1, 'SOLO PUEDES RESEÑAR PRODUCTOS QUE HAYAS COMPRADO.'),
  rating: z.number().int().min(1, 'SELECCIONA UNA CALIFICACIÓN.').max(5),
  comment: z.string().trim().min(10, 'ESCRIBE AL MENOS 10 CARACTERES.').max(1000),
});

export const contactSchema = z.object({
  name: requiredText('EL NOMBRE'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  subject: requiredText('EL ASUNTO', 3, 120),
  message: z.string().trim().min(10, 'EL MENSAJE DEBE TENER AL MENOS 10 CARACTERES.').max(2000),
});

export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.string().trim().max(40).optional().default('POPUP'),
});

// ---------------------------------------------------------
// ADMINISTRACIÓN
// ---------------------------------------------------------
export const productSchema = z.object({
  sku: requiredText('EL SKU', 2, 40),
  name: requiredText('EL NOMBRE', 3, 140),
  slug: z.string().trim().max(160).optional().or(z.literal('')),
  description: z.string().trim().min(10, 'LA DESCRIPCIÓN DEBE TENER AL MENOS 10 CARACTERES.'),
  shortDescription: z.string().trim().min(5, 'LA DESCRIPCIÓN CORTA ES OBLIGATORIA.').max(200),
  price: z.number().int().min(0, 'EL PRECIO NO PUEDE SER NEGATIVO.'),
  comparePrice: z.number().int().min(0).nullable().optional(),
  categoryId: z.string().min(1, 'SELECCIONA UNA CATEGORÍA.'),
  subcategory: z.string().trim().max(80).optional().or(z.literal('')),
  brand: z.string().trim().max(80).optional().or(z.literal('')),
  tags: z.string().trim().max(400).optional().or(z.literal('')),
  images: z.array(z.string().trim().url('CADA IMAGEN DEBE SER UNA URL VÁLIDA.')).max(8).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVO', 'AGOTADO', 'OCULTO', 'BORRADOR']),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  metaTitle: z.string().trim().max(160).optional().or(z.literal('')),
  metaDescription: z.string().trim().max(300).optional().or(z.literal('')),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().trim().min(1, 'LA TALLA ES OBLIGATORIA.'),
        color: z.string().trim().min(1, 'EL COLOR ES OBLIGATORIO.'),
        colorHex: z.string().trim().max(12).optional(),
        stock: z.number().int().min(0),
        priceDiff: z.number().int().optional(),
        active: z.boolean().optional(),
      })
    )
    .optional(),
});

export const categorySchema = z.object({
  name: requiredText('EL NOMBRE'),
  slug: z.string().trim().max(120).optional().or(z.literal('')),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  imageUrl: z.string().trim().url('LA IMAGEN DEBE SER UNA URL VÁLIDA.').optional().or(z.literal('')),
  position: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export const catalogSchema = z.object({
  name: requiredText('EL NOMBRE'),
  slug: z.string().trim().max(120).optional().or(z.literal('')),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  coverUrl: z.string().trim().url('LA PORTADA DEBE SER UNA URL VÁLIDA.').optional().or(z.literal('')),
  position: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  productIds: z.array(z.string()).optional(),
});

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, 'EL CÓDIGO DEBE TENER AL MENOS 3 CARACTERES.')
      .max(30)
      .regex(/^[A-Z0-9_-]+$/, 'EL CÓDIGO SOLO PUEDE TENER LETRAS, NÚMEROS, GUIONES Y GUIONES BAJOS.'),
    description: z.string().trim().max(200).optional().or(z.literal('')),
    discountType: z.enum(['PORCENTAJE', 'VALOR_FIJO']),
    discountValue: z.number().int().min(1, 'EL VALOR DEL DESCUENTO DEBE SER MAYOR A CERO.'),
    minPurchase: z.number().int().min(0).optional(),
    maxDiscount: z.number().int().min(0).nullable().optional(),
    startsAt: z.string().optional(),
    expiresAt: z.string().nullable().optional(),
    maxUses: z.number().int().min(0).nullable().optional(),
    maxUsesPerUser: z.number().int().min(1).optional(),
    categories: z.string().trim().optional().or(z.literal('')),
    active: z.boolean().optional(),
  })
  .refine((v) => v.discountType !== 'PORCENTAJE' || v.discountValue <= 100, {
    message: 'EL PORCENTAJE NO PUEDE SUPERAR 100.',
    path: ['discountValue'],
  });

export const bannerSchema = z.object({
  title: requiredText('EL TÍTULO'),
  subtitle: z.string().trim().max(200).optional().or(z.literal('')),
  imageUrl: z.string().trim().url('LA IMAGEN DEBE SER UNA URL VÁLIDA.'),
  buttonText: z.string().trim().max(40).optional().or(z.literal('')),
  link: z.string().trim().max(200).optional().or(z.literal('')),
  position: z.number().int().min(0).optional(),
  placement: z.enum(['HERO', 'PROMO', 'SECUNDARIO']).optional(),
  active: z.boolean().optional(),
});

export const shippingRateSchema = z.object({
  state: requiredText('EL DEPARTAMENTO'),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  cost: z.number().int().min(0),
  etaDays: z.string().trim().max(60).optional().or(z.literal('')),
  active: z.boolean().optional(),
});

export const settingsSchema = z.record(z.string(), z.string().max(500));

export const customerUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'OPERADOR', 'CLIENTE']).optional(),
  status: z.enum(['ACTIVO', 'INACTIVO', 'BLOQUEADO']).optional(),
});

export const analyticsEventSchema = z.object({
  type: z.enum([
    'VISTA_PRODUCTO',
    'AGREGADO_CARRITO',
    'FAVORITO',
    'COMPRA',
    'BUSQUEDA',
    'VISITA_CATEGORIA',
  ]),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  query: z.string().max(120).optional(),
  value: z.number().int().optional(),
  sessionId: z.string().max(80).optional(),
});
