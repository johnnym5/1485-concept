'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { FrameBuffer } from './LoadingBuffer';
import TypographyLayer from '../overlay/TypographyLayer';
import BlueprintFooter from '../footer/BlueprintFooter';
import { SiteHeader } from '../site/SiteChrome';

const LAST_FRAME = 189;
const MAX_CACHED_FRAMES = 40;
const FRAME_PREFETCH_AHEAD = 5;
const FRAME_PREFETCH_BEHIND = 2;

const CAMERA_STOPS = [
  { frame: 0, scale: 1, x: 0, y: 0 },
  { frame: 48, scale: 1.35, x: -34, y: -8 },
  { frame: 112, scale: 1.25, x: 38, y: 12 },
  { frame: 160, scale: 1.06, x: 0, y: 0 },
  { frame: LAST_FRAME, scale: 1.02, x: 0, y: 0 },
];

interface InteractiveCanvasEngineProps {
  initialFrames: FrameBuffer;
}

export default function InteractiveCanvasEngine({ initialFrames }: InteractiveCanvasEngineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introVeilRef = useRef<HTMLDivElement>(null);
  const frameIndexRef = useRef(0);
  const imageCacheRef = useRef(new Map<number, HTMLImageElement>());
  const loadingFramesRef = useRef(new Set<number>());
  const lastDirectionRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !section || !context) return;

    gsap.registerPlugin(ScrollTrigger);
    imageCacheRef.current.clear();
    loadingFramesRef.current.clear();
    initialFrames.forEach((image, index) => {
      if (image) imageCacheRef.current.set(index, image);
    });

    const cacheFrame = (index: number, image: HTMLImageElement) => {
      imageCacheRef.current.delete(index);
      imageCacheRef.current.set(index, image);
      while (imageCacheRef.current.size > MAX_CACHED_FRAMES) {
        const oldestIndex = imageCacheRef.current.keys().next().value;
        if (oldestIndex === undefined) break;
        imageCacheRef.current.delete(oldestIndex);
      }
    };

    let disposed = false;
    let drawQueued = false;
    let currentCamera = { scale: 1, x: 0, y: 0 };
    const isNarrow = window.matchMedia('(max-width: 767px)');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const lowPower = connection?.saveData === true || navigator.hardwareConcurrency <= 4;
    const getPixelRatio = () => {
      const deviceRatio = window.devicePixelRatio || 1;
      if (isNarrow.matches) return Math.min(deviceRatio, lowPower ? 0.9 : 1.15);
      return Math.min(deviceRatio, lowPower ? 1.25 : 1.6);
    };

    const cameraAt = (frame: number) => {
      const nextStopIndex = CAMERA_STOPS.findIndex((stop) => stop.frame >= frame);
      const left = CAMERA_STOPS[Math.max(0, nextStopIndex < 0 ? CAMERA_STOPS.length - 2 : nextStopIndex - 1)];
      const right = CAMERA_STOPS[Math.max(1, nextStopIndex < 0 ? CAMERA_STOPS.length - 1 : nextStopIndex)];
      const raw = Math.min(1, Math.max(0, (frame - left.frame) / Math.max(1, right.frame - left.frame)));
      const eased = isReducedMotion.matches ? raw : raw * raw * (3 - 2 * raw);
      const narrowFactor = isNarrow.matches ? 0.48 : 1;
      const motionFactor = isReducedMotion.matches ? 0.25 : 1;
      return {
        scale: 1 + (left.scale + (right.scale - left.scale) * eased - 1) * narrowFactor * motionFactor,
        x: (left.x + (right.x - left.x) * eased) * narrowFactor * motionFactor,
        y: (left.y + (right.y - left.y) * eased) * narrowFactor * motionFactor,
      };
    };

    const requestDraw = () => {
      if (drawQueued || disposed) return;
      drawQueued = true;
      rafRef.current = requestAnimationFrame(() => {
        drawQueued = false;
        const image = imageCacheRef.current.get(frameIndexRef.current);
        if (!image || disposed) return;

        const pixelRatio = getPixelRatio();
        const bounds = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width * pixelRatio));
        const height = Math.max(1, Math.round(bounds.height * pixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const fitScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const sceneScale = fitScale * currentCamera.scale;
        const scaledWidth = image.naturalWidth * sceneScale;
        const scaledHeight = image.naturalHeight * sceneScale;
        const x = (width - scaledWidth) / 2 - currentCamera.x * pixelRatio;
        const y = (height - scaledHeight) / 2 - currentCamera.y * pixelRatio;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, x, y, scaledWidth, scaledHeight);
      });
    };

    const ensureFrame = (index: number) => {
      if (index < 0 || index > LAST_FRAME) return;
      if (imageCacheRef.current.has(index)) {
        const image = imageCacheRef.current.get(index);
        if (image) cacheFrame(index, image);
        requestDraw();
        return;
      }
      if (loadingFramesRef.current.has(index)) return;

      const image = new Image();
      image.decoding = 'async';
      loadingFramesRef.current.add(index);
      image.onload = () => {
        loadingFramesRef.current.delete(index);
        if (disposed) return;
        cacheFrame(index, image);
        requestDraw();
      };
      image.onerror = () => loadingFramesRef.current.delete(index);
      image.src = `/sequence/frame_${String(index).padStart(4, '0')}.webp`;
    };

    ensureFrame(0);
    const resizeObserver = new ResizeObserver(requestDraw);
    resizeObserver.observe(canvas);

    const scrollState = { frame: 0 };
    let introInterrupted = false;
    const gsapContext = gsap.context(() => {
      const introHero = section.querySelector<HTMLElement>('[data-intro-hero]');
      const introTimeline = gsap.timeline({ paused: true });
      introTimeline.to(canvas, { opacity: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
      introTimeline.to(introVeilRef.current, { opacity: 1, duration: 2, ease: 'power2.inOut' }, 1);
      introTimeline.to(introHero, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 2,
        ease: 'power3.out',
      }, 1);
      introTimeline.play(0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: isReducedMotion.matches ? 0.12 : 0.45,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const frame = scrollState.frame;
        const progress = frame / LAST_FRAME;
        currentCamera = cameraAt(frame);
        const nextFrame = Math.min(LAST_FRAME, Math.max(0, Math.round(frame)));
        if (nextFrame !== frameIndexRef.current) {
          lastDirectionRef.current = nextFrame > frameIndexRef.current ? 1 : -1;
          frameIndexRef.current = nextFrame;
        }
        window.dispatchEvent(new CustomEvent('architecture-frame', { detail: frame }));
        ensureFrame(nextFrame);
        for (let ahead = 1; ahead <= FRAME_PREFETCH_AHEAD; ahead += 1) ensureFrame(nextFrame + ahead * lastDirectionRef.current);
        for (let behind = 1; behind <= FRAME_PREFETCH_BEHIND; behind += 1) ensureFrame(nextFrame - behind * lastDirectionRef.current);
        const smoothRange = (value: number, start: number, end: number) => {
          const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
          return t * t * (3 - 2 * t);
        };
        const chapterStarts = [0, 46, 111];
        const chapterBlur = chapterStarts.reduce((max, start) => {
          const pulseStart = start === 0 ? 0 : start - 3;
          const pulse = smoothRange(frame, pulseStart, start + 4) * (1 - smoothRange(frame, start + 8, start + 14));
          return Math.max(max, pulse);
        }, 0);
        const treatmentAcross = (start: number, end: number) =>
          smoothRange(frame, start - 4, start + 5) * (1 - smoothRange(frame, end - 8, end + 2));
        const facadeTreatment = treatmentAcross(46, 110);
        const frameTreatment = treatmentAcross(111, 180);
        const storyTreatment = Math.max(facadeTreatment, frameTreatment);
        const rfqTextBlur = smoothRange(frame, 158, 164) * (1 - smoothRange(frame, 174, 182));
        const terminalProgress = smoothRange(frame, 168, 180);
        const terminalBlur = smoothRange(frame, 168, 180) * (lowPower ? 16 : 24);
        const revealBlur = Math.max(chapterBlur * 1.15, rfqTextBlur * 1.15, storyTreatment * (lowPower ? 10 : 14));
        const blur = Math.max(terminalBlur, revealBlur);
        canvas.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        canvas.style.transform = `scale(${1 + terminalProgress * 0.02})`;
        const storyVeil = section.querySelector<HTMLElement>('[data-story-veil]');
        if (storyVeil) storyVeil.style.opacity = String(storyTreatment * 0.62);
        const veil = section.querySelector<HTMLElement>('[data-terminal-veil]');
        if (veil) veil.style.opacity = String(terminalProgress * 0.96);
        const blueVeil = section.querySelector<HTMLElement>('[data-blue-veil]');
        const blueProgress = smoothRange(frame, 157, 180);
        if (blueVeil) blueVeil.style.opacity = String(blueProgress * 0.18);
        const introProgress = smoothRange(frame, 0, 45);
        if (frame > 0 && !introInterrupted) {
          introInterrupted = true;
          gsap.killTweensOf([canvas, introVeilRef.current, introHero]);
          gsap.set(canvas, { opacity: 1 });
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
        section.style.setProperty('--journey-progress', String(progress));
        requestDraw();
      },
      });
      timeline.to(scrollState, { frame: LAST_FRAME, duration: 1, ease: 'none' }, 0);
    }, section);

    requestDraw();
    window.dispatchEvent(new CustomEvent('architecture-frame', { detail: 0 }));
    return () => {
      disposed = true;
      gsapContext.revert();
      resizeObserver.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      imageCacheRef.current.clear();
    };
  }, [initialFrames]);

  return (
    <section ref={sectionRef} className="journey-section relative h-[950vh] bg-[#080808] md:h-[800vh]" aria-label="Scroll through the architectural sequence">
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#080808]">
        <canvas ref={canvasRef} className="absolute inset-0 z-10 block h-full w-full object-cover opacity-0 will-change-transform" aria-label="Scroll-controlled image sequence" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#080808]/30 via-transparent to-[#080808]/55" />
        <div ref={introVeilRef} data-intro-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[16] bg-black/60 opacity-0 backdrop-blur-md" />
        <div data-blue-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[14] bg-[#12395B] opacity-0" />
        <div data-terminal-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[15] bg-[#041A2C] opacity-0" />
        <div data-story-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[17] bg-black opacity-0" />
        <TypographyLayer />
        <BlueprintFooter />
        <SiteHeader overlay />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-px bg-white/20">
          <div className="journey-progress h-full bg-[#C5A059]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center sm:bottom-7">
          <span className="frosted-copy font-sans text-[10px] uppercase tracking-[0.24em] text-[#F4F4F0]/85 sm:text-xs">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}
