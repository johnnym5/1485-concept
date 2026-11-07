'use client';

import { usePathname } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/gsap.client';
import { splitElementIntoWords } from '@/lib/splitWords';

type UsePageOpeningOptions = {
  enabled: boolean;
};

export default function usePageOpening({ enabled }: UsePageOpeningOptions) {
  const pathname = usePathname();

  useGSAP(() => {
    if (!enabled || pathname === '/') return;

    const heading = document.querySelector<HTMLElement>('.site-motion-content main h1');
    if (!heading) return;

    const headerParts = gsap.utils.toArray<HTMLElement>(
      '.frosted-site-header > a, .frosted-site-header > div',
    );
    const words = splitElementIntoWords(heading);
    if (headerParts.length) {
      gsap.fromTo(
        headerParts,
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      );
    }
    if (words.length) {
      gsap.fromTo(
        words,
        { autoAlpha: 0, yPercent: 105, filter: 'blur(2px)' },
        { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.68, stagger: 0.085, ease: 'power3.out', clearProps: 'transform,opacity,filter' },
      );
    }
  }, { dependencies: [enabled, pathname], revertOnUpdate: true });
}
