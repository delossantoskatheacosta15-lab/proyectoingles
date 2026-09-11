// ==========================================================
// CONSTANTES GLOBALES DE FASHION KAT
// TODO EL TEXTO VISIBLE VA EN ESPAÑOL Y EN MAYÚSCULAS
// ==========================================================

export const BRAND = {
  name: 'FASHION KAT',
  slogan: 'TU ESTILO, TU ACTITUD, TU MOMENTO.',
  description:
    'TIENDA ONLINE DE MODA FEMENINA CON ENVÍOS A TODA COLOMBIA. VESTIDOS, BLUSAS, CONJUNTOS, ZAPATOS Y ACCESORIOS.',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  OPERADOR: 'OPERADOR',
  CLIENTE: 'CLIENTE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'ADMINISTRADOR',
  EDITOR: 'EDITOR',
  OPERADOR: 'OPERADOR',
  CLIENTE: 'CLIENTE',
};

// PERMISOS POR ROL — SECCIONES DEL PANEL ADMINISTRATIVO
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['*'],
  EDITOR: ['dashboard', 'productos', 'categorias', 'catalogos', 'banners', 'resenas'],
  OPERADOR: ['dashboard', 'pedidos', 'clientes', 'mensajes', 'envios'],
  CLIENTE: [],
};

export function canAccess(role: string | undefined, section: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes('*') || perms.includes(section);
}

export const ADMIN_ROLES = ['ADMIN', 'EDITOR', 'OPERADOR'];

// ---------------------------------------------------------
// ESTADOS DE PEDIDO
// ---------------------------------------------------------
export const ORDER_STATUSES = [
  'PENDIENTE',
  'CONFIRMADO',
  'PREPARANDO',
  'ENVIADO',
  'EN_CAMINO',
  'ENTREGADO',
  'CANCELADO',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  PREPARANDO: 'PREPARANDO',
  ENVIADO: 'ENVIADO',
  EN_CAMINO: 'EN CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
};

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

// LÍNEA DE TIEMPO MOSTRADA AL CLIENTE
export const TRACKING_STEPS = [
  { status: 'PENDIENTE', label: 'PEDIDO RECIBIDO' },
  { status: 'CONFIRMADO', label: 'PEDIDO CONFIRMADO' },
  { status: 'PREPARANDO', label: 'PREPARANDO' },
  { status: 'ENVIADO', label: 'ENVIADO' },
  { status: 'EN_CAMINO', label: 'EN CAMINO' },
  { status: 'ENTREGADO', label: 'ENTREGADO' },
] as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-smoke-200 text-ink-700',
  CONFIRMADO: 'bg-blue-50 text-blue-700',
  PREPARANDO: 'bg-amber-50 text-amber-700',
  ENVIADO: 'bg-indigo-50 text-indigo-700',
  EN_CAMINO: 'bg-violet-50 text-violet-700',
  ENTREGADO: 'bg-emerald-50 text-emerald-700',
  CANCELADO: 'bg-red-50 text-red-700',
};

// ---------------------------------------------------------
// MÉTODOS DE PAGO
// ---------------------------------------------------------
export const PAYMENT_METHODS = [
  {
    value: 'CONTRA_ENTREGA',
    label: 'PAGO CONTRA ENTREGA',
    hint: 'REALIZA TU PEDIDO Y PAGA CUANDO LO RECIBAS.',
  },
  {
    value: 'PAGO_ONLINE',
    label: 'PAGO ONLINE',
    hint: 'PAGA CON TARJETA O PSE DE FORMA SEGURA.',
  },
  {
    value: 'TRANSFERENCIA',
    label: 'TRANSFERENCIA BANCARIA',
    hint: 'TE ENVIAMOS LOS DATOS BANCARIOS AL CONFIRMAR TU PEDIDO.',
  },
] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CONTRA_ENTREGA: 'PAGO CONTRA ENTREGA',
  PAGO_ONLINE: 'PAGO ONLINE',
  TRANSFERENCIA: 'TRANSFERENCIA BANCARIA',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO',
  FALLIDO: 'FALLIDO',
  REEMBOLSADO: 'REEMBOLSADO',
};

// ---------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------
export const PRODUCT_STATUSES = ['ACTIVO', 'AGOTADO', 'OCULTO', 'BORRADOR'] as const;

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ACTIVO: 'ACTIVO',
  AGOTADO: 'AGOTADO',
  OCULTO: 'OCULTO',
  BORRADOR: 'BORRADOR',
};

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;
export const SHOE_SIZES = ['35', '36', '37', '38', '39', '40'] as const;
export const ONE_SIZE = ['ÚNICA'] as const;

export const COLORS = [
  { name: 'NEGRO', hex: '#0A0A0A' },
  { name: 'ROSA', hex: '#F0508C' },
  { name: 'BLANCO', hex: '#FFFFFF' },
  { name: 'GRIS', hex: '#9CA3AF' },
  { name: 'BEIGE', hex: '#D8C3A5' },
  { name: 'VINOTINTO', hex: '#7A1F3D' },
  { name: 'AZUL', hex: '#1E3A8A' },
  { name: 'VERDE', hex: '#14532D' },
] as const;

export const COLOR_HEX: Record<string, string> = COLORS.reduce(
  (acc, c) => ({ ...acc, [c.name]: c.hex }),
  {} as Record<string, string>
);

export const SORT_OPTIONS = [
  { value: 'recientes', label: 'MÁS RECIENTES' },
  { value: 'vendidos', label: 'MÁS VENDIDOS' },
  { value: 'valorados', label: 'MEJOR VALORADOS' },
  { value: 'precio-asc', label: 'MENOR PRECIO' },
  { value: 'precio-desc', label: 'MAYOR PRECIO' },
] as const;

export const PAGE_SIZE = 12;

// ---------------------------------------------------------
// COLOMBIA — DEPARTAMENTOS Y CIUDADES PRINCIPALES
// ---------------------------------------------------------
export const DEPARTMENTS: Record<string, string[]> = {
  'ANTIOQUIA': ['MEDELLÍN', 'ENVIGADO', 'ITAGÜÍ', 'BELLO', 'RIONEGRO', 'SABANETA'],
  'ATLÁNTICO': ['BARRANQUILLA', 'SOLEDAD', 'MALAMBO', 'PUERTO COLOMBIA'],
  'BOGOTÁ D.C.': ['BOGOTÁ'],
  'BOLÍVAR': ['CARTAGENA', 'MAGANGUÉ', 'TURBACO'],
  'BOYACÁ': ['TUNJA', 'DUITAMA', 'SOGAMOSO'],
  'CALDAS': ['MANIZALES', 'LA DORADA', 'CHINCHINÁ'],
  'CESAR': ['VALLEDUPAR', 'AGUACHICA'],
  'CÓRDOBA': ['MONTERÍA', 'LORICA', 'SAHAGÚN'],
  'CUNDINAMARCA': ['SOACHA', 'CHÍA', 'ZIPAQUIRÁ', 'FUSAGASUGÁ', 'FACATATIVÁ', 'CAJICÁ'],
  'HUILA': ['NEIVA', 'PITALITO'],
  'MAGDALENA': ['SANTA MARTA', 'CIÉNAGA'],
  'META': ['VILLAVICENCIO', 'ACACÍAS'],
  'NARIÑO': ['PASTO', 'IPIALES', 'TUMACO'],
  'NORTE DE SANTANDER': ['CÚCUTA', 'OCAÑA', 'PAMPLONA'],
  'QUINDÍO': ['ARMENIA', 'CALARCÁ'],
  'RISARALDA': ['PEREIRA', 'DOSQUEBRADAS', 'SANTA ROSA DE CABAL'],
  'SANTANDER': ['BUCARAMANGA', 'FLORIDABLANCA', 'GIRÓN', 'BARRANCABERMEJA', 'PIEDECUESTA'],
  'SUCRE': ['SINCELEJO', 'COROZAL'],
  'TOLIMA': ['IBAGUÉ', 'ESPINAL', 'MELGAR'],
  'VALLE DEL CAUCA': ['CALI', 'PALMIRA', 'BUENAVENTURA', 'TULUÁ', 'CARTAGO', 'JAMUNDÍ'],
};

export const DEPARTMENT_LIST = Object.keys(DEPARTMENTS).sort();

// ---------------------------------------------------------
// CONFIGURACIÓN POR DEFECTO DE LA TIENDA
// ---------------------------------------------------------
export const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: 'FASHION KAT',
  store_slogan: 'TU ESTILO, TU ACTITUD, TU MOMENTO.',
  store_logo: '',
  store_email: 'HOLA@FASHIONKAT.CO',
  store_phone: '(604) 000 0000',
  store_whatsapp: '',
  store_address: 'CALLE 10 # 40-20, MEDELLÍN, ANTIOQUIA',
  store_schedule: 'LUNES A SÁBADO DE 9:00 A.M. A 7:00 P.M.',
  social_instagram: 'https://instagram.com',
  social_facebook: 'https://facebook.com',
  social_tiktok: 'https://tiktok.com',
  shipping_default_cost: '15000',
  shipping_free_threshold: '200000',
  popup_enabled: 'true',
  popup_title: '10% DE DESCUENTO EN TU PRIMERA COMPRA.',
  popup_text: 'SUSCRÍBETE Y RECIBE TU CUPÓN AL INSTANTE.',
  popup_coupon: 'BIENVENIDA10',
  low_stock_alert: 'true',
};

// ---------------------------------------------------------
// MENSAJES REUTILIZABLES
// ---------------------------------------------------------
export const MESSAGES = {
  genericError: 'ALGO SALIÓ MAL. INTENTA NUEVAMENTE.',
  noResults: 'NO ENCONTRAMOS PRODUCTOS PARA TU BÚSQUEDA.',
  couponApplied: '¡CUPÓN APLICADO CORRECTAMENTE!',
  couponInvalid: 'EL CUPÓN NO ES VÁLIDO O HA EXPIRADO.',
  addedToCart: 'PRODUCTO AGREGADO AL CARRITO.',
  addedToFavorites: 'AGREGADO A FAVORITOS.',
  removedFromFavorites: 'ELIMINADO DE FAVORITOS.',
  cartReminder: 'TIENES PRODUCTOS ESPERÁNDOTE 💗',
  unauthorized: 'NO TIENES PERMISO PARA REALIZAR ESTA ACCIÓN.',
  notFound: 'NO ENCONTRAMOS LO QUE BUSCAS.',
  outOfStock: 'AGOTADO',
  loginRequired: 'INICIA SESIÓN PARA CONTINUAR.',
} as const;
