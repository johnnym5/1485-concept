'use client';

import { gsap, useGSAP } from '@/lib/gsap.client';
import { splitElementIntoWords } from '@/lib/splitWords';

type SiteIntroProps = {
  active: boolean;
  onComplete: () => void;
};

export default function SiteIntro({ active, onComplete }: SiteIntroProps) {
  useGSAP(() => {
    if (!active) return;

    const hero = document.querySelector<HTMLElement>('.home-hero');
    const image = hero?.querySelector<HTMLElement>('.hero-image-layer');
    const heroCopy = hero?.querySelector<HTMLElement>('.hero-copy');
    const heading = hero?.querySelector<HTMLElement>('h1');
    const meta = hero?.querySelector<HTMLElement>('[data-hero-meta]');
    if (!hero || !image || !heroCopy || !heading) {
      onComplete();
      return;
    }

    const words = splitElementIntoWords(heading);
    const eyebrow = hero.querySelector<HTMLElement>('.hero-eyebrow');
    const summary = hero.querySelector<HTMLElement>('.hero-summary');
    const actions = hero.querySelector<HTMLElement>('.hero-actions');
    const blackout = hero.querySelector<HTMLElement>('[data-hero-blackout]');
    const headerParts = gsap.utils.toArray<HTMLElement>(
      '.frosted-site-header > a, .frosted-site-header > div',
    );
    const shades = gsap.utils.toArray<HTMLElement>('[data-hero-shade], [data-hero-gradient]');

    gsap.set(heroCopy, { visibility: 'hidden' });
    // Keep the heading parent visible: only its word spans are revealed below.
    const secondaryCopy = [eyebrow, summary, actions].filter((element): element is HTMLElement => Boolean(element));
    if (secondaryCopy.length) gsap.set(secondaryCopy, { autoAlpha: 0, y: 18 });
    if (meta) gsap.set(meta, { autoAlpha: 0, y: 12 });
    if (words.length) gsap.set(words, { autoAlpha: 0, yPercent: 115, filter: 'blur(3px)' });
    gsap.set(image, { filter: 'blur(0px) brightness(1)', scale: 1.02 });
    if (blackout) gsap.set(blackout, { opacity: 1 });
    if (shades.length) gsap.set(shades, { opacity: 0 });
    if (headerParts.length) gsap.set(headerParts, { autoAlpha: 0, y: -8 });

    const finishIntro = () => {
      onComplete();
    };

    const timeline = gsap.timeline({
      onComplete: finishIntro,
    });

    if (blackout) {
      timeline.to(blackout, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0);
    } else {
      timeline.to({}, { duration: 0.5 });
    }

    // Keep the image clean briefly after the black veil fades, then darken it,
    // blur it, and only after that reveal the hero copy.
    timeline
      .to(image, { filter: 'blur(0px) brightness(0.56)', scale: 1.02, duration: 0.7, ease: 'power2.inOut' }, 0.75)
      .to(image, { filter: 'blur(5px) brightness(0.56)', scale: 1.04, duration: 1.1, ease: 'power2.inOut' }, 1.45)
      .set(heroCopy, { visibility: 'visible' }, 2.55);
    if (shades.length) timeline.to(shades, { opacity: 1, duration: 0.7, ease: 'power2.inOut' }, 0.75);
    if (headerParts.length) timeline.to(headerParts, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 1.05);
    if (eyebrow) timeline.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 2.55);
    if (words.length) timeline.to(words, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.72, stagger: 0.12, ease: 'power3.out' }, 2.75);
    if (summary) timeline.to(summary, { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out' }, '>-0.08');
    if (actions) timeline.to(actions, { autoAlpha: 1, y: 0, duration: 0.58, ease: 'power3.out' }, '>-0.12');
    if (meta) timeline.to(meta, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '>-0.1');

  }, { dependencies: [active, onComplete], revertOnUpdate: true });

  if (!active) return null;

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">Revealing 14.85 Concepts</p>
    </>
  );
}
