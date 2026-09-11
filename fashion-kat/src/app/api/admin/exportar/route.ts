import { prisma } from '@/lib/prisma';
import { fail, handleError } from '@/lib/api';
import { requireAdmin } from '@/lib/session';
import { formatDateShort } from '@/lib/utils';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// ESCAPA UN VALOR PARA CSV
function cell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(cell).join(';')];
  rows.forEach((r) => lines.push(r.map(cell).join(';')));
  // BOM PARA QUE EXCEL RECONOZCA LOS ACENTOS
  return '﻿' + lines.join('\r\n');
}

export async function GET(request: Request) {
  try {
    await requireAdmin('dashboard');
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') ?? 'pedidos';

    let csv = '';
    let filename = 'exportacion.csv';

    if (tipo === 'pedidos') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      });
      csv = toCsv(
        ['PEDIDO', 'FECHA', 'CLIENTE', 'CORREO', 'TELEFONO', 'CIUDAD', 'DEPARTAMENTO', 'ESTADO', 'PAGO', 'SUBTOTAL', 'DESCUENTO', 'ENVIO', 'TOTAL', 'PRODUCTOS'],
        orders.map((o) => [
          o.orderNumber,
          formatDateShort(o.createdAt),
          `${o.firstName} ${o.lastName}`,
          o.email,
          o.phone,
          o.city,
          o.state,
          ORDER_STATUS_LABELS[o.status] ?? o.status,
          PAYMENT_METHOD_LABELS[o.paymentMethod] ?? o.paymentMethod,
          o.subtotal,
          o.discount,
          o.shippingCost,
          o.total,
          o.items.map((i) => `${i.productName} x${i.quantity}`).join(' | '),
        ])
      );
      filename = 'fashion-kat-pedidos.csv';
    } else if (tipo === 'clientes') {
      const users = await prisma.user.findMany({
        where: { role: 'CLIENTE' },
        orderBy: { createdAt: 'desc' },
        include: { orders: { select: { total: true, status: true } } },
      });
      csv = toCsv(
        ['NOMBRE', 'APELLIDO', 'CORREO', 'TELEFONO', 'ESTADO', 'REGISTRO', 'PEDIDOS', 'TOTAL GASTADO'],
        users.map((u) => [
          u.firstName,
          u.lastName,
          u.email,
          u.phone ?? '',
          u.status,
          formatDateShort(u.createdAt),
          u.orders.length,
          u.orders.filter((o) => o.status !== 'CANCELADO').reduce((s, o) => s + o.total, 0),
        ])
      );
      filename = 'fashion-kat-clientes.csv';
    } else if (tipo === 'productos') {
      const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        include: { category: true },
      });
      csv = toCsv(
        ['SKU', 'NOMBRE', 'CATEGORIA', 'PRECIO', 'PRECIO ANTERIOR', 'DESCUENTO %', 'STOCK', 'STOCK MINIMO', 'VENDIDOS', 'ESTADO', 'VALORACION'],
        products.map((p) => [
          p.sku,
          p.name,
          p.category.name,
          p.price,
          p.comparePrice ?? '',
          p.discountPercent,
          p.stock,
          p.minStock,
          p.soldCount,
          p.status,
          p.rating,
        ])
      );
      filename = 'fashion-kat-productos.csv';
    } else if (tipo === 'inventario') {
      const variants = await prisma.productVariant.findMany({
        include: { product: { include: { category: true } } },
        orderBy: { stock: 'asc' },
      });
      csv = toCsv(
        ['SKU VARIANTE', 'PRODUCTO', 'CATEGORIA', 'TALLA', 'COLOR', 'STOCK', 'STOCK MINIMO PRODUCTO', 'ESTADO'],
        variants.map((v) => [
          v.sku,
          v.product.name,
          v.product.category.name,
          v.size,
          v.color,
          v.stock,
          v.product.minStock,
          v.stock <= 0 ? 'AGOTADO' : v.stock <= v.product.minStock ? 'STOCK BAJO' : 'DISPONIBLE',
        ])
      );
      filename = 'fashion-kat-inventario.csv';
    } else if (tipo === 'ventas') {
      const items = await prisma.orderItem.findMany({
        include: { order: true },
        orderBy: { order: { createdAt: 'desc' } },
      });
      csv = toCsv(
        ['PEDIDO', 'FECHA', 'PRODUCTO', 'SKU', 'TALLA', 'COLOR', 'CANTIDAD', 'PRECIO UNITARIO', 'SUBTOTAL', 'ESTADO PEDIDO'],
        items.map((i) => [
          i.order.orderNumber,
          formatDateShort(i.order.createdAt),
          i.productName,
          i.productSku,
          i.size ?? '',
          i.color ?? '',
          i.quantity,
          i.unitPrice,
          i.subtotal,
          ORDER_STATUS_LABELS[i.order.status] ?? i.order.status,
        ])
      );
      filename = 'fashion-kat-ventas.csv';
    } else {
      return fail('TIPO DE EXPORTACIÓN NO VÁLIDO.', 400);
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
