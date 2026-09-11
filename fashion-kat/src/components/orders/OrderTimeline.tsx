import { TRACKING_STEPS, ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, cn } from '@/lib/utils';

export function OrderTimeline({
  status,
  history,
}: {
  status: string;
  history: { toStatus: string; createdAt: string }[];
}) {
  if (status === 'CANCELADO') {
    return (
      <div className="border border-red-200 bg-red-50 p-6">
        <p className="text-[11px] font-semibold tracking-brand text-red-700">PEDIDO CANCELADO</p>
        <p className="mt-2 text-[10px] leading-relaxed tracking-wider2 text-red-600">
          ESTE PEDIDO FUE CANCELADO. SI TIENES DUDAS, ESCRÍBENOS Y TE AYUDAMOS.
        </p>
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="relative flex flex-col gap-0">
      {TRACKING_STEPS.map((step, index) => {
        const done = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const event = history.find((h) => h.toStatus === step.status);

        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
            {index < TRACKING_STEPS.length - 1 && (
              <span
                className={cn(
                  'absolute left-[11px] top-6 h-full w-px',
                  done && index < currentIndex ? 'bg-rose-500' : 'bg-smoke-300'
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                done ? 'border-rose-500 bg-rose-500 text-white' : 'border-smoke-300 bg-white text-smoke-400'
              )}
            >
              {done ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </span>

            <div className="pt-0.5">
              <p
                className={cn(
                  'text-[11px] font-semibold tracking-brand',
                  isCurrent ? 'text-rose-500' : done ? 'text-ink-950' : 'text-smoke-500'
                )}
              >
                {step.label}
              </p>
              {event && (
                <p className="mt-1 text-[9px] tracking-brand text-smoke-500">
                  {formatDateTime(event.createdAt)}
                </p>
              )}
              {isCurrent && (
                <p className="mt-1 text-[9px] tracking-brand text-rose-500">
                  ESTADO ACTUAL: {ORDER_STATUS_LABELS[status]}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
