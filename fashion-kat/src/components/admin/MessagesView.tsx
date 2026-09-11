'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHeader, Badge, ErrorMessage } from '@/components/admin/AdminUI';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { LoadingBlock } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/providers/ToastProvider';
import { cn, formatNumber, formatDateTime, truncate, buildQuery } from '@/lib/utils';

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'NUEVO' | 'LEIDO' | 'RESPONDIDO';
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
};

type Summary = { TODOS: number; NUEVO: number; LEIDO: number; RESPONDIDO: number };

const TABS: { value: string; label: string; key: keyof Summary }[] = [
  { value: '', label: 'TODOS', key: 'TODOS' },
  { value: 'NUEVO', label: 'NUEVOS', key: 'NUEVO' },
  { value: 'LEIDO', label: 'LEÍDOS', key: 'LEIDO' },
  { value: 'RESPONDIDO', label: 'RESPONDIDOS', key: 'RESPONDIDO' },
];

function statusTone(status: Message['status']): 'rose' | 'amber' | 'green' {
  if (status === 'NUEVO') return 'rose';
  if (status === 'LEIDO') return 'amber';
  return 'green';
}

export function MessagesView() {
  const { success, error: errorToast } = useToast();

  const [items, setItems] = useState<Message[]>([]);
  const [summary, setSummary] = useState<Summary>({ TODOS: 0, NUEVO: 0, LEIDO: 0, RESPONDIDO: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Message | null>(null);

  // EVITA MARCAR VARIAS VECES EL MISMO MENSAJE COMO LEÍDO
  const markedRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/mensajes${buildQuery({ estado, pagina: page })}`, {
        cache: 'no-store',
      });
      const json = await response.json();
      if (!json.ok) {
        setErrorMessage(json.error);
        errorToast(json.error);
        return;
      }
      setItems(json.data.items as Message[]);
      setSummary(json.data.summary as Summary);
      setTotalPages(json.data.totalPages);
    } catch {
      setErrorMessage('NO FUE POSIBLE CARGAR LOS MENSAJES.');
    } finally {
      setLoading(false);
    }
  }, [estado, page, errorToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = items.find((m) => m.id === selectedId) ?? null;

  // AL CAMBIAR DE MENSAJE, REINICIA EL CUADRO DE RESPUESTA
  useEffect(() => {
    setReply('');
  }, [selectedId]);

  async function markAsRead(message: Message) {
    if (markedRef.current.has(message.id)) return;
    markedRef.current.add(message.id);
    try {
      const response = await fetch(`/api/admin/mensajes/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LEIDO' }),
      });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      await load();
    } catch {
      // SI FALLA EL MARCADO AUTOMÁTICO NO INTERRUMPIMOS LA LECTURA
    }
  }

  function selectMessage(message: Message) {
    setSelectedId(message.id);
    setDetailOpen(true);
    if (message.status === 'NUEVO') void markAsRead(message);
  }

  async function sendReply() {
    if (!selected) return;
    const text = reply.trim();
    if (text.length === 0) {
      errorToast('ESCRIBE UNA RESPUESTA ANTES DE ENVIARLA.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch(`/api/admin/mensajes/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: text }),
      });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      setReply('');
      await load();
    } catch {
      errorToast('NO FUE POSIBLE ENVIAR LA RESPUESTA.');
    } finally {
      setSending(false);
    }
  }

  async function removeMessage(message: Message) {
    try {
      const response = await fetch(`/api/admin/mensajes/${message.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!json.ok) {
        errorToast(json.error);
        return;
      }
      success(json.data.message);
      if (selectedId === message.id) {
        setSelectedId(null);
        setDetailOpen(false);
      }
      await load();
    } catch {
      errorToast('NO FUE POSIBLE ELIMINAR EL MENSAJE.');
    }
  }

  const detail = selected && (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[9px] font-semibold tracking-brand text-smoke-500">ASUNTO</p>
        <h3 className="mt-1.5 text-[14px] font-semibold tracking-wider2 text-ink-950">
          {selected.subject}
        </h3>
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
          <span className="text-[9px] tracking-brand text-smoke-500">
            {formatDateTime(selected.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 border border-smoke-300 bg-smoke-100 px-4 py-4 sm:grid-cols-3">
        <div>
          <p className="text-[9px] font-semibold tracking-brand text-smoke-500">NOMBRE</p>
          <p className="mt-1 text-[11px] tracking-wide text-ink-900">{selected.name}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-brand text-smoke-500">CORREO</p>
          <a
            href={`mailto:${selected.email}`}
            className="mt-1 block truncate text-[11px] tracking-wide text-rose-500"
          >
            {selected.email}
          </a>
        </div>
        <div>
          <p className="text-[9px] font-semibold tracking-brand text-smoke-500">TELÉFONO</p>
          {selected.phone ? (
            <a href={`tel:${selected.phone}`} className="mt-1 block text-[11px] tracking-wide text-ink-900">
              {selected.phone}
            </a>
          ) : (
            <p className="mt-1 text-[11px] tracking-wide text-smoke-500">NO REGISTRADO</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-[9px] font-semibold tracking-brand text-smoke-500">MENSAJE</p>
        <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed tracking-wide text-ink-800">
          {selected.message}
        </p>
      </div>

      {selected.reply && (
        <div className="border-l-2 border-rose-500 bg-rose-50 px-4 py-4">
          <p className="text-[9px] font-semibold tracking-brand text-rose-600">RESPUESTA ENVIADA</p>
          <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed tracking-wide text-ink-800">
            {selected.reply}
          </p>
          {selected.repliedAt && (
            <p className="mt-2.5 text-[9px] tracking-brand text-smoke-600">
              ENVIADA EL {formatDateTime(selected.repliedAt)}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="form-label" htmlFor="respuesta-mensaje">
          {selected.reply ? 'ENVIAR OTRA RESPUESTA' : 'RESPONDER AL CLIENTE'}
        </label>
        <textarea
          id="respuesta-mensaje"
          rows={5}
          className="field resize-y"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="ESCRIBE AQUÍ TU RESPUESTA. SE ENVIARÁ AL CORREO DEL CLIENTE."
          maxLength={2000}
        />
        <p className="mt-1.5 text-[10px] tracking-wide text-smoke-600">
          LA RESPUESTA LLEGARÁ AL CORREO {selected.email.toUpperCase()} Y EL MENSAJE QUEDARÁ MARCADO
          COMO RESPONDIDO.
        </p>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          className="btn-ghost btn-sm text-red-600 hover:border-red-600 hover:text-red-700"
          onClick={() => setConfirmDelete(selected)}
        >
          ELIMINAR MENSAJE
        </button>
        <button type="button" className="btn-primary btn-sm" onClick={() => void sendReply()} disabled={sending}>
          {sending ? 'ENVIANDO…' : 'ENVIAR RESPUESTA'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="BANDEJA DE MENSAJES"
        description="LEE Y RESPONDE LAS CONSULTAS QUE TUS CLIENTES ENVÍAN DESDE EL FORMULARIO DE CONTACTO."
      />

      <ErrorMessage message={errorMessage} />

      {/* PESTAÑAS DE FILTRO */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setEstado(tab.value);
              setPage(1);
            }}
            className={cn(
              'inline-flex items-center gap-2 border px-4 py-2.5 text-[10px] font-semibold tracking-brand transition-colors',
              estado === tab.value
                ? 'border-ink-950 bg-ink-950 text-white'
                : 'border-smoke-300 bg-white text-ink-700 hover:border-ink-950'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'px-1.5 py-0.5 text-[9px] font-bold',
                estado === tab.value ? 'bg-rose-500 text-white' : 'bg-smoke-200 text-ink-700'
              )}
            >
              {formatNumber(summary[tab.key] ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingBlock text="CARGANDO LOS MENSAJES…" />
      ) : items.length === 0 ? (
        <div className="border border-smoke-300 bg-white px-6 py-16 text-center">
          <p className="text-[11px] font-semibold tracking-brand text-ink-950">
            NO HAY MENSAJES EN ESTA BANDEJA.
          </p>
          <p className="mt-2 text-[10px] tracking-wider2 text-smoke-600">
            CUANDO UN CLIENTE ESCRIBA DESDE LA PÁGINA DE CONTACTO, APARECERÁ AQUÍ.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* LISTA */}
          <ul className="flex max-h-[70vh] flex-col divide-y divide-smoke-200 overflow-y-auto border border-smoke-300 bg-white">
            {items.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => selectMessage(message)}
                  className={cn(
                    'w-full px-4 py-4 text-left transition-colors hover:bg-rose-50/50',
                    selectedId === message.id && 'bg-rose-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        'truncate text-[11px] tracking-wider2 text-ink-950',
                        message.status === 'NUEVO' ? 'font-bold' : 'font-medium'
                      )}
                    >
                      {message.name}
                    </p>
                    <Badge tone={statusTone(message.status)}>{message.status}</Badge>
                  </div>
                  <p className="mt-1.5 truncate text-[10px] font-semibold tracking-brand text-ink-700">
                    {message.subject}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed tracking-wide text-smoke-600">
                    {truncate(message.message, 78)}
                  </p>
                  <p className="mt-2 text-[9px] tracking-brand text-smoke-500">
                    {formatDateTime(message.createdAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {/* DETALLE EN ESCRITORIO */}
          <section className="hidden border border-smoke-300 bg-white p-6 lg:block">
            {selected ? (
              detail
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                <p className="text-[11px] font-semibold tracking-brand text-ink-950">
                  SELECCIONA UN MENSAJE
                </p>
                <p className="mt-2 text-[10px] tracking-wider2 text-smoke-600">
                  ELIGE UNA CONVERSACIÓN DE LA LISTA PARA VER EL DETALLE Y RESPONDER.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-7" />
      )}

      {/* DETALLE EN MÓVIL */}
      <div className="lg:hidden">
        <Modal
          open={detailOpen && !!selected}
          onClose={() => setDetailOpen(false)}
          title="DETALLE DEL MENSAJE"
          size="lg"
        >
          {detail}
        </Modal>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="ELIMINAR MENSAJE"
        message={`¿SEGURO QUE DESEAS ELIMINAR EL MENSAJE DE ${confirmDelete?.name ?? ''}? ESTA ACCIÓN NO SE PUEDE DESHACER.`}
        confirmText="SÍ, ELIMINAR"
        danger
        onConfirm={() => {
          if (confirmDelete) void removeMessage(confirmDelete);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
