'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TypographyLayer from '../overlay/TypographyLayer';

const LAST_FRAME = 200;
const IMAGE_FRAME_COUNT = 60;
const IMAGE_FRAME_PATH = '/exploded-images-webp/frame_';

interface InteractiveCanvasEngineProps {
  onSceneReady: () => void;
  children: ReactNode;
}

export default function InteractiveCanvasEngine({ onSceneReady, children }: InteractiveCanvasEngineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sequenceTrackRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const sceneVisualRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadVeilRef = useRef<HTMLDivElement>(null);
  const introVeilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const scene = sceneVisualRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!section || !scene || !canvas || !context) return;

    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let sceneReady = false;
    let introAllowed = false;
    let introStarted = false;
    let introInterrupted = false;
    let coverProgress = 0;
    let currentFrameIndex = -1;
    let renderScheduled = false;
    let cachedWidth = 0;
    let cachedHeight = 0;
    let introTimeline: gsap.core.Timeline | null = null;
    let introHero: HTMLElement | null = null;

    const cache = new Map<number, HTMLImageElement>();
    const pending = new Set<number>();
    const scrollState = { frame: 0 };

    const updateCanvasBounds = () => {
      if (!canvas || disposed) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.25);
      const width = Math.round(bounds.width * pixelRatio);
      const height = Math.round(bounds.height * pixelRatio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      cachedWidth = width;
      cachedHeight = height;
    };

    const getCurrentTargetIndex = () => {
      const nextFrame = Math.min(LAST_FRAME, Math.max(0, Math.round(scrollState.frame)));
      return Math.round((nextFrame / LAST_FRAME) * (IMAGE_FRAME_COUNT - 1));
    };

    const notifyReady = () => {
      if (sceneReady || disposed) return;
      sceneReady = true;
      gsap.to(loadVeilRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out' });
      onSceneReady();
      playIntroWhenReady();
    };

    const drawFrame = (index: number) => {
      if (disposed || !canvas.isConnected || cachedWidth <= 0 || cachedHeight <= 0) return;
      const image = cache.get(index);
      if (!image?.complete || !image.naturalWidth) return;

      const scale = Math.max(cachedWidth / image.naturalWidth, cachedHeight / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (cachedWidth - drawWidth) / 2, (cachedHeight - drawHeight) / 2, drawWidth, drawHeight);
      currentFrameIndex = index;
      if (index === 0) notifyReady();
    };

    const renderFrame = () => {
      renderScheduled = false;
      if (disposed) return;
      const targetIndex = getCurrentTargetIndex();
      if (cache.has(targetIndex)) {
        drawFrame(targetIndex);
      } else {
        // Fallback to closest available cached frame if target isn't decoded yet
        let closestIndex = -1;
        let minDistance = Infinity;
        cache.forEach((img, idx) => {
          if (img.complete && img.naturalWidth) {
            const dist = Math.abs(idx - targetIndex);
            if (dist < minDistance) {
              minDistance = dist;
              closestIndex = idx;
            }
          }
        });
        if (closestIndex !== -1 && closestIndex !== currentFrameIndex) {
          drawFrame(closestIndex);
        }
      }
    };

    const scheduleRender = () => {
      if (renderScheduled || disposed) return;
      renderScheduled = true;
      requestAnimationFrame(renderFrame);
    };

    const requestFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(IMAGE_FRAME_COUNT - 1, index));
      if (cache.has(safeIndex) || pending.has(safeIndex)) return;

      pending.add(safeIndex);
      const image = new window.Image();
      image.decoding = 'async';
      image.onload = () => {
        void image
          .decode()
          .catch(() => undefined)
          .then(() => {
            pending.delete(safeIndex);
            if (disposed) return;
            cache.set(safeIndex, image);
            scheduleRender();
          });
      };
      image.onerror = () => {
        pending.delete(safeIndex);
        if (safeIndex === 0) notifyReady();
      };
      image.src = `${IMAGE_FRAME_PATH}${String(safeIndex + 1).padStart(4, '0')}.webp`;
    };

    const preloadAllFrames = () => {
      // Prioritize frame 0 and early frames
      requestFrame(0);
      for (let i = 1; i < IMAGE_FRAME_COUNT; i++) {
        // Stagger preloading slightly to prevent initial network lockup
        setTimeout(() => {
          if (!disposed) requestFrame(i);
        }, i * 15);
      }
    };

    const playIntroWhenReady = () => {
      if (!introAllowed || !sceneReady || introStarted || reducedMotion || scrollState.frame > 0) return;
      introStarted = true;
      introTimeline?.play(0);
    };

    const onExperienceReady = () => {
      introAllowed = true;
      playIntroWhenReady();
    };

    const smoothRange = (value: number, start: number, end: number) => {
      const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
      return t * t * (3 - 2 * t);
    };

    const setCoverVisuals = () => {
      const exitProgress = smoothRange(scrollState.frame, 155, 200);
      const coverVeil = section.querySelector<HTMLElement>('[data-cover-veil]');
      const effectiveCoverOpacity = Math.max(coverProgress * 0.9, exitProgress * 0.88);
      if (coverVeil) coverVeil.style.opacity = String(effectiveCoverOpacity);
      const effectiveBlur = Math.max(coverProgress * 12, exitProgress * 16);
      scene.style.filter = effectiveBlur > 0.1 ? `blur(${effectiveBlur.toFixed(1)}px)` : 'none';
    };

    updateCanvasBounds();

    const gsapContext = gsap.context(() => {
      introHero = section.querySelector<HTMLElement>('[data-intro-hero]');
      introTimeline = gsap.timeline({ paused: true });
      introTimeline.fromTo(scene, { scale: 1.08 }, { scale: 1, duration: 1.5, ease: 'power2.out' }, 0);
      introTimeline.fromTo(loadVeilRef.current, { opacity: 0.9 }, { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0);
      introTimeline.to(introVeilRef.current, { opacity: 1, duration: 2, ease: 'power2.inOut' }, window.matchMedia('(max-width: 767px)').matches ? 1.5 : 2.1);
      introTimeline.fromTo(introHero, { opacity: 0, scale: 0.96, y: 14 }, {
        opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'power3.out',
      }, window.matchMedia('(max-width: 767px)').matches ? 1.5 : 2.1);
      if (reducedMotion) introTimeline.pause(0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          endTrigger: sequenceTrackRef.current,
          end: 'bottom bottom',
          scrub: reducedMotion ? 0 : 0.08,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const frame = scrollState.frame;
          const progress = frame / LAST_FRAME;
          const targetIndex = getCurrentTargetIndex();
          requestFrame(targetIndex);
          scheduleRender();

          window.dispatchEvent(new CustomEvent('architecture-frame', { detail: frame }));
          const blueVeil = section.querySelector<HTMLElement>('[data-blue-veil]');
          if (blueVeil) blueVeil.style.opacity = String(smoothRange(frame, 157, 180) * 0.12);
          const introProgress = smoothRange(frame, 0, 45);
          if (frame > 0 && introStarted && !introInterrupted) {
            introInterrupted = true;
            gsap.killTweensOf([scene, loadVeilRef.current, introVeilRef.current, introHero]);
            gsap.set(loadVeilRef.current, { opacity: 0 });
          }
          if (introInterrupted) {
            if (introVeilRef.current) {
              const veilOpacity = 1 - introProgress;
              const veilBlur = (1 - introProgress) * 12;
              introVeilRef.current.style.opacity = String(veilOpacity);
              introVeilRef.current.style.backdropFilter = `blur(${veilBlur}px)`;
              introVeilRef.current.style.setProperty('-webkit-backdrop-filter', `blur(${veilBlur}px)`);
            }
            if (introHero) {
              introHero.style.opacity = String(1 - introProgress);
              introHero.style.transform = `translate3d(0, ${-24 * introProgress}px, 0) scale(${1 - 0.2 * introProgress})`;
              introHero.style.visibility = introProgress < 0.99 ? 'visible' : 'hidden';
            }
          }
          setCoverVisuals();
          section.style.setProperty('--journey-progress', String(progress));
        },
      });
      timeline.to(scrollState, { frame: LAST_FRAME, duration: 1, ease: 'none' }, 0);

      if (scrollContentRef.current) {
        ScrollTrigger.create({
          trigger: scrollContentRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            coverProgress = self.progress;
            setCoverVisuals();
          },
        });
      }
    }, section);

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasBounds();
      scheduleRender();
    });
    resizeObserver.observe(canvas);

    const onResize = () => {
      updateCanvasBounds();
      scheduleRender();
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('architecture-experience-ready', onExperienceReady);

    preloadAllFrames();
    window.dispatchEvent(new CustomEvent('architecture-frame', { detail: 0 }));

    return () => {
      disposed = true;
      gsapContext.revert();
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('architecture-experience-ready', onExperienceReady);
      cache.clear();
    };
  }, [onSceneReady]);

  return (
    <section ref={sectionRef} className="journey-section relative bg-[#080808]" aria-label="Scroll through the architectural sequence">
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#080808]">
        <div ref={sceneVisualRef} className="architectural-scene-visual absolute -inset-3">
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#080808]/30 via-transparent to-[#080808]/55" />
        <div ref={loadVeilRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[13] bg-black opacity-90" />
        <div data-cover-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[15] bg-black opacity-0" />
        <div ref={introVeilRef} data-intro-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[16] bg-black/60 opacity-0 backdrop-blur-md" />
        <div data-blue-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[14] bg-[#12395B] opacity-0" />
        <div data-story-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[17] bg-black opacity-0" />
        <TypographyLayer />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-px bg-white/20">
          <div className="journey-progress h-full bg-[#C5A059]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center sm:bottom-7">
          <span className="frosted-copy font-sans text-[10px] uppercase tracking-[0.24em] text-[#F4F4F0]/85 sm:text-xs">Scroll to explore</span>
        </div>
      </div>
      <div ref={sequenceTrackRef} aria-hidden="true" className="h-[850vh] md:h-[700vh]" />
      <div ref={scrollContentRef} className="homepage-scroll-content relative z-20 -mt-[100svh]">
        {children}
      </div>
    </section>
  );
}
