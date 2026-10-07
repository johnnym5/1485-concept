'use client';

import { useEffect, useRef } from 'react';

const checkpoints = [
  {
    start: 46,
    end: 110,
    title: 'FACADE ARTICULATION',
    subtitle: 'Projecting glazed bays · Timber and masonry finishes',
    kicker: '14.85 / BUILDING ENVELOPE',
  },
  {
    start: 111,
    end: 180,
    title: 'REINFORCED CONCRETE FRAME',
    subtitle: 'Column–beam structure · Slab and reinforcement sequence',
    kicker: '14.85 / STRUCTURAL SYSTEM',
  },
];

function smoothstep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export default function TypographyLayer() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = (event: Event) => {
      const frame = (event as CustomEvent<number>).detail as number;
      const blocks = layerRef.current?.querySelectorAll<HTMLElement>('[data-story-block]');
      if (!blocks) return;
      checkpoints.forEach((checkpoint, index) => {
        const element = blocks[index];
        if (!element) return;
        const duration = checkpoint.end - checkpoint.start + 1;
        const progress = Math.min(1, Math.max(0, (frame - checkpoint.start) / duration));
        const entryProgress = smoothstep((frame - checkpoint.start) / (reducedMotion ? 8 : 10));
        const fadeIn = entryProgress;
        const fadeOut = smoothstep((1 - progress) / 0.16);
        const opacity = fadeIn * fadeOut;
        const rise = (reducedMotion ? 12 : 40) * (1 - smoothstep(progress));
        const horizontalReveal = (reducedMotion ? 8 : 34) * (1 - entryProgress);
        element.style.opacity = String(opacity);
        element.style.transform = `translate3d(${-horizontalReveal}px, ${rise}px, 0)`;
        element.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
        element.setAttribute('aria-hidden', String(opacity <= 0.01));
      });

    };
    window.addEventListener('architecture-frame', update);
    return () => window.removeEventListener('architecture-frame', update);
  }, []);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-live="polite">
      <div
        data-intro-hero
        className="absolute inset-x-5 top-1/2 z-[25] -translate-y-1/2 text-center sm:inset-x-10"
        style={{ opacity: 0, transform: 'translate3d(0, 20px, 0) scale(0.8)', visibility: 'visible' }}
        aria-hidden="true"
      >
        <h1 className="font-editorial text-balance text-[clamp(2.15rem,9.2vw,4.5rem)] font-normal uppercase leading-[0.96] tracking-[0.035em] text-[#F4F4F0] sm:text-7xl md:text-8xl lg:text-9xl">
          14.<span className="text-[#C5A059]">85</span> CONCEPT
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-sans text-xs font-light tracking-wide text-[#F4F4F0]/90 sm:mt-5 sm:text-base md:mt-7 md:text-xl">
          Engineered for Permanence. <span className="text-[#C5A059]">Precision Execution.</span>
        </p>
      </div>
      {checkpoints.map((checkpoint) => (
        <div
          key={checkpoint.title}
          data-story-block
          className={`absolute top-[clamp(8rem,14vh,10rem)] bottom-[12vh] left-[4%] w-[min(92%,68rem)] text-left sm:left-[6%] sm:w-[min(88%,68rem)] md:top-[clamp(12.5rem,22vh,15rem)] md:left-[8%] ${checkpoint.title === 'REINFORCED CONCRETE FRAME' ? 'md:w-[min(42vw,38rem)]' : 'md:w-[min(84vw,68rem)]'}`}
          style={{ opacity: 0, visibility: 'hidden', willChange: 'transform, opacity' }}
          aria-hidden="true"
        >
          <div className="frosted-copy frosted-copy-panel inline-block max-w-full rounded-2xl border p-5 sm:p-8 md:p-12">
            <p className="mb-2 font-sans text-[9px] tracking-[0.18em] text-[#C5A059] sm:mb-4 sm:text-xs sm:tracking-[0.2em]">
              {checkpoint.kicker}
            </p>
            <h2 className="font-editorial text-balance text-[clamp(1.7rem,5.5vw,5rem)] font-normal leading-[1.03] tracking-[0.01em] text-[#F4F4F0]">{checkpoint.title}</h2>
            <p className="mt-2 max-w-xl font-sans text-[10px] font-light leading-5 tracking-wide text-[#F4F4F0]/90 sm:mt-5 sm:text-sm sm:leading-6 md:text-base">
              {checkpoint.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
