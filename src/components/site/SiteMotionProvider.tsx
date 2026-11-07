'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import SiteIntro from './SiteIntro';
import usePageOpening from './usePageOpening';
import useRouteTransitions from './useRouteTransitions';
import useScrollFocus from './useScrollFocus';
import useSitePrefetch from './useSitePrefetch';

export default function SiteMotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [introActive, setIntroActive] = useState(pathname === '/');
  const [introResolved, setIntroResolved] = useState(pathname !== '/');
  const [reducedMotion, setReducedMotion] = useState(false);

  useSitePrefetch();

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        setIntroActive(false);
        setIntroResolved(true);
      }
    };
    updatePreference();
    preference.addEventListener('change', updatePreference);

    if (preference.matches) {
      setIntroActive(false);
      setIntroResolved(true);
      return () => preference.removeEventListener('change', updatePreference);
    }

    if (pathname === '/') {
      setIntroResolved(false);
      setIntroActive(true);
    } else {
      setIntroActive(false);
      setIntroResolved(true);
    }

    return () => preference.removeEventListener('change', updatePreference);
  }, [pathname]);

  const completeIntro = useCallback(() => {
    setIntroActive(false);
    setIntroResolved(true);
  }, []);

  // A hard reload or interrupted client hydration must never leave the intro
  // state hiding the page indefinitely if the GSAP timeline cannot start.
  useEffect(() => {
    if (!introActive) return;
    const timeout = window.setTimeout(completeIntro, 7000);
    return () => window.clearTimeout(timeout);
  }, [completeIntro, introActive]);

  const beginDestinationOpening = useCallback((destinationPath: string) => {
    if (destinationPath !== '/') return false;
    setIntroActive(true);
    setIntroResolved(false);
    return true;
  }, []);

  useRouteTransitions({
    overlayRef,
    enabled: (introResolved || introActive) && !reducedMotion,
    onDestinationChange: beginDestinationOpening,
  });
  useScrollFocus({ enabled: introResolved && !introActive && !reducedMotion });
  usePageOpening({ enabled: introResolved && !introActive && !reducedMotion });

  return (
    <>
      <div
        ref={overlayRef}
        className="site-motion-overlay"
        data-motion-overlay
        aria-hidden="true"
      >
      </div>
      <div
        className="site-motion-content"
        data-intro-resolved={introResolved ? 'true' : 'false'}
        data-intro-active={introActive ? 'true' : 'false'}
        data-reduced-motion={reducedMotion ? 'true' : 'false'}
      >
        {introActive && <SiteIntro active={introActive} onComplete={completeIntro} />}
        {children}
      </div>
    </>
  );
}
