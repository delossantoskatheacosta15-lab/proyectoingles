import { splitImages, splitTags, discountPercent } from '@/lib/utils';
import type { ProductDTO, CategoryDTO, CatalogDTO, OrderDTO } from '@/lib/types';

// CONVIERTE REGISTROS DE PRISMA EN OBJETOS SEGUROS PARA EL CLIENTE
export function toProductDTO(product: any): ProductDTO {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: product.price,
    comparePrice: product.comparePrice ?? null,
    discountPercent: product.discountPercent || discountPercent(product.price, product.comparePrice),
    brand: product.brand,
    subcategory: product.subcategory ?? null,
    tags: splitTags(product.tags),
    images: splitImages(product.images),
    stock: product.stock,
    minStock: product.minStock,
    soldCount: product.soldCount,
    status: product.status,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isOnSale: product.isOnSale,
    rating: product.rating,
    reviewCount: product.reviewCount,
    createdAt: new Date(product.createdAt).toISOString(),
    category: product.category
      ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
      : { id: product.categoryId, name: '', slug: '' },
    variants: product.variants
      ? product.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock,
          priceDiff: v.priceDiff,
          active: v.active,
        }))
      : undefined,
  };
}

export function toCategoryDTO(category: any): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    imageUrl: category.imageUrl ?? null,
    productCount: category._count?.products ?? category.productCount ?? 0,
    position: category.position,
    active: category.active,
  };
}

export function toCatalogDTO(catalog: any): CatalogDTO {
  return {
    id: catalog.id,
    name: catalog.name,
    slug: catalog.slug,
    description: catalog.description ?? null,
    coverUrl: catalog.coverUrl ?? null,
    productCount: catalog._count?.products ?? catalog.productCount ?? 0,
    position: catalog.position,
    active: catalog.active,
  };
}

export function toOrderDTO(order: any): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
    createdAt: new Date(order.createdAt).toISOString(),
    trackingCode: order.trackingCode ?? null,
    carrier: order.carrier ?? null,
    customer: {
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
    },
    address: {
      street: order.street,
      neighborhood: order.neighborhood,
      city: order.city,
      state: order.state,
      postalCode: order.postalCode ?? null,
      notes: order.notes ?? null,
    },
    items: (order.items ?? []).map((item: any) => ({
      id: item.id,
      productId: item.productId ?? null,
      productName: item.productName,
      productSku: item.productSku,
      productImage: item.productImage ?? null,
      size: item.size ?? null,
      color: item.color ?? null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    history: (order.statusHistory ?? []).map((h: any) => ({
      id: h.id,
      toStatus: h.toStatus,
      note: h.note ?? null,
      createdAt: new Date(h.createdAt).toISOString(),
    })),
  };
}
