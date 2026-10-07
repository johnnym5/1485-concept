'use client';

import { useEffect, useRef, useState } from 'react';
import RfqForm from './RfqForm';

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

export default function BlueprintFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const visibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const update = (event: Event) => {
      const frame = (event as CustomEvent<number>).detail as number;
      const cardProgress = smoothstep((frame - 158) / 18);
      const nextVisible = frame >= 177;
      if (visibleRef.current !== nextVisible) {
        visibleRef.current = nextVisible;
        setIsVisible(nextVisible);
      }
      if (sectionRef.current) {
        sectionRef.current.style.opacity = String(cardProgress);
        sectionRef.current.style.visibility = cardProgress > 0.01 ? 'visible' : 'hidden';
        sectionRef.current.setAttribute('aria-hidden', String(!nextVisible));
        if (!nextVisible) sectionRef.current.setAttribute('inert', '');
        else sectionRef.current.removeAttribute('inert');
        sectionRef.current.classList.toggle('terminal-footer', frame >= 180);

        const card = sectionRef.current.querySelector<HTMLElement>('[data-rfq-card]');
        if (card) {
          const cardTravel = reducedMotion ? 12 : 108;
          card.style.transform = `translate3d(${(1 - cardProgress) * cardTravel}%, 0, 0)`;
          card.style.opacity = String(cardProgress);
          const revealItems = card.querySelectorAll<HTMLElement>('[data-rfq-reveal]');
          revealItems.forEach((item, index) => {
            const reveal = smoothstep((frame - (160 + index * 1.6)) / 4.5);
            item.style.opacity = String(reveal);
            item.style.transform = `translate3d(${-((reducedMotion ? 8 : 28) * (1 - reveal))}px, 0, 0)`;
            item.style.visibility = reveal > 0.01 ? 'visible' : 'hidden';
          });
        }
      }
    };
    window.addEventListener('architecture-frame', update);
    return () => window.removeEventListener('architecture-frame', update);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="invisible pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-3 pb-10 pt-16 opacity-0 sm:px-8 sm:py-8"
      aria-label="Request a project quote"
      aria-hidden={!isVisible}
      inert={!isVisible}
    >
      <div data-rfq-card className="frosted-copy frosted-glass-card pointer-events-auto ml-auto max-h-none w-full max-w-xl translate-x-full overflow-visible overscroll-auto rounded-2xl border p-2.5 max-[700px]:max-h-[calc(100svh-7.5rem)] max-[700px]:overflow-y-auto sm:max-h-[calc(100svh-4rem)] sm:overflow-y-auto sm:p-8 md:p-10" style={{ opacity: 0, willChange: 'transform, opacity' }}>
        <div className="mb-2 border-b border-[#C5A059]/25 pb-2 sm:mb-6 sm:pb-5">
          <p data-rfq-reveal className="technical-label mb-1 text-[8px] text-[#C5A059] sm:mb-3 sm:text-xs">1485 / Project inquiry</p>
          <h2 data-rfq-reveal className="font-editorial text-[1.35rem] font-normal leading-tight tracking-[0.015em] text-[#F4F4F0] sm:text-[2.35rem]">Start with a clear brief.</h2>
          <p data-rfq-reveal className="mt-1 text-[10px] leading-4 text-[#F4F4F0]/80 sm:mt-3 sm:text-base sm:leading-7">Share the project stage, site, and scope. We will review the brief and respond within two business days.</p>
        </div>
        <RfqForm animated />
      </div>
    </section>
  );
}
