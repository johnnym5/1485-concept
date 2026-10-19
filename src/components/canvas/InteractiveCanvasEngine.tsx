'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TypographyLayer from '../overlay/TypographyLayer';

const LAST_FRAME = 200;
const IMAGE_FRAME_COUNT = 60;
const IMAGE_FRAME_PATH = '/exploded-images-webp/frame_';
const CACHE_LIMIT = 10;
const MAX_CONCURRENT_DECODES = 4;

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
    let renderScheduled = false;
    let cachedWidth = 0;
    let cachedHeight = 0;
    let introTimeline: gsap.core.Timeline | null = null;
    let introHero: HTMLElement | null = null;

    const cache = new Map<number, ImageBitmap | HTMLImageElement>();
    const pending = new Set<number>();
    const queued = new Set<number>();
    const scrollState = { frame: 0 };
    let lastTargetIndex = 0;

    const releaseFrame = (frame: ImageBitmap | HTMLImageElement) => {
      if (typeof ImageBitmap !== 'undefined' && frame instanceof ImageBitmap) frame.close();
    };

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

    const getCurrentFramePosition = () => {
      const nextFrame = Math.min(LAST_FRAME, Math.max(0, scrollState.frame));
      return (nextFrame / LAST_FRAME) * (IMAGE_FRAME_COUNT - 1);
    };

    const notifyReady = () => {
      if (sceneReady || disposed) return;
      sceneReady = true;
      gsap.to(loadVeilRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out' });
      onSceneReady();
      playIntroWhenReady();
    };

    const drawImageLayer = (image: ImageBitmap | HTMLImageElement, alpha: number) => {
      const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
      const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
      const scale = Math.max(cachedWidth / imageWidth, cachedHeight / imageHeight);
      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;
      context.globalAlpha = alpha;
      context.drawImage(image, (cachedWidth - drawWidth) / 2, (cachedHeight - drawHeight) / 2, drawWidth, drawHeight);
    };

    const touchFrame = (index: number) => {
      const image = cache.get(index);
      if (!image) return;
      cache.delete(index);
      cache.set(index, image);
    };

    const drawFramePosition = (position: number) => {
      if (disposed || !canvas.isConnected || cachedWidth <= 0 || cachedHeight <= 0) return;
      const lowerIndex = Math.floor(position);
      const upperIndex = Math.min(IMAGE_FRAME_COUNT - 1, lowerIndex + 1);
      const blend = position - lowerIndex;
      const lowerImage = cache.get(lowerIndex);
      const upperImage = cache.get(upperIndex);
      const availableIndex = lowerImage ? lowerIndex : upperImage ? upperIndex : -1;

      context.globalAlpha = 1;
      context.clearRect(0, 0, cachedWidth, cachedHeight);
      if (lowerImage && upperImage && lowerIndex !== upperIndex) {
        context.globalCompositeOperation = 'lighter';
        drawImageLayer(lowerImage, 1 - blend);
        drawImageLayer(upperImage, blend);
        context.globalCompositeOperation = 'source-over';
        touchFrame(lowerIndex);
        touchFrame(upperIndex);
      } else if (availableIndex !== -1) {
        const image = lowerImage || upperImage;
        if (image) {
          drawImageLayer(image, 1);
          touchFrame(availableIndex);
        }
      } else {
        let closestIndex = -1;
        let minDistance = Infinity;
        cache.forEach((_image, index) => {
          const distance = Math.abs(index - position);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });
        if (closestIndex !== -1) {
          const image = cache.get(closestIndex);
          if (image) {
            drawImageLayer(image, 1);
            touchFrame(closestIndex);
          }
        }
      }
      context.globalAlpha = 1;
      if (lowerIndex === 0 && cache.has(0)) notifyReady();
    };

    const renderFrame = () => {
      renderScheduled = false;
      if (disposed) return;
      drawFramePosition(getCurrentFramePosition());
    };

    const scheduleRender = () => {
      if (renderScheduled || disposed) return;
      renderScheduled = true;
      requestAnimationFrame(renderFrame);
    };

    const requestFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(IMAGE_FRAME_COUNT - 1, index));
      if (cache.has(safeIndex) || pending.has(safeIndex)) return;
      queued.add(safeIndex);
    };

    const pumpDecodeQueue = () => {
      while (pending.size < MAX_CONCURRENT_DECODES && queued.size > 0) {
        const nextIndex = [...queued].sort((a, b) => Math.abs(a - lastTargetIndex) - Math.abs(b - lastTargetIndex))[0];
        queued.delete(nextIndex);
        if (cache.has(nextIndex) || pending.has(nextIndex)) continue;
        decodeFrame(nextIndex);
      }
    };

    const decodeFrame = (safeIndex: number) => {
      pending.add(safeIndex);
      const image = new window.Image();
      image.decoding = 'async';
      image.onload = () => {
        void image
          .decode()
          .then((): Promise<ImageBitmap | HTMLImageElement> => (
            typeof createImageBitmap === 'function' ? createImageBitmap(image) : Promise.resolve(image)
          ))
          .then((bitmap) => {
            pending.delete(safeIndex);
            if (disposed) {
              releaseFrame(bitmap);
              return;
            }
            cache.set(safeIndex, bitmap);
            scheduleRender();
            trimCache();
            pumpDecodeQueue();
          })
          .catch(() => {
            pending.delete(safeIndex);
            pumpDecodeQueue();
          });
      };
      image.onerror = () => {
        pending.delete(safeIndex);
        if (safeIndex === 0) notifyReady();
        pumpDecodeQueue();
      };
      image.src = `${IMAGE_FRAME_PATH}${String(safeIndex + 1).padStart(4, '0')}.webp`;
    };

    const trimCache = () => {
      while (cache.size > CACHE_LIMIT) {
        const oldest = cache.keys().next().value;
        if (oldest === undefined) return;
        const bitmap = cache.get(oldest);
        cache.delete(oldest);
        if (bitmap) releaseFrame(bitmap);
      }
    };

    const warmFrames = (center: number, direction: number) => {
      lastTargetIndex = center;
      // Prioritize the current frame, then a short buffer in the scroll direction and behind it.
      requestFrame(center);
      for (let offset = 1; offset <= 6; offset += 1) requestFrame(center + offset * direction);
      for (let offset = 1; offset <= 2; offset += 1) requestFrame(center - offset * direction);

      for (const index of queued) {
        if (Math.abs(index - center) > 8) queued.delete(index);
      }
      pumpDecodeQueue();
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
          const framePosition = getCurrentFramePosition();
          const targetIndex = Math.round(framePosition);
          requestFrame(Math.floor(framePosition));
          requestFrame(Math.ceil(framePosition));
          const direction = targetIndex < lastTargetIndex ? -1 : 1;
          if (targetIndex !== lastTargetIndex) warmFrames(targetIndex, direction);
          else pumpDecodeQueue();
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

    warmFrames(0, 1);
    window.dispatchEvent(new CustomEvent('architecture-frame', { detail: 0 }));

    return () => {
      disposed = true;
      gsapContext.revert();
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('architecture-experience-ready', onExperienceReady);
      cache.forEach(releaseFrame);
      cache.clear();
      queued.clear();
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
