// ==========================================================
// TIPOS COMPARTIDOS ENTRE FRONTEND Y BACKEND
// ==========================================================

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string; issues?: unknown };

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
};

export type VariantDTO = {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  priceDiff: number;
  active: boolean;
};

export type ProductDTO = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number | null;
  discountPercent: number;
  brand: string;
  subcategory: string | null;
  tags: string[];
  images: string[];
  stock: number;
  minStock: number;
  soldCount: number;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  variants?: VariantDTO[];
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  position: number;
  active: boolean;
};

export type CatalogDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  productCount: number;
  position: number;
  active: boolean;
};

// LÍNEA CRUDA DEL CARRITO (LA QUE SE GUARDA EN LOCALSTORAGE / BASE DE DATOS)
export type CartLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
  savedForLater?: boolean;
};

// LÍNEA ENRIQUECIDA (PRECIOS Y STOCK SIEMPRE DESDE LA BASE DE DATOS)
export type ResolvedCartLine = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  sku: string;
  image: string | null;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  unitPrice: number;
  comparePrice: number | null;
  quantity: number;
  availableStock: number;
  subtotal: number;
  categoryId: string;
  categoryName: string;
  savedForLater: boolean;
  available: boolean;
  issue?: string;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
  freeShippingThreshold: number;
  missingForFreeShipping: number;
  couponCode: string | null;
  couponMessage: string | null;
  couponValid: boolean;
};

export type ResolvedCart = {
  lines: ResolvedCartLine[];
  savedLines: ResolvedCartLine[];
  totals: CartTotals;
};

export type OrderDTO = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  trackingCode: string | null;
  carrier: string | null;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string | null;
    notes: string | null;
  };
  items: {
    id: string;
    productId: string | null;
    productName: string;
    productSku: string;
    productImage: string | null;
    size: string | null;
    color: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  history: { id: string; toStatus: string; note: string | null; createdAt: string }[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
