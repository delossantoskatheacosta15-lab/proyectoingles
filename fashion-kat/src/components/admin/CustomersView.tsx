'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  PageHeader,
  Panel,
  Badge,
  SearchInput,
  Select,
  TableWrapper,
  ErrorMessage,
} from '@/components/admin/AdminUI';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { formatCOP, formatDateShort, formatNumber, buildQuery } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';

type CustomerRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  totalSpent: number;
};

type CustomersPayload = {
  items: CustomerRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const ROLE_OPTIONS = [
  { value: '', label: 'TODOS LOS ROLES' },
  { value: 'CLIENTE', label: 'CLIENTE' },
  { value: 'ADMIN', label: 'ADMINISTRADOR' },
  { value: 'EDITOR', label: 'EDITOR' },
  { value: 'OPERADOR', label: 'OPERADOR' },
];

function statusTone(status: string): 'green' | 'amber' | 'red' | 'neutral' {
  if (status === 'ACTIVO') return 'green';
  if (status === 'INACTIVO') return 'amber';
  if (status === 'BLOQUEADO') return 'red';
  return 'neutral';
}

export function CustomersView() {
  const [data, setData] = useState<CustomersPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [rol, setRol] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/clientes${buildQuery({ q, rol, pagina: page })}`, {
        cache: 'no-store',
      });
      const json = await response.json();
      if (json.ok) setData(json.data);
      else setError(json.error ?? 'NO FUE POSIBLE CARGAR LOS CLIENTES.');
    } catch {
      setError('NO FUE POSIBLE CONECTAR CON EL SERVIDOR.');
    } finally {
      setLoading(false);
    }
  }, [q, rol, page]);

  // BÚSQUEDA CON PEQUEÑO RETARDO PARA NO SATURAR EL SERVIDOR
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 280);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <>
      <PageHeader
        title="CLIENTES"
        description="CONSULTA TODAS LAS PERSONAS REGISTRADAS EN LA TIENDA, SUS PEDIDOS Y CUÁNTO HAN COMPRADO."
        actions={
          <button
            type="button"
            className="btn-dark btn-sm"
            onClick={() => window.open('/api/admin/exportar?tipo=clientes', '_blank')}
          >
            EXPORTAR CSV
          </button>
        }
      />

      <ErrorMessage message={error} />

      <Panel className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="BUSCAR POR NOMBRE, CORREO O TELÉFONO…"
          />
          <Select
            value={rol}
            onChange={(value) => {
              setRol(value);
              setPage(1);
            }}
            options={ROLE_OPTIONS}
            label="FILTRAR POR ROL"
          />
          {data && (
            <span className="ml-auto text-[10px] font-semibold tracking-brand text-smoke-600">
              {formatNumber(data.total)} CLIENTES ENCONTRADOS
            </span>
          )}
        </div>
      </Panel>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : !data || data.items.length === 0 ? (
        <p className="border border-smoke-300 bg-white px-5 py-12 text-center text-[11px] font-semibold tracking-brand text-smoke-600">
          NO ENCONTRAMOS CLIENTES CON ESTOS FILTROS.
        </p>
      ) : (
        <>
          <TableWrapper>
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>TELÉFONO</th>
                <th className="text-right">PEDIDOS</th>
                <th className="text-right">TOTAL GASTADO</th>
                <th>ROL</th>
                <th>ESTADO</th>
                <th>REGISTRO</th>
                <th className="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <p className="font-semibold tracking-wider2 text-ink-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="normal-case-force mt-0.5 text-[10px] text-smoke-600">
                      {customer.email}
                    </p>
                  </td>
                  <td className="normal-case-force">{customer.phone || '—'}</td>
                  <td className="text-right">{formatNumber(customer.orderCount)}</td>
                  <td className="text-right font-semibold">{formatCOP(customer.totalSpent)}</td>
                  <td>{ROLE_LABELS[customer.role] ?? customer.role}</td>
                  <td>
                    <Badge tone={statusTone(customer.status)}>{customer.status}</Badge>
                  </td>
                  <td>{formatDateShort(customer.createdAt)}</td>
                  <td className="text-right">
                    <Link href={`/admin/clientes/${customer.id}`} className="btn-ghost btn-sm">
                      VER
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrapper>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={setPage}
            className="mt-6"
          />
        </>
      )}
    </>
  );
}
