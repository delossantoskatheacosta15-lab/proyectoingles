'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader, StatCard, Badge, SearchInput, Select, TableWrapper, ErrorMessage } from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Rating } from '@/components/ui/Rating';
import { useToast } from '@/components/providers/ToastProvider';
import { formatNumber, formatDateShort, truncate, buildQuery } from '@/lib/utils';

type Review = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  authorName: string;
  rating: number;
  comment: string;
  status: 'PENDIENTE' | 'APROBADA' | 'OCULTA';
  createdAt: string;
};

type Summary = { total: number; pendientes: number; aprobadas: number; ocultas: number };

const ESTADOS = [
  { value: '', label: 'TODAS LAS RESEÑAS' },
  { value: 'PENDIENTE', label: 'PENDIENTES' },
  { value: 'APROBADA', label: 'APROBADAS' },
  { value: 'OCULTA', label: 'OCULTAS' },
];

function statusTone(status: Review['status']): 'green' | 'amber' | 'neutral' {
  if (status === 'APROBADA') return 'green';
  if (status === 'PENDIENTE') return 'amber';
  return 'neutral';
}

export function ReviewsView() {
  const { success, error: errorToast } = useToast();

  const [items, setItems] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, pendientes: 0, aprobadas: 0, ocultas: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);

  // RESUMEN: UNA PETICIÓN LIGERA POR CADA ESTADO
  const loadSummary = useCallback(async () => {
    try {
      const estados = ['PENDIENTE', 'APROBADA', 'OCULTA'];
      const responses = await Promise.all([
        fetch('/api/admin/resenas?tamano=1', { cache: 'no-store' }),
        ...estados.map((e) => fetch(`/api/admin/resenas?tamano=1&estado=${e}`, { cache: 'no-store' })),
      ]);
      const jsons = await Promise.all(responses.map((r) => r.json()));
      if (jsons.some((j) => !j.ok)) return;
      setSummary({
        total: jsons[0].data.total,
        pendientes: jsons[1].data.total,
        aprobadas: jsons[2].data.total,
        ocultas: jsons[3].data.total,
      });
    } catch {
      // EL RESUMEN ES INFORMATIVO: SI FALLA, LA TABLA SIGUE FUNCIONANDO
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/admin/resenas${buildQuery({ estado, q: search, pagina: page })}`,
        { cache: 'no-store' }
      );
      const json = await response.json();
      if (!json.ok) {
        setErrorMessage(json.error);
        errorToast(json.error);
        return;
      }
      setItems(json.data.items as Review[]);
      setTotalPages(json.data.totalPages);
      setTotal(json.data.total);
    } catch {
      setErrorMessage('NO FUE POSIBLE CARGAR LAS RESEÑAS.');
    } finally {
      setLoading(false);
    }
  }, [estado, search, page, errorToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function refreshAll() {
    await Promise.all([load(), loadSummary()]);
  }

  async function changeStatus(review: Review, status: 'APROBADA' | 'OCULTA') {
    try {
      const response = await fetch(`/api/admin/resenas/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      await refreshAll();
    } catch {
      errorToast('NO FUE POSIBLE ACTUALIZAR LA RESEÑA.');
    }
  }

  async function removeReview(review: Review) {
    try {
      const response = await fetch(`/api/admin/resenas/${review.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      await refreshAll();
    } catch {
      errorToast('NO FUE POSIBLE ELIMINAR LA RESEÑA.');
    }
  }

  return (
    <>
      <PageHeader
        title="RESEÑAS DE PRODUCTOS"
        description="MODERA LAS OPINIONES DE TUS CLIENTES: APRUEBA LAS QUE QUIERES PUBLICAR Y OCULTA LAS QUE NO CORRESPONDEN."
      />

      <ErrorMessage message={errorMessage} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="TOTAL" value={formatNumber(summary.total)} />
        <StatCard
          label="PENDIENTES"
          value={formatNumber(summary.pendientes)}
          hint="ESPERAN TU APROBACIÓN"
          accent={summary.pendientes > 0}
        />
        <StatCard label="APROBADAS" value={formatNumber(summary.aprobadas)} hint="VISIBLES EN LA TIENDA" />
        <StatCard label="OCULTAS" value={formatNumber(summary.ocultas)} />
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="BUSCAR POR CLIENTE O PRODUCTO…" />
        <Select
          value={estado}
          onChange={(value) => {
            setEstado(value);
            setPage(1);
          }}
          options={ESTADOS}
          label="FILTRAR POR ESTADO"
        />
        <span className="text-[10px] tracking-brand text-smoke-600">
          {formatNumber(total)} RESEÑAS ENCONTRADAS
        </span>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : items.length === 0 ? (
        <div className="border border-smoke-300 bg-white px-6 py-16 text-center">
          <p className="text-[11px] font-semibold tracking-brand text-ink-950">
            NO HAY RESEÑAS PARA MOSTRAR.
          </p>
          <p className="mt-2 text-[10px] tracking-wider2 text-smoke-600">
            AJUSTA LOS FILTROS O ESPERA A QUE TUS CLIENTES DEJEN SUS OPINIONES.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>CLIENTE</th>
              <th>ESTRELLAS</th>
              <th>COMENTARIO</th>
              <th>FECHA</th>
              <th>ESTADO</th>
              <th className="text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.map((review) => (
              <tr key={review.id}>
                <td>
                  <a
                    href={`/producto/${review.productSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-rose-500"
                  >
                    {review.productName}
                  </a>
                </td>
                <td className="font-medium text-ink-900">{review.authorName}</td>
                <td>
                  <Rating value={review.rating} />
                </td>
                <td className="max-w-[280px] text-smoke-700">{truncate(review.comment, 90)}</td>
                <td>{formatDateShort(review.createdAt)}</td>
                <td>
                  <Badge tone={statusTone(review.status)}>{review.status}</Badge>
                </td>
                <td>
                  <div className="flex flex-wrap justify-end gap-2">
                    {review.status !== 'APROBADA' && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => void changeStatus(review, 'APROBADA')}
                      >
                        APROBAR
                      </button>
                    )}
                    {review.status !== 'OCULTA' && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => void changeStatus(review, 'OCULTA')}
                      >
                        OCULTAR
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-ghost btn-sm text-red-600 hover:border-red-600 hover:text-red-700"
                      onClick={() => setConfirmDelete(review)}
                    >
                      ELIMINAR
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      )}

      {!loading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-7" />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="ELIMINAR RESEÑA"
        message={`¿SEGURO QUE DESEAS ELIMINAR LA RESEÑA DE ${confirmDelete?.authorName ?? ''}? ESTA ACCIÓN NO SE PUEDE DESHACER.`}
        confirmText="SÍ, ELIMINAR"
        danger
        onConfirm={() => {
          if (confirmDelete) void removeReview(confirmDelete);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
