'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    gsap.registerPlugin(ScrollTrigger);
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
  const previousPathRef = useRef(pathname);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const isRouteChange = previousPathRef.current !== pathname;
    previousPathRef.current = pathname;
    const waitForRouteTransition = isRouteChange || document.documentElement.dataset.siteTransition === 'covered';
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let boundaryCleanup = () => {};
    let routeRevealCleanup = () => {};
    let initialBoundaryCheck: number | null = null;
    let layoutRefreshFrame: number | null = null;
    const refreshAfterExperienceLoad = () => {
      if (layoutRefreshFrame !== null) window.cancelAnimationFrame(layoutRefreshFrame);
      layoutRefreshFrame = window.requestAnimationFrame(() => {
        layoutRefreshFrame = null;
        ScrollTrigger.refresh();
      });
    };
    window.addEventListener('architecture-experience-ready', refreshAfterExperienceLoad);
    const context = gsap.context(() => {
      const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-motion-reveal]'));
      if (reducedMotion) {
        gsap.set(elements, { clearProps: 'all' });
        return;
      }

      const enterPage = (settleVisibleContent = false) => {
        if (settleVisibleContent) {
          const visibleElements = elements.filter((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.top < window.innerHeight && bounds.bottom > 0;
          });
          gsap.set(visibleElements, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
            clearProps: 'willChange',
          });
          gsap.set(root, { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' });
          return;
        }
        gsap.fromTo(root,
          { autoAlpha: 0, scale: 1.025, filter: 'blur(10px)' },
          {
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: window.matchMedia('(max-width: 767px)').matches ? 0.78 : 1,
            ease: 'power2.out',
            clearProps: 'filter,transform,willChange',
          },
        );
      };

      let routeRevealFallback: number | null = null;
      let waitingForRouteWipe = false;
      if (waitForRouteTransition) {
        // Keep the incoming page painted beneath the transition overlay. If navigation or
        // the reveal event is interrupted, the destination must not remain black.
        gsap.set(root, { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
        waitingForRouteWipe = true;
        const onRouteRevealed = () => {
          if (!waitingForRouteWipe) return;
          waitingForRouteWipe = false;
          if (routeRevealFallback !== null) window.clearTimeout(routeRevealFallback);
          context.add(() => enterPage(true));
        };
        window.addEventListener('site-route-revealed', onRouteRevealed);
        routeRevealFallback = window.setTimeout(onRouteRevealed, 1400);
        routeRevealCleanup = () => {
          waitingForRouteWipe = false;
          window.removeEventListener('site-route-revealed', onRouteRevealed);
          if (routeRevealFallback !== null) window.clearTimeout(routeRevealFallback);
        };
      } else if (page !== 'home-support') {
        enterPage();
      }

      const revealTriggers: ScrollTrigger[] = [];
      elements.forEach((element) => {
        const direction = element.dataset.motionDirection;
        const initialX = direction === 'right' ? 28 : direction === 'left' ? -20 : 0;
        gsap.set(element, { autoAlpha: 0, x: initialX, y: 34, filter: 'blur(8px)', willChange: 'transform, opacity, filter' });

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: 'top 82%',
            end: 'bottom 18%',
            scrub: window.matchMedia('(max-width: 767px)').matches ? 0.35 : 0.55,
            invalidateOnRefresh: true,
          },
        });

        reveal.to(element, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.42,
          ease: 'none',
        }, 0);
        reveal.to(element, {
          autoAlpha: 0,
          x: 0,
          y: -48,
          filter: 'blur(8px)',
          duration: 0.42,
          ease: 'none',
        }, 0.58);
        if (reveal.scrollTrigger) revealTriggers.push(reveal.scrollTrigger);
      });

      // At the true end of a page, settle all main content into a readable state.
      // This prevents the last scroll-scrub position from leaving a paragraph blurred.
      let settledAtPageEnd = false;
      const syncPageEnd = () => {
        const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
        if (atPageEnd === settledAtPageEnd) return;
        settledAtPageEnd = atPageEnd;

        if (atPageEnd) {
          revealTriggers.forEach((trigger) => trigger.disable(false));
          gsap.set(elements, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
            clearProps: 'willChange',
          });
        } else {
          revealTriggers.forEach((trigger) => trigger.enable(false, false));
          ScrollTrigger.refresh();
        }
      };
      window.addEventListener('scroll', syncPageEnd, { passive: true });
      window.addEventListener('resize', syncPageEnd);
      initialBoundaryCheck = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        syncPageEnd();
      });
      boundaryCleanup = () => {
        window.removeEventListener('scroll', syncPageEnd);
        window.removeEventListener('resize', syncPageEnd);
      };
    }, root);

    return () => {
      boundaryCleanup();
      routeRevealCleanup();
      window.removeEventListener('architecture-experience-ready', refreshAfterExperienceLoad);
      if (layoutRefreshFrame !== null) window.cancelAnimationFrame(layoutRefreshFrame);
      if (initialBoundaryCheck !== null) window.cancelAnimationFrame(initialBoundaryCheck);
      gsap.killTweensOf(root.querySelectorAll('[data-motion-reveal]'));
      context.revert();
    };
  }, [page, pathname]);

  return <div ref={rootRef} data-motion-page={page}>{children}</div>;
}
