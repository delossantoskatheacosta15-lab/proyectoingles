'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ==========================================================
// IMAGEN CON RESPALDO DE MARCA
// SI LA FOTOGRAFÍA EXTERNA NO CARGA, SE MUESTRA UN FONDO
// NEGRO/ROSA CON EL NOMBRE DEL PRODUCTO EN LUGAR DE UN HUECO.
// ==========================================================

type Props = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  label?: string;
};

export function SafeImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = '(max-width: 768px) 50vw, 25vw',
  className,
  priority = false,
  label,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-950 via-ink-800 to-rose-700 p-4 text-center',
          className
        )}
        aria-label={alt}
        role="img"
      >
        <span className="text-[9px] font-semibold leading-relaxed tracking-brand text-white/90">
          {(label ?? alt).slice(0, 48)}
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        onError={() => setFailed(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 600}
      height={height ?? 800}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
