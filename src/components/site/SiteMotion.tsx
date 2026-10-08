'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';

export function SiteMotion({ children }: { children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const routePageRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const previousPathRef = useRef(pathname);
  const navigationPendingRef = useRef(false);
  const busyRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== 'reload') return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    let frame = 0;
    let attempts = 0;
    const resetScroll = () => {
      window.scrollTo(0, 0);
      attempts += 1;
      if (attempts < 3) frame = window.requestAnimationFrame(resetScroll);
      else window.history.scrollRestoration = previousRestoration;
    };
    resetScroll();

    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const context = gsap.context(() => {}, panel);

    const releasePanel = () => {
      gsap.killTweensOf([panel, routePageRef.current]);
      panel.style.pointerEvents = 'none';
      gsap.set(panel, { autoAlpha: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' });
      if (routePageRef.current) gsap.set(routePageRef.current, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', clearProps: 'filter,transform,willChange' });
      busyRef.current = false;
      navigationPendingRef.current = false;
      delete document.documentElement.dataset.siteTransition;
      if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
      window.dispatchEvent(new Event('site-route-revealed'));
    };

    const markHistoryTransition = () => {
      document.documentElement.dataset.siteTransition = 'covered';
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.getAttribute('aria-disabled') === 'true') return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      if (busyRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      busyRef.current = true;
      navigationPendingRef.current = true;
      markHistoryTransition();
      panel.style.pointerEvents = 'auto';
      gsap.set(panel, { autoAlpha: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' });
      const routePage = routePageRef.current;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion ? 0.01 : window.matchMedia('(max-width: 767px)').matches ? 0.42 : 0.58;

      context.add(() => {
        const exitTimeline = gsap.timeline({
          onComplete: () => {
            router.push(`${destination.pathname}${destination.search}${destination.hash}`);
            fallbackTimerRef.current = window.setTimeout(releasePanel, 2400);
          },
        });
        if (routePage) exitTimeline.to(routePage, {
          autoAlpha: 0,
          scale: reduceMotion ? 1 : 0.985,
          filter: reduceMotion ? 'blur(0px)' : 'blur(12px)',
          duration,
          ease: 'power2.in',
        }, 0);
        exitTimeline.to(panel, {
          autoAlpha: 1,
          backdropFilter: reduceMotion ? 'blur(0px)' : 'blur(14px)',
          WebkitBackdropFilter: reduceMotion ? 'blur(0px)' : 'blur(14px)',
          duration,
          ease: 'power2.inOut',
        }, 0);
      });
    };

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('popstate', markHistoryTransition);
    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('popstate', markHistoryTransition);
      context.revert();
      if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
    };
  }, [router]);

  useLayoutEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;
    const panel = panelRef.current;
    if (!panel) return;
    const routeContext = gsap.context(() => {}, panel);
    const finishIncomingTransition = () => {
      gsap.killTweensOf(panel);
      panel.style.pointerEvents = 'none';
      gsap.set(panel, { autoAlpha: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' });
      if (routePageRef.current) gsap.set(routePageRef.current, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', clearProps: 'filter,transform,willChange' });
      busyRef.current = false;
      delete document.documentElement.dataset.siteTransition;
      if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
      window.dispatchEvent(new Event('site-route-revealed'));
    };

    const setIncomingTransitionFallback = () => {
      if (fallbackTimerRef.current !== null) window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = window.setTimeout(finishIncomingTransition, 2600);
    };

    const animateIncomingPage = () => {
      const routePage = routePageRef.current;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion ? 0.01 : window.matchMedia('(max-width: 767px)').matches ? 0.72 : 0.9;
      if (routePage) {
        gsap.fromTo(routePage,
          { autoAlpha: 0, scale: reduceMotion ? 1 : 1.025, filter: reduceMotion ? 'blur(0px)' : 'blur(12px)' },
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration, ease: 'power2.out', clearProps: 'filter,transform,willChange' },
        );
      }
      gsap.to(panel, {
        autoAlpha: 0,
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
        duration,
        ease: 'power2.out',
        onComplete: finishIncomingTransition,
      });
    };

    if (navigationPendingRef.current) {
      navigationPendingRef.current = false;
      panel.style.pointerEvents = 'auto';
      routeContext.add(animateIncomingPage);
      setIncomingTransitionFallback();
      return () => routeContext.revert();
    }

    // Back and forward navigation can commit before popstate is handled. Put the
    // soft overlay over the incoming route before paint, then reveal it smoothly.
    document.documentElement.dataset.siteTransition = 'covered';
    panel.style.pointerEvents = 'auto';
    gsap.killTweensOf(panel);
    gsap.set(panel, { autoAlpha: 1, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' });
    routeContext.add(animateIncomingPage);
    setIncomingTransitionFallback();
    return () => routeContext.revert();
  }, [pathname]);

  return (
    <>
      <div ref={routePageRef} data-site-route>{children}</div>
      <div
        ref={panelRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[200] bg-[#080808]/20 opacity-0"
        style={{ visibility: 'hidden', backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' }}
      />
    </>
  );
}

export function PageMotion({ page, children }: { page: string; children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let focusFrame: number | null = null;
    let focusCleanup = () => {};
    const context = gsap.context(() => {
      const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-motion-reveal]'));
      gsap.set(root, { autoAlpha: 1, scale: 1, filter: 'blur(0px)' });
      if (reducedMotion) {
        gsap.set(elements, { autoAlpha: 1, clearProps: 'filter,transform,willChange' });
        return;
      }

      const focusMotion = elements.map((element) => {
        gsap.set(element, { autoAlpha: 0, y: 18, filter: 'blur(0px)', willChange: 'transform,opacity,filter' });
        // Keep filter easing independent so it can run alongside the entry
        // fade without competing for the element's opacity.
        element.style.transition = 'filter 480ms ease-out';
        return { element, visible: false, targetVisible: false, animating: false };
      });

      const updateFocus = () => {
        focusFrame = null;
        const viewportHeight = window.innerHeight;
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
        const atBoundary = window.scrollY <= 4 || window.scrollY >= maxScroll - 4;

        focusMotion.forEach(({ element, visible, animating }) => {
          if (atBoundary) {
            element.style.filter = 'blur(0px)';
            if (visible && !animating) element.style.opacity = '1';
            return;
          }

          const bounds = element.getBoundingClientRect();
          const elementCenter = bounds.top + bounds.height / 2;
          const distance = Math.abs(elementCenter - viewportHeight / 2);
          // Keep a tight, crisp focus band around the viewport center. Rows
          // leaving that band should recede like the reference: noticeably
          // blurred and faded, while remaining legible as they approach focus.
          const strength = Math.max(0, Math.min(1, (distance - viewportHeight * 0.3) / (viewportHeight * 0.45)));
          element.style.filter = `blur(${(strength * 5).toFixed(1)}px)`;
          if (visible && !animating) element.style.opacity = String(1 - strength * 0.2);
        });
      };

      const requestFocusUpdate = () => {
        if (focusFrame !== null) return;
        focusFrame = window.requestAnimationFrame(updateFocus);
      };
      window.addEventListener('scroll', requestFocusUpdate, { passive: true });
      window.addEventListener('resize', requestFocusUpdate);
      updateFocus();

      const animateVisibility = (element: HTMLElement, shouldShow: boolean) => {
        const motion = focusMotion.find((item) => item.element === element);
        if (!motion || (motion.targetVisible === shouldShow && (motion.animating || motion.visible === shouldShow))) return;
        gsap.killTweensOf(element);
        motion.targetVisible = shouldShow;
        motion.animating = true;
        element.style.transition = 'filter 480ms ease-out';
        const delay = shouldShow ? Number(element.dataset.motionDelay) : 0;
        gsap.to(element, {
          autoAlpha: shouldShow ? 1 : 0,
          y: shouldShow ? 0 : 18,
          duration: shouldShow ? 0.78 : 0.52,
          delay: Number.isFinite(delay) ? delay : 0,
          ease: 'power2.out',
          onComplete: () => {
            motion.animating = false;
            motion.visible = shouldShow;
            if (shouldShow) {
              gsap.set(element, { clearProps: 'transform,willChange' });
              element.style.transition = 'filter 480ms ease-out, opacity 480ms ease-out';
              requestFocusUpdate();
            } else {
              gsap.set(element, { clearProps: 'willChange' });
            }
          },
        });
      };

      const observer = typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!(entry.target instanceof HTMLElement)) return;
              animateVisibility(entry.target, entry.isIntersecting);
            });
          }, { threshold: 0.08, rootMargin: '-6% 0px -6% 0px' });
      if (observer) elements.forEach((element) => observer.observe(element));
      else elements.forEach((element) => animateVisibility(element, true));

      focusCleanup = () => {
        window.removeEventListener('scroll', requestFocusUpdate);
        window.removeEventListener('resize', requestFocusUpdate);
        if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
        observer?.disconnect();
        focusMotion.forEach(({ element }) => {
          gsap.killTweensOf(element);
          element.style.removeProperty('transition');
          element.style.removeProperty('filter');
          element.style.removeProperty('opacity');
          element.style.removeProperty('will-change');
        });
      };
    }, root);

    return () => {
      focusCleanup();
      context.revert();
    };
  }, [page, pathname]);

  return <div ref={rootRef} data-motion-page={page}>{children}</div>;
}
