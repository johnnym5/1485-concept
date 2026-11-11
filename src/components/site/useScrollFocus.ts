'use client';

import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap.client';

type UseScrollFocusOptions = {
  enabled: boolean;
};

export default function useScrollFocus({ enabled }: UseScrollFocusOptions) {
  const pathname = usePathname();

  useGSAP(() => {
    if (!enabled) return;

    const copyTargets = gsap.utils
      .toArray<HTMLElement>('main h1, main h2, main h3, main p, main li')
      .filter((element) => !element.matches('.technical-label') && !element.closest('figure, form, nav, a, button, [data-focus-exclude]'));
    const imageTargets = gsap.utils
      .toArray<HTMLElement>('main .site-image, main img')
      .filter((element) => element.matches('.hero-image-layer') ? false : (!element.matches('img') || !element.closest('.site-image')));
    const targets = [...new Set([...copyTargets, ...imageTargets])]
      .sort((first, second) => {
        if (first === second) return 0;
        return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });

    for (const element of targets) {
      const isImage = imageTargets.includes(element);
      // Keep surrounding content readable, but make the scroll reveal distinct
      // from the page-opening animation instead of barely changing opacity.
      const edgeOpacity = isImage ? 0.48 : 0.55;
      const edgeBlur = isImage ? 'blur(1.25px)' : 'blur(0.75px)';
      const edgeY = isImage ? 4 : 3;
      const focus = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      focus
        .fromTo(
          element,
          { opacity: edgeOpacity, filter: edgeBlur, y: edgeY },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5, ease: 'sine.out', immediateRender: false },
        )
        .to(element, { opacity: edgeOpacity, filter: edgeBlur, y: edgeY, duration: 0.5, ease: 'sine.in' });
    }

    ScrollTrigger.refresh();
  }, { dependencies: [enabled, pathname], revertOnUpdate: true });
}
