'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader, Panel, ErrorMessage } from '@/components/admin/AdminUI';
import { SafeImage } from '@/components/ui/SafeImage';
import { Spinner, LoadingBlock } from '@/components/ui/Skeleton';
import { useToast } from '@/components/providers/ToastProvider';
import { IconPlus, IconTrash } from '@/components/ui/Icons';
import { COLORS, COLOR_HEX, SIZES, SHOE_SIZES, PRODUCT_STATUSES } from '@/lib/constants';
import { formatCOP, slugify, discountPercent } from '@/lib/utils';
import type { CategoryDTO, ProductDTO } from '@/lib/types';

type VariantRow = {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  priceDiff: number;
  active: boolean;
};

type FormState = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number | '';
  categoryId: string;
  subcategory: string;
  brand: string;
  tags: string;
  images: string[];
  stock: number;
  minStock: number;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  metaTitle: string;
  metaDescription: string;
  variants: VariantRow[];
};

const EMPTY: FormState = {
  sku: '',
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: 0,
  comparePrice: '',
  categoryId: '',
  subcategory: '',
  brand: 'FASHION KAT',
  tags: '',
  images: [],
  stock: 0,
  minStock: 5,
  status: 'BORRADOR',
  isFeatured: false,
  isNew: true,
  isOnSale: false,
  metaTitle: '',
  metaDescription: '',
  variants: [],
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { success, error } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [imageInput, setImageInput] = useState('');

  const set = useCallback((patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch })), []);

  useEffect(() => {
    (async () => {
      const response = await fetch('/api/admin/categorias', { cache: 'no-store' });
      const json = await response.json();
      if (json.ok) {
        setCategories(json.data.categories);
        setForm((f) => (f.categoryId ? f : { ...f, categoryId: json.data.categories[0]?.id ?? '' }));
      }
    })();
  }, []);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const response = await fetch(`/api/admin/productos/${productId}`, { cache: 'no-store' });
        const json = await response.json();
        if (!json.ok) {
          setMessage(json.error);
          return;
        }
        const p: ProductDTO = json.data.product;
        setForm({
          sku: p.sku,
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          comparePrice: p.comparePrice ?? '',
          categoryId: p.category.id,
          subcategory: p.subcategory ?? '',
          brand: p.brand,
          tags: p.tags.join(', '),
          images: p.images,
          stock: p.stock,
          minStock: p.minStock,
          status: p.status,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          isOnSale: p.isOnSale,
          metaTitle: '',
          metaDescription: '',
          variants: (p.variants ?? []).map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
            priceDiff: v.priceDiff,
            active: v.active,
          })),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const totalVariantStock = useMemo(
    () => form.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
    [form.variants]
  );

  const discount = useMemo(
    () => discountPercent(Number(form.price) || 0, form.comparePrice === '' ? null : Number(form.comparePrice)),
    [form.price, form.comparePrice]
  );

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      error('LA IMAGEN DEBE SER UNA URL QUE EMPIECE POR HTTP O HTTPS.');
      return;
    }
    if (form.images.includes(url)) {
      error('ESA IMAGEN YA ESTÁ EN LA LISTA.');
      return;
    }
    set({ images: [...form.images, url] });
    setImageInput('');
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const next = [...form.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set({ images: next });
  };

  const addVariant = () => {
    set({
      variants: [
        ...form.variants,
        { size: 'M', color: 'NEGRO', colorHex: COLOR_HEX.NEGRO, stock: 10, priceDiff: 0, active: true },
      ],
    });
  };

  // GENERA TODAS LAS COMBINACIONES DE TALLA Y COLOR SELECCIONADAS
  const generateVariants = (sizes: readonly string[], colors: string[]) => {
    const existing = new Map<string, VariantRow>(
      form.variants.map((v) => [`${v.size}|${v.color}`, v] as [string, VariantRow])
    );
    const next: VariantRow[] = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        const key = `${size}|${color}`;
        next.push(
          existing.get(key) ?? {
            size,
            color,
            colorHex: COLOR_HEX[color] ?? '#0A0A0A',
            stock: 10,
            priceDiff: 0,
            active: true,
          }
        );
      });
    });
    set({ variants: next });
  };

  const updateVariant = (index: number, patch: Partial<VariantRow>) => {
    const next = [...form.variants];
    next[index] = { ...next[index], ...patch };
    if (patch.color) next[index].colorHex = COLOR_HEX[patch.color] ?? next[index].colorHex;
    set({ variants: next });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (form.images.length === 0) {
      setMessage('AGREGA AL MENOS UNA IMAGEN DEL PRODUCTO.');
      return;
    }
    if (!form.categoryId) {
      setMessage('SELECCIONA UNA CATEGORÍA.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sku: form.sku,
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price) || 0,
        comparePrice: form.comparePrice === '' ? null : Number(form.comparePrice),
        categoryId: form.categoryId,
        subcategory: form.subcategory,
        brand: form.brand,
        tags: form.tags,
        images: form.images,
        stock: form.variants.length ? totalVariantStock : Number(form.stock) || 0,
        minStock: Number(form.minStock) || 0,
        status: form.status,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        isOnSale: form.isOnSale,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        variants: form.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: Number(v.stock) || 0,
          priceDiff: Number(v.priceDiff) || 0,
          active: v.active,
        })),
      };

      const response = await fetch(
        productId ? `/api/admin/productos/${productId}` : '/api/admin/productos',
        {
          method: productId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const json = await response.json();

      if (!json.ok) {
        setMessage(json.error);
        error(json.error);
        return;
      }

      success(json.data.message);
      router.push('/admin/productos');
      router.refresh();
    } catch {
      setMessage('ALGO SALIÓ MAL. INTENTA NUEVAMENTE.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock text="CARGANDO PRODUCTO…" />;

  return (
    <form onSubmit={submit}>
      <PageHeader
        title={productId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
        description="COMPLETA LA INFORMACIÓN DEL PRODUCTO, SUS IMÁGENES Y SUS VARIANTES DE TALLA Y COLOR."
        actions={
          <>
            <Link href="/admin/productos" className="btn-ghost btn-sm">
              CANCELAR
            </Link>
            <button type="submit" disabled={saving} className="btn-primary btn-sm">
              {saving ? <Spinner /> : productId ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
            </button>
          </>
        }
      />

      <ErrorMessage message={message} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Panel title="INFORMACIÓN BÁSICA">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="form-label">NOMBRE DEL PRODUCTO</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="field"
                  placeholder="VESTIDO NEGRO SATINADO MIDI"
                />
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => set({ sku: e.target.value })}
                  className="field"
                  placeholder="FK-VES-001"
                />
              </div>
              <div>
                <label className="form-label">URL AMIGABLE (SLUG)</label>
                <input
                  value={form.slug}
                  onChange={(e) => set({ slug: e.target.value })}
                  className="field normal-case-force"
                  placeholder={slugify(form.name) || 'se-genera-automaticamente'}
                />
              </div>
              <div>
                <label className="form-label">CATEGORÍA</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => set({ categoryId: e.target.value })}
                  className="field"
                >
                  <option value="">SELECCIONA…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">SUBCATEGORÍA</label>
                <input
                  value={form.subcategory}
                  onChange={(e) => set({ subcategory: e.target.value })}
                  className="field"
                  placeholder="MIDI, LARGO, BLAZER…"
                />
              </div>
              <div>
                <label className="form-label">MARCA</label>
                <input
                  value={form.brand}
                  onChange={(e) => set({ brand: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="form-label">ETIQUETAS (SEPARADAS POR COMA)</label>
                <input
                  value={form.tags}
                  onChange={(e) => set({ tags: e.target.value })}
                  className="field"
                  placeholder="VESTIDO, NEGRO, ELEGANTE"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">DESCRIPCIÓN CORTA</label>
                <input
                  required
                  maxLength={200}
                  value={form.shortDescription}
                  onChange={(e) => set({ shortDescription: e.target.value })}
                  className="field"
                  placeholder="RESUMEN QUE APARECE EN LA FICHA DEL PRODUCTO."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">DESCRIPCIÓN COMPLETA</label>
                <textarea
                  required
                  rows={6}
                  value={form.description}
                  onChange={(e) => set({ description: e.target.value })}
                  className="field resize-none"
                  placeholder="MATERIALES, CORTE, RECOMENDACIONES DE USO Y CUIDADO."
                />
              </div>
            </div>
          </Panel>

          <Panel title="IMÁGENES">
            <div className="flex gap-2">
              <input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
                className="field normal-case-force"
                placeholder="https://images.unsplash.com/photo-…"
              />
              <button type="button" onClick={addImage} className="btn-dark shrink-0 px-5 py-2.5">
                <IconPlus className="h-4 w-4" /> AGREGAR
              </button>
            </div>
            <p className="mt-2 text-[9px] leading-relaxed tracking-brand text-smoke-500">
              PEGA LA URL DE CADA IMAGEN. LA PRIMERA SERÁ LA PORTADA DEL PRODUCTO. TAMBIÉN PUEDES SUBIR
              TUS FOTOS A LA CARPETA /PUBLIC/UPLOADS Y USAR UNA RUTA COMO /UPLOADS/FOTO.JPG
            </p>

            {form.images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {form.images.map((image, index) => (
                  <div key={image} className="border border-smoke-300">
                    <div className="relative aspect-[3/4] bg-smoke-200">
                      <SafeImage src={image} alt={`IMAGEN ${index + 1}`} label={form.name} sizes="160px" />
                      {index === 0 && (
                        <span className="absolute left-2 top-2 badge-rose">PORTADA</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          className="text-[9px] font-semibold tracking-brand text-smoke-600 hover:text-rose-500"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          className="text-[9px] font-semibold tracking-brand text-smoke-600 hover:text-rose-500"
                        >
                          →
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => set({ images: form.images.filter((i) => i !== image) })}
                        aria-label="QUITAR IMAGEN"
                        className="text-smoke-500 hover:text-red-600"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="VARIANTES (TALLA Y COLOR)"
            action={
              <button type="button" onClick={addVariant} className="btn-ghost btn-sm">
                <IconPlus className="h-3.5 w-3.5" /> AGREGAR VARIANTE
              </button>
            }
          >
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => generateVariants(SIZES, ['NEGRO', 'ROSA', 'BLANCO'])}
                className="btn-ghost btn-sm"
              >
                GENERAR ROPA (XS A XL · 3 COLORES)
              </button>
              <button
                type="button"
                onClick={() => generateVariants(SHOE_SIZES, ['NEGRO', 'BEIGE'])}
                className="btn-ghost btn-sm"
              >
                GENERAR CALZADO (35 A 40 · 2 COLORES)
              </button>
              <button
                type="button"
                onClick={() => generateVariants(['ÚNICA'], ['NEGRO', 'ROSA'])}
                className="btn-ghost btn-sm"
              >
                GENERAR TALLA ÚNICA
              </button>
            </div>

            {form.variants.length === 0 ? (
              <p className="text-[10px] leading-relaxed tracking-brand text-smoke-600">
                ESTE PRODUCTO NO TIENE VARIANTES. SE USARÁ EL STOCK GENERAL QUE DEFINAS EN LA COLUMNA
                DERECHA.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="admin-table min-w-[620px]">
                  <thead>
                    <tr>
                      <th>TALLA</th>
                      <th>COLOR</th>
                      <th>STOCK</th>
                      <th>AJUSTE DE PRECIO</th>
                      <th>ACTIVA</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((variant, index) => (
                      <tr key={`${variant.size}-${variant.color}-${index}`}>
                        <td>
                          <input
                            value={variant.size}
                            onChange={(e) => updateVariant(index, { size: e.target.value.toUpperCase() })}
                            className="field w-24 py-1.5 text-[10px]"
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-5 w-5 border border-smoke-300"
                              style={{ backgroundColor: variant.colorHex }}
                            />
                            <select
                              value={variant.color}
                              onChange={(e) => updateVariant(index, { color: e.target.value })}
                              className="field w-32 py-1.5 text-[10px]"
                            >
                              {COLORS.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                            className="field w-20 py-1.5 text-[10px]"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={variant.priceDiff}
                            onChange={(e) => updateVariant(index, { priceDiff: Number(e.target.value) })}
                            className="field w-24 py-1.5 text-[10px]"
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={variant.active}
                            onChange={(e) => updateVariant(index, { active: e.target.checked })}
                            className="h-4 w-4 accent-rose-500"
                          />
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => set({ variants: form.variants.filter((_, i) => i !== index) })}
                            aria-label="QUITAR VARIANTE"
                            className="text-smoke-500 hover:text-red-600"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-[10px] font-semibold tracking-brand text-ink-950">
                  STOCK TOTAL CALCULADO: {totalVariantStock} UNIDADES
                </p>
              </div>
            )}
          </Panel>

          <Panel title="SEO">
            <div className="grid gap-4">
              <div>
                <label className="form-label">TÍTULO PARA BUSCADORES</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => set({ metaTitle: e.target.value })}
                  className="field"
                  placeholder="SE GENERA AUTOMÁTICAMENTE CON EL NOMBRE DEL PRODUCTO"
                />
              </div>
              <div>
                <label className="form-label">META DESCRIPCIÓN</label>
                <textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) => set({ metaDescription: e.target.value })}
                  className="field resize-none"
                  placeholder="SE GENERA AUTOMÁTICAMENTE CON LA DESCRIPCIÓN CORTA"
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="flex flex-col gap-5">
          <Panel title="PRECIO">
            <div className="grid gap-4">
              <div>
                <label className="form-label">PRECIO DE VENTA (COP)</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set({ price: Number(e.target.value) })}
                  className="field"
                />
              </div>
              <div>
                <label className="form-label">PRECIO ANTERIOR (OPCIONAL)</label>
                <input
                  type="number"
                  min={0}
                  value={form.comparePrice}
                  onChange={(e) =>
                    set({ comparePrice: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  className="field"
                />
              </div>
              <div className="border border-smoke-300 bg-smoke-100 p-3">
                <p className="text-[9px] tracking-brand text-smoke-600">PRECIO FINAL</p>
                <p className="mt-1 text-lg font-semibold tracking-wider2 text-rose-500">
                  {formatCOP(Number(form.price) || 0)}
                </p>
                {discount > 0 && (
                  <p className="mt-1 text-[9px] font-semibold tracking-brand text-ink-950">
                    DESCUENTO APLICADO: {discount}%
                  </p>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="INVENTARIO">
            <div className="grid gap-4">
              <div>
                <label className="form-label">STOCK GENERAL</label>
                <input
                  type="number"
                  min={0}
                  value={form.variants.length ? totalVariantStock : form.stock}
                  onChange={(e) => set({ stock: Number(e.target.value) })}
                  disabled={form.variants.length > 0}
                  className="field disabled:bg-smoke-100 disabled:text-smoke-600"
                />
                {form.variants.length > 0 && (
                  <p className="mt-1.5 text-[9px] tracking-brand text-smoke-500">
                    SE CALCULA AUTOMÁTICAMENTE SUMANDO EL STOCK DE LAS VARIANTES.
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">STOCK MÍNIMO (ALERTA)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minStock}
                  onChange={(e) => set({ minStock: Number(e.target.value) })}
                  className="field"
                />
              </div>
            </div>
          </Panel>

          <Panel title="PUBLICACIÓN">
            <div className="grid gap-4">
              <div>
                <label className="form-label">ESTADO</label>
                <select
                  value={form.status}
                  onChange={(e) => set({ status: e.target.value })}
                  className="field"
                >
                  {PRODUCT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[9px] leading-relaxed tracking-brand text-smoke-500">
                  ACTIVO SE MUESTRA EN LA TIENDA · OCULTO Y BORRADOR NO SON VISIBLES PARA LAS CLIENTAS.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set({ isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-rose-500"
                />
                <span className="text-[10px] tracking-brand text-ink-800">
                  DESTACADO (APARECE EN “MÁS VENDIDOS”)
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => set({ isNew: e.target.checked })}
                  className="h-4 w-4 accent-rose-500"
                />
                <span className="text-[10px] tracking-brand text-ink-800">
                  NUEVO (APARECE EN “NUEVA COLECCIÓN”)
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.isOnSale}
                  onChange={(e) => set({ isOnSale: e.target.checked })}
                  className="h-4 w-4 accent-rose-500"
                />
                <span className="text-[10px] tracking-brand text-ink-800">
                  EN OFERTA (APARECE EN “OFERTAS DE LA SEMANA”)
                </span>
              </label>
            </div>
          </Panel>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <Spinner /> : productId ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
          </button>
        </div>
      </div>
    </form>
  );
}
