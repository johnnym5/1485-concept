'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TypographyLayer from '../overlay/TypographyLayer';

const LAST_FRAME = 200;
const MAX_CACHED_FRAMES = 201;
const FRAME_PREFETCH_AHEAD = 5;
const FRAME_PREFETCH_BEHIND = 2;
const SCROLL_MILESTONES = [46, 111, 158];
const MILESTONE_EASE_RADIUS = 8;
const NORMAL_SCRUB_DURATION = 0.45;
const MILESTONE_SCRUB_DURATION = 1;

const CAMERA_STOPS = [
  { frame: 0, scale: 1, x: 0, y: 0 },
  { frame: 48, scale: 1.35, x: -34, y: -8 },
  { frame: 112, scale: 1.25, x: 38, y: 12 },
  { frame: 160, scale: 1.06, x: 0, y: 0 },
  { frame: LAST_FRAME, scale: 1.02, x: 0, y: 0 },
];

const MOBILE_CAMERA_STOPS = [
  { frame: 0, scale: 1, x: 0, y: 0 },
  // Keep the full composition visible on narrow screens instead of panning
  // between close crops for each story card.
  { frame: 46, scale: 1, x: 0, y: 0 },
  { frame: 110, scale: 1, x: 0, y: 0 },
  { frame: 130, scale: 1, x: 0, y: 0 },
  { frame: 170, scale: 1, x: 0, y: 0 },
  { frame: LAST_FRAME, scale: 1, x: 0, y: 0 },
];

interface InteractiveCanvasEngineProps {
  videoSource: string | null;
  onSceneReady: () => void;
  children: ReactNode;
}

export default function InteractiveCanvasEngine({ videoSource, onSceneReady, children }: InteractiveCanvasEngineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sequenceTrackRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneVisualRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const loadVeilRef = useRef<HTMLDivElement>(null);
  const introVeilRef = useRef<HTMLDivElement>(null);
  const frameIndexRef = useRef(0);
  const imageCacheRef = useRef(new Map<number, HTMLImageElement>());
  const loadingFramesRef = useRef(new Set<number>());
  const lastDirectionRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !section || !context || !video) return;

    gsap.registerPlugin(ScrollTrigger);
    const imageCache = imageCacheRef.current;
    imageCache.clear();
    loadingFramesRef.current.clear();

    const cacheFrame = (index: number, image: HTMLImageElement) => {
      imageCacheRef.current.delete(index);
      imageCacheRef.current.set(index, image);
      while (imageCacheRef.current.size > MAX_CACHED_FRAMES) {
        const oldestIndex = imageCacheRef.current.keys().next().value;
        if (oldestIndex === undefined) break;
        imageCacheRef.current.delete(oldestIndex);
      }
    };
    const isNarrow = window.matchMedia('(max-width: 767px)');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let drawQueued = false;
    let fallbackActive = false;
    let videoReady = false;
    let sceneReadyNotified = false;
    let sceneReady = false;
    let introAllowed = false;
    let introStarted = false;
    let introInterrupted = false;
    let introTimeline: gsap.core.Timeline | null = null;
    let introHero: HTMLElement | null = null;
    let currentCamera = { scale: 1, x: 0, y: 0 };
    let desiredVideoTime = 0;
    let contentCoverProgress = 0;
    const settleState = { y: 0 };
    let settleTimer: number | null = null;
    let settleTween: gsap.core.Tween | null = null;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const lowPower = connection?.saveData === true || navigator.hardwareConcurrency <= 4;
    const getPixelRatio = () => {
      const deviceRatio = window.devicePixelRatio || 1;
      if (isNarrow.matches) return Math.min(deviceRatio, lowPower ? 0.8 : 1);
      return Math.min(deviceRatio, lowPower ? 1 : 1.3);
    };

    const cameraAt = (frame: number) => {
      const stops = isNarrow.matches ? MOBILE_CAMERA_STOPS : CAMERA_STOPS;
      const nextStopIndex = stops.findIndex((stop) => stop.frame >= frame);
      const left = stops[Math.max(0, nextStopIndex < 0 ? stops.length - 2 : nextStopIndex - 1)];
      const right = stops[Math.max(1, nextStopIndex < 0 ? stops.length - 1 : nextStopIndex)];
      const raw = Math.min(1, Math.max(0, (frame - left.frame) / Math.max(1, right.frame - left.frame)));
      const eased = isReducedMotion.matches ? raw : raw * raw * (3 - 2 * raw);
      const motionFactor = isReducedMotion.matches ? 0.25 : 1;
      return {
        scale: 1 + (left.scale + (right.scale - left.scale) * eased - 1) * motionFactor,
        x: (left.x + (right.x - left.x) * eased) * motionFactor,
        y: (left.y + (right.y - left.y) * eased) * motionFactor,
      };
    };

    const smoothRange = (value: number, start: number, end: number) => {
      const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
      return t * t * (3 - 2 * t);
    };

    const requestDraw = () => {
      if (drawQueued || disposed) return;
      drawQueued = true;
      rafRef.current = requestAnimationFrame(() => {
        drawQueued = false;
        const source = fallbackActive
          ? imageCacheRef.current.get(isReducedMotion.matches ? 0 : frameIndexRef.current)
          : videoReady ? video : null;
        if (!source || disposed) return;
        const sourceWidth = fallbackActive ? (source as HTMLImageElement).naturalWidth : video.videoWidth;
        const sourceHeight = fallbackActive ? (source as HTMLImageElement).naturalHeight : video.videoHeight;
        if (!sourceWidth || !sourceHeight) return;

        const pixelRatio = getPixelRatio();
        const bounds = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width * pixelRatio));
        const height = Math.max(1, Math.round(bounds.height * pixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const fitScale = Math.max(width / sourceWidth, height / sourceHeight);
        const sceneScale = fitScale * currentCamera.scale;
        const scaledWidth = sourceWidth * sceneScale;
        const scaledHeight = sourceHeight * sceneScale;
        const x = (width - scaledWidth) / 2 - currentCamera.x * pixelRatio;
        const y = (height - scaledHeight) / 2 - currentCamera.y * pixelRatio;
        context.clearRect(0, 0, width, height);
        context.drawImage(source, x, y, scaledWidth, scaledHeight);
        // Keep the poster until a decoded sequence frame is drawn to the canvas.
        if (!sceneReady) {
          revealScene();
          if (!sceneReadyNotified) {
            sceneReadyNotified = true;
            onSceneReady();
          }
        }
      });
    };

    const syncVideoToFrame = (frame: number) => {
      if (!videoReady || !Number.isFinite(video.duration) || video.duration <= 0) return;
      desiredVideoTime = Math.min(
        video.duration - 1 / 30,
        video.duration * Math.max(0, Math.min(LAST_FRAME, frame)) / LAST_FRAME,
      );
      if (video.seeking || Math.abs(video.currentTime - desiredVideoTime) < 1 / 30) return;
      video.currentTime = desiredVideoTime;
    };

    const onVideoLoaded = () => {
      if (disposed) return;
      videoReady = true;
      video.pause();
      syncVideoToFrame(frameIndexRef.current);
      requestDraw();
    };
    const onVideoSeeked = () => {
      if (disposed) return;
      requestDraw();
      syncVideoToFrame(frameIndexRef.current);
    };
    const onVideoError = () => {
      if (disposed || fallbackActive) return;
      videoReady = false;
      video.pause();
      fallbackActive = true;
      ensureFrame(Math.round(frameIndexRef.current));
    };
    video.addEventListener('loadeddata', onVideoLoaded);
    video.addEventListener('seeked', onVideoSeeked);
    video.addEventListener('error', onVideoError);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onVideoLoaded();

    let revealScene = () => {};
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
      image.src = `/slower-sequence-webp/frame_${String(index).padStart(4, '0')}.webp`;
    };

    const playIntroWhenReady = () => {
      if (!introAllowed || !sceneReady || introStarted || isReducedMotion.matches || frameIndexRef.current > 0) return;
      introStarted = true;
      introTimeline?.play(0);
    };

    revealScene = () => {
      if (sceneReady || disposed) return;
      sceneReady = true;
      requestDraw();
      if (isReducedMotion.matches) {
        gsap.set(canvas, { opacity: 0 });
        gsap.set(loadVeilRef.current, { opacity: 0 });
        gsap.set(introHero, { opacity: 1, scale: 1, y: 0 });
        if (posterRef.current) gsap.set(posterRef.current, { opacity: 1 });
        return;
      }
      if (frameIndexRef.current > 0) {
        introInterrupted = true;
        gsap.set(canvas, { opacity: 1 });
        gsap.set(loadVeilRef.current, { opacity: 0 });
        if (posterRef.current) gsap.set(posterRef.current, { opacity: 0 });
        const introProgress = smoothRange(frameIndexRef.current, 0, 45);
        if (introVeilRef.current) {
          introVeilRef.current.style.opacity = String(1 - introProgress);
          const blur = (1 - introProgress) * 12;
          introVeilRef.current.style.backdropFilter = `blur(${blur}px)`;
          introVeilRef.current.style.setProperty('-webkit-backdrop-filter', `blur(${blur}px)`);
        }
        if (introHero) {
          introHero.style.opacity = String(1 - introProgress);
          introHero.style.transform = `translate3d(0, ${-24 * introProgress}px, 0) scale(${1 - 0.2 * introProgress})`;
          introHero.style.visibility = introProgress < 0.99 ? 'visible' : 'hidden';
        }
        return;
      }
      playIntroWhenReady();
    };
    const onExperienceReady = () => {
      introAllowed = true;
      playIntroWhenReady();
    };

    const poster = posterRef.current;
    const onPosterLoaded = () => {
      if (!poster || disposed) return;
      if (poster.naturalWidth) cacheFrame(0, poster);
      requestDraw();
      if (isReducedMotion.matches) revealScene();
    };
    const resetAndSettleScene = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTween?.kill();
      settleState.y = 0;
      sceneVisualRef.current?.style.setProperty('--scene-settle-y', '0px');
      if (isReducedMotion.matches) return;
      settleTimer = window.setTimeout(() => {
        settleTween = gsap.to(settleState, {
          y: 8,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: () => sceneVisualRef.current?.style.setProperty('--scene-settle-y', `${settleState.y}px`),
        });
      }, 160);
    };
    window.addEventListener('scroll', resetAndSettleScene, { passive: true });
    poster?.addEventListener('load', onPosterLoaded);
    window.addEventListener('architecture-experience-ready', onExperienceReady);
    const resizeObserver = new ResizeObserver(requestDraw);
    resizeObserver.observe(canvas);

    const scrollState = { frame: 0 };
    let activeScrubDuration = isReducedMotion.matches ? 0.12 : NORMAL_SCRUB_DURATION;
    const gsapContext = gsap.context(() => {
      introHero = section.querySelector<HTMLElement>('[data-intro-hero]');
      introTimeline = gsap.timeline({ paused: true });
      // Keep the poster visible while a remounted video is loading. Hiding the
      // whole scene wrapper here made client-side returns look like a black page.
      introTimeline.fromTo(sceneVisualRef.current, { scale: 1.08 }, {
        scale: 1,
        duration: 1.5,
        ease: 'power2.out',
      }, 0);
      introTimeline.to(canvas, { opacity: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
      if (posterRef.current) introTimeline.to(posterRef.current, { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0);
      introTimeline.fromTo(loadVeilRef.current, { opacity: 0.9 }, { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0);
      // Let the house complete its quiet zoom before introducing the text and veil.
      introTimeline.to(introVeilRef.current, { opacity: 1, duration: 2, ease: 'power2.inOut' }, isNarrow.matches ? 1.5 : 2.1);
      introTimeline.to(introHero, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.5,
        ease: 'power3.out',
      }, isNarrow.matches ? 1.5 : 2.1);
      if (isReducedMotion.matches) introTimeline.pause(0);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          endTrigger: sequenceTrackRef.current,
          end: 'bottom bottom',
          scrub: activeScrubDuration,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (isReducedMotion.matches) return;
            const targetFrame = self.progress * LAST_FRAME;
            const nearMilestone = SCROLL_MILESTONES.some(
              (milestone) => Math.abs(targetFrame - milestone) <= MILESTONE_EASE_RADIUS,
            );
            const nextDuration = nearMilestone ? MILESTONE_SCRUB_DURATION : NORMAL_SCRUB_DURATION;
            if (nextDuration === activeScrubDuration) return;
            activeScrubDuration = nextDuration;
            self.getTween()?.duration(nextDuration);
          },
        },
        onUpdate: () => {
          const frame = scrollState.frame;
        const progress = frame / LAST_FRAME;
        currentCamera = isReducedMotion.matches ? { scale: 1, x: 0, y: 0 } : cameraAt(frame);
        const nextFrame = Math.min(LAST_FRAME, Math.max(0, Math.round(frame)));
        if (nextFrame !== frameIndexRef.current) {
          lastDirectionRef.current = nextFrame > frameIndexRef.current ? 1 : -1;
          frameIndexRef.current = nextFrame;
        }
        if (!isReducedMotion.matches && !fallbackActive) syncVideoToFrame(frame);
        window.dispatchEvent(new CustomEvent('architecture-frame', { detail: frame }));
        if (fallbackActive) ensureFrame(isReducedMotion.matches ? 0 : nextFrame);
        if (!isReducedMotion.matches && fallbackActive) {
          for (let ahead = 1; ahead <= FRAME_PREFETCH_AHEAD; ahead += 1) ensureFrame(nextFrame + ahead * lastDirectionRef.current);
          for (let behind = 1; behind <= FRAME_PREFETCH_BEHIND; behind += 1) ensureFrame(nextFrame - behind * lastDirectionRef.current);
        }
        const coverBlur = contentCoverProgress * (lowPower ? 9 : 14);
        canvas.style.filter = coverBlur > 0.05 ? `blur(${coverBlur}px)` : 'none';
        const coverVeil = section.querySelector<HTMLElement>('[data-cover-veil]');
        if (coverVeil) coverVeil.style.opacity = String(contentCoverProgress * 0.9);
        sceneVisualRef.current?.style.setProperty('--scene-scale', '1');
        const blueVeil = section.querySelector<HTMLElement>('[data-blue-veil]');
        const blueProgress = smoothRange(frame, 157, 180);
        if (blueVeil) blueVeil.style.opacity = String(blueProgress * 0.12);
        const introProgress = smoothRange(frame, 0, 45);
        if (frame > 0 && introStarted && !introInterrupted) {
          introInterrupted = true;
          gsap.killTweensOf([canvas, loadVeilRef.current, introVeilRef.current, introHero]);
          gsap.set(canvas, { opacity: 1 });
          gsap.set(loadVeilRef.current, { opacity: 0 });
          if (posterRef.current) gsap.set(posterRef.current, { opacity: 0 });
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

      if (scrollContentRef.current) {
        ScrollTrigger.create({
          trigger: scrollContentRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            contentCoverProgress = self.progress;
            const coverBlur = contentCoverProgress * (lowPower ? 9 : 14);
            canvas.style.filter = coverBlur > 0.05 ? `blur(${coverBlur}px)` : 'none';
            const coverVeil = section.querySelector<HTMLElement>('[data-cover-veil]');
            if (coverVeil) coverVeil.style.opacity = String(contentCoverProgress * 0.9);
          },
        });
      }
    }, section);

    requestDraw();
    if (poster?.complete) onPosterLoaded();
    if (isReducedMotion.matches) fallbackActive = true;
    window.dispatchEvent(new CustomEvent('architecture-frame', { detail: 0 }));
    return () => {
      disposed = true;
      gsapContext.revert();
      resizeObserver.disconnect();
      poster?.removeEventListener('load', onPosterLoaded);
      video.removeEventListener('loadeddata', onVideoLoaded);
      video.removeEventListener('seeked', onVideoSeeked);
      video.removeEventListener('error', onVideoError);
      video.pause();
      window.removeEventListener('architecture-experience-ready', onExperienceReady);
      window.removeEventListener('scroll', resetAndSettleScene);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTween?.kill();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      imageCache.clear();
    };
  }, [onSceneReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSource) return;
    video.pause();
    video.load();
  }, [videoSource]);

  return (
    <section ref={sectionRef} className="journey-section relative bg-[#080808]" aria-label="Scroll through the architectural sequence">
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#080808]">
        <div ref={sceneVisualRef} className="architectural-scene-visual absolute -inset-3">
          <img ref={posterRef} src="/slower-sequence-webp/frame_0000.webp" alt="" aria-hidden="true" fetchPriority="high" decoding="async" className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover" />
          <video ref={videoRef} src={videoSource ?? undefined} muted playsInline preload="auto" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />
          <canvas ref={canvasRef} className="absolute inset-0 z-[11] block h-full w-full object-cover opacity-0 will-change-transform" aria-label="Scroll-controlled architectural video" />
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
