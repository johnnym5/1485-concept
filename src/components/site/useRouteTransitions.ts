'use client';

import type { RefObject } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap.client';

type UseRouteTransitionsOptions = {
  overlayRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  onDestinationChange?: (destinationPath: string) => boolean;
};

function getMainContent() {
  return gsap.utils.toArray<HTMLElement>('.site-motion-content main');
}

export default function useRouteTransitions({ overlayRef, enabled, onDestinationChange }: UseRouteTransitionsOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const transitioning = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const revealRef = useRef<() => void>(() => undefined);

  const { contextSafe } = useGSAP({ scope: overlayRef });

  const showOverlay = contextSafe(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.dataset.state = 'transition';
    overlay.setAttribute('aria-hidden', 'true');
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'auto' });
  });

  const coverHistoryNavigation = contextSafe(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    transitioning.current = true;
    showOverlay();
    gsap.to(overlay, { autoAlpha: 1, duration: 0.2, ease: 'power2.inOut' });
    const mains = getMainContent();
    if (mains.length) gsap.to(mains, { filter: 'blur(5px)', opacity: 0.42, duration: 0.2, ease: 'power2.in' });
  });

  const coverUncontrolledNavigation = contextSafe(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    showOverlay();
    gsap.set(overlay, { autoAlpha: 1 });
    const mains = getMainContent();
    if (mains.length) gsap.set(mains, { filter: 'blur(5px)', opacity: 0.42 });
  });

  const revealRoute = contextSafe(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const mains = getMainContent();
    gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
        overlay.dataset.state = 'hidden';
        transitioning.current = false;
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      },
    }).to(overlay, { autoAlpha: 0, duration: 0.48, ease: 'power2.inOut' }, 0);
    if (mains.length) {
      gsap.to(mains, { filter: 'blur(0px)', opacity: 1, duration: 0.48, ease: 'power2.out' });
    }
  });

  revealRef.current = revealRoute;

  const clearTransition = contextSafe(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      gsap.killTweensOf(overlay);
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      overlay.dataset.state = 'hidden';
    }
    const mains = getMainContent();
    if (mains.length) {
      gsap.killTweensOf(mains);
      gsap.set(mains, { clearProps: 'filter,opacity' });
    }
    transitioning.current = false;
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  });

  const navigateUnderVeil = contextSafe((href: string) => {
    if (transitioning.current) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    transitioning.current = true;
    showOverlay();

    const mains = getMainContent();
    const timeline = gsap.timeline({
      onComplete: () => {
        router.push(href);
        timeoutRef.current = window.setTimeout(() => revealRef.current(), 5000);
      },
    }).to(overlay, { autoAlpha: 1, duration: 0.42, ease: 'power2.inOut' }, 0);
    if (mains.length) timeline.to(mains, { filter: 'blur(5px)', opacity: 0.42, duration: 0.42, ease: 'power2.in' }, 0);
  });

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      event.preventDefault();
      if (transitioning.current) return;
      navigateUnderVeil(`${destination.pathname}${destination.search}${destination.hash}`);
    };

    const handlePopState = () => {
      if (window.location.pathname === pathname) return;
      if (transitioning.current) return;
      coverHistoryNavigation();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [coverHistoryNavigation, enabled, navigateUnderVeil, pathname]);

  useEffect(() => {
    if (!enabled && transitioning.current) clearTransition();
  }, [clearTransition, enabled]);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (!enabled) {
      transitioning.current = false;
      return;
    }

    if (!transitioning.current) {
      transitioning.current = true;
      coverUncontrolledNavigation();
    }

    if (onDestinationChange?.(pathname)) {
      const overlay = overlayRef.current;
      if (overlay) {
        gsap.killTweensOf(overlay);
        gsap.set(overlay, { clearProps: 'all' });
        overlay.dataset.state = 'hidden';
        overlay.setAttribute('aria-hidden', 'true');
      }
      const mains = getMainContent();
      if (mains.length) gsap.set(mains, { clearProps: 'filter,opacity' });
      transitioning.current = false;
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      return;
    }

    revealRoute();
  }, [coverUncontrolledNavigation, enabled, onDestinationChange, overlayRef, pathname, revealRoute]);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    gsap.killTweensOf(overlayRef.current);
    const mains = getMainContent();
    if (mains.length) gsap.set(mains, { clearProps: 'filter,opacity' });
  }, [overlayRef]);
}
