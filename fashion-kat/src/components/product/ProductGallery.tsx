'use client';

import { useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { cn } from '@/lib/utils';

export function ProductGallery({
  images,
  name,
  badges,
}: {
  images: string[];
  name: string;
  badges?: React.ReactNode;
}) {
  const list = images.length > 0 ? images : [''];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const frameRef = useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:gap-5">
      {/* IMAGEN PRINCIPAL CON ZOOM */}
      <div
        ref={frameRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-[3/4] w-full flex-1 cursor-zoom-in overflow-hidden bg-smoke-200"
      >
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: zoom ? 'scale(1.9)' : 'scale(1)', transformOrigin: origin }}
        >
          <SafeImage
            src={list[active]}
            alt={`${name} — IMAGEN ${active + 1}`}
            label={name}
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
        {badges && <div className="absolute left-4 top-4 flex flex-col gap-2">{badges}</div>}
        <div className="pointer-events-none absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 text-[9px] font-semibold tracking-brand text-ink-800">
          PASA EL CURSOR PARA AMPLIAR
        </div>
      </div>

      {/* MINIATURAS */}
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:w-24 lg:flex-col lg:overflow-visible">
          {list.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`VER IMAGEN ${index + 1}`}
              className={cn(
                'relative aspect-[3/4] w-20 shrink-0 overflow-hidden border bg-smoke-200 transition-colors lg:w-full',
                active === index ? 'border-rose-500' : 'border-transparent hover:border-ink-950'
              )}
            >
              <SafeImage src={image} alt={`${name} — MINIATURA ${index + 1}`} label={name} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
