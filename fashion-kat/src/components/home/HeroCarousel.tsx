'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import { cn } from '@/lib/utils';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  buttonText: string | null;
  link: string | null;
};

const FALLBACK: Banner = {
  id: 'fallback',
  title: 'MODA QUE HABLA POR TI',
  subtitle: 'DESCUBRE LAS ÚLTIMAS TENDENCIAS Y CREA UN ESTILO QUE SEA COMPLETAMENTE TUYO.',
  imageUrl: '',
  buttonText: 'COMPRAR AHORA',
  link: '/productos',
};

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const slides = banners.length > 0 ? banners : [FALLBACK];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="relative h-[82vh] min-h-[540px] w-full overflow-hidden bg-ink-950">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === index ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={i !== index}
        >
          <SafeImage
            src={slide.imageUrl}
            alt={slide.title}
            label={slide.title}
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/45 to-transparent" />

      <div className="container-fk relative flex h-full items-center">
        <div key={current.id} className="max-w-2xl animate-fade-up">
          <p className="eyebrow">FASHION KAT · NUEVA TEMPORADA</p>
          <h1 className="heading-xl mt-5 text-balance text-white">{current.title}</h1>
          {current.subtitle && (
            <p className="mt-6 max-w-lg text-[12px] leading-relaxed tracking-brand text-white/75">
              {current.subtitle}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={current.link ?? '/productos'} className="btn-primary">
              {current.buttonText ?? 'COMPRAR AHORA'}
            </Link>
            <Link href="/catalogo" className="btn-outline-light">
              VER CATÁLOGO
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`IR AL BANNER ${i + 1}`}
              className={cn(
                'h-1 transition-all duration-300',
                i === index ? 'w-10 bg-rose-500' : 'w-5 bg-white/45 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
