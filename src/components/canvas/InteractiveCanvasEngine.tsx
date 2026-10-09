'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getSceneSegment, SCENE_FALLBACK_IMAGES, SCENE_SEGMENTS, SCENE_VIDEO_SOURCE } from '../../lib/sceneStrategy.mjs';
import TypographyLayer from '../overlay/TypographyLayer';

const LAST_FRAME = 200;
const VIDEO_PREVIEW_ONLY = true;
interface InteractiveCanvasEngineProps {
  onSceneReady: () => void;
  children: ReactNode;
}

export default function InteractiveCanvasEngine({ onSceneReady, children }: InteractiveCanvasEngineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sequenceTrackRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const sceneVisualRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const loadVeilRef = useRef<HTMLDivElement>(null);
  const introVeilRef = useRef<HTMLDivElement>(null);
  const frameIndexRef = useRef(0);
  const segmentRef = useRef<string | null>(null);
  const activeImageIndexRef = useRef(0);
  const readyRef = useRef(false);
  const useImagesRef = useRef(false);
  const loadedImagesRef = useRef(new Set([0]));
  const decodedImagesRef = useRef(new Set<number>());
  const [useImages, setUseImages] = useState(false);
  const [loadedImages, setLoadedImages] = useState<number[]>([0]);
  const [decodedImages, setDecodedImages] = useState<number[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const scene = sceneVisualRef.current;
    const poster = posterRef.current;
    if (!section || !video || !scene || !poster) return;

    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowNetwork = !VIDEO_PREVIEW_ONLY && reducedMotion;
    let disposed = false;
    let introAllowed = false;
    let introStarted = false;
    let introInterrupted = false;
    let sceneReady = false;
    let playbackRejected = false;
    let waitingForInitialVideoReady = true;
    let seekToken = 0;
    let currentImageIndex = 0;
    let coverProgress = 0;
    let playbackWatchdog: number | null = null;
    let bufferWatchdog: number | null = null;
    let accelerationTween: gsap.core.Tween | null = null;
    let decelerationTween: gsap.core.Tween | null = null;
    let introTimeline: gsap.core.Timeline | null = null;
    let introHero: HTMLElement | null = null;
    const playbackRate = { value: 1 };
    const showFallbackImage = (imageIndex: number) => {
      activeImageIndexRef.current = imageIndex;
      setActiveImageIndex(imageIndex);
    };

    const notifyReady = () => {
      if (sceneReady || disposed) return;
      sceneReady = true;
      readyRef.current = true;
      gsap.set(loadVeilRef.current, { opacity: 0 });
      if (poster.complete && poster.naturalWidth) playIntroWhenReady();
      onSceneReady();
    };

    const selectImageFallback = () => {
      if (disposed || VIDEO_PREVIEW_ONLY || useImagesRef.current) return;
      useImagesRef.current = true;
      setUseImages(true);
      const coverVeil = section.querySelector<HTMLElement>('[data-cover-veil]');
      if (coverVeil) coverVeil.style.opacity = String(coverProgress * 0.12);
      video.pause();
      const fallbackIndex = decodedImagesRef.current.has(currentImageIndex) ? currentImageIndex : activeImageIndexRef.current;
      showFallbackImage(fallbackIndex);
      if (!loadedImagesRef.current.has(currentImageIndex)) {
        loadedImagesRef.current.add(currentImageIndex);
        setLoadedImages((current) => current.includes(currentImageIndex) ? current : [...current, currentImageIndex]);
      }
      if (decodedImagesRef.current.has(currentImageIndex) || decodedImagesRef.current.has(activeImageIndexRef.current)) fadeVideoToStill();
      setTimeout(() => {
        const fallback = document.querySelector<HTMLImageElement>(`[data-fallback-image="${currentImageIndex}"]`);
        if (fallback?.complete && fallback.naturalWidth) notifyReady();
      }, 0);
    };

    const loadImageForSegment = (imageIndex: number) => {
      currentImageIndex = imageIndex;
      if (!useImagesRef.current || decodedImagesRef.current.has(imageIndex)) showFallbackImage(imageIndex);
      if (!loadedImagesRef.current.has(imageIndex)) {
        loadedImagesRef.current.add(imageIndex);
        setLoadedImages((current) => current.includes(imageIndex) ? current : [...current, imageIndex]);
      }
    };

    const fadeVideoToStill = () => {
      gsap.to(video, {
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          if (useImagesRef.current) {
            video.removeAttribute('src');
            video.load();
          }
        },
      });
      if (activeImageIndexRef.current === 0) gsap.to(poster, { opacity: 1, duration: 2, ease: 'power2.inOut' });
    };

    const checkVideoReady = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (playbackWatchdog !== null) window.clearTimeout(playbackWatchdog);
        playbackWatchdog = null;
        if (!useImagesRef.current) {
          gsap.to(video, { opacity: 1, duration: 0.65, ease: 'power2.out' });
          gsap.to(poster, { opacity: 0, duration: 0.65, ease: 'power2.out' });
          notifyReady();
          if (waitingForInitialVideoReady && segmentRef.current) {
            waitingForInitialVideoReady = false;
            segmentRef.current = null;
            schedulePlayback(getSceneSegment(frameIndexRef.current));
          }
        }
      }
    };

    const schedulePlayback = (segment: (typeof SCENE_SEGMENTS)[number]) => {
      if (playbackRejected) return;
      if (segmentRef.current === segment.id) return;
      segmentRef.current = segment.id;
      currentImageIndex = segment.imageIndex;
      loadImageForSegment(segment.imageIndex);
      accelerationTween?.kill();
      accelerationTween = null;
      decelerationTween?.kill();
      decelerationTween = null;
      if (bufferWatchdog !== null) window.clearTimeout(bufferWatchdog);
      video.pause();
      if (lowNetwork || useImagesRef.current) return;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        bufferWatchdog = window.setTimeout(selectImageFallback, 5000);
        return;
      }
      waitingForInitialVideoReady = false;
      const currentSeekToken = ++seekToken;
      const startPlayback = () => {
        if (disposed || currentSeekToken !== seekToken || segmentRef.current !== segment.id) return;
        playbackRate.value = 0.25;
        video.playbackRate = playbackRate.value;
        void video.play().then(() => {
          playbackRejected = false;
          accelerationTween = gsap.to(playbackRate, {
            value: 1,
            duration: 0.7,
            ease: 'power2.out',
            onUpdate: () => { video.playbackRate = playbackRate.value; },
            onComplete: () => { accelerationTween = null; },
          });
        }).catch(() => {
          if (segmentRef.current !== segment.id) return;
          playbackRejected = true;
          segmentRef.current = null;
          video.pause();
        });
      };
      video.addEventListener('seeked', startPlayback, { once: true });
      video.currentTime = segment.startSeconds;
      if (!video.seeking) {
        video.removeEventListener('seeked', startPlayback);
        startPlayback();
      }
    };

    const finishSegment = () => {
      const segment = getSceneSegment(frameIndexRef.current);
      if (segmentRef.current !== segment.id) return;
      accelerationTween?.kill();
      accelerationTween = null;
      decelerationTween?.kill();
      decelerationTween = null;
      video.pause();
      video.currentTime = segment.endSeconds;
      video.playbackRate = 1;
    };

    const monitorVideo = () => {
      if (disposed || video.paused || useImagesRef.current) return;
      const segment = getSceneSegment(frameIndexRef.current);
      if (segmentRef.current !== segment.id) return;
      const remaining = segment.endSeconds - video.currentTime;
      if (remaining <= 0.75) {
        if (!decelerationTween) {
          decelerationTween = gsap.to(playbackRate, {
            value: 0.1,
            duration: 0.65,
            ease: 'power2.in',
            onUpdate: () => { video.playbackRate = playbackRate.value; },
            onComplete: finishSegment,
          });
        }
      } else if (remaining <= 0) {
        finishSegment();
      }
    };

    let monitorFrame = 0;
    const watchPlayback = () => {
      monitorVideo();
      monitorFrame = requestAnimationFrame(watchPlayback);
    };
    monitorFrame = requestAnimationFrame(watchPlayback);

    const playIntroWhenReady = () => {
      if (!introAllowed || !sceneReady || introStarted || reducedMotion || frameIndexRef.current > 0) return;
      introStarted = true;
      introTimeline?.play(0);
    };
    const onExperienceReady = () => {
      introAllowed = true;
      playIntroWhenReady();
    };
    const onPosterLoad = () => {
      if (!poster.naturalWidth) return;
      decodedImagesRef.current.add(0);
      setDecodedImages((current) => current.includes(0) ? current : [...current, 0]);
      if (lowNetwork) notifyReady();
      else checkVideoReady();
    };
    const onVideoReady = () => checkVideoReady();
    const onVideoError = () => selectImageFallback();
    const onWaiting = () => {
      if (bufferWatchdog !== null || useImagesRef.current) return;
      bufferWatchdog = window.setTimeout(selectImageFallback, 5000);
    };
    const onPlaying = () => {
      playbackRejected = false;
      if (bufferWatchdog !== null) window.clearTimeout(bufferWatchdog);
      bufferWatchdog = null;
    };
    const retryPlaybackFromGesture = () => {
      if (!playbackRejected || disposed) return;
      const segment = getSceneSegment(frameIndexRef.current);
      playbackRejected = false;
      segmentRef.current = segment.id;
      currentImageIndex = segment.imageIndex;
      loadImageForSegment(segment.imageIndex);
      accelerationTween?.kill();
      accelerationTween = null;
      decelerationTween?.kill();
      decelerationTween = null;
      if (bufferWatchdog !== null) window.clearTimeout(bufferWatchdog);
      bufferWatchdog = null;
      playbackRate.value = 0.25;
      video.playbackRate = playbackRate.value;
      const playRequest = video.play();
      video.currentTime = segment.startSeconds;
      void playRequest.then(() => {
        if (disposed || segmentRef.current !== segment.id) return;
        accelerationTween = gsap.to(playbackRate, {
          value: 1,
          duration: 0.7,
          ease: 'power2.out',
          onUpdate: () => { video.playbackRate = playbackRate.value; },
          onComplete: () => { accelerationTween = null; },
        });
      }).catch(() => {
        if (segmentRef.current !== segment.id) return;
        playbackRejected = true;
        segmentRef.current = null;
        video.pause();
      });
    };
    const onFallbackImageLoad = (event: Event) => {
      const target = event.target as HTMLImageElement;
      const imageIndex = Number(target.dataset.fallbackImage);
      if (target.naturalWidth && Number.isInteger(imageIndex)) {
        decodedImagesRef.current.add(imageIndex);
        setDecodedImages((current) => current.includes(imageIndex) ? current : [...current, imageIndex]);
        if (imageIndex === currentImageIndex) {
          showFallbackImage(imageIndex);
          if (useImagesRef.current) fadeVideoToStill();
        }
      }
      if (target.naturalWidth && Number(target.dataset.fallbackImage) === currentImageIndex) notifyReady();
    };
    const onFallbackImageError = (event: Event) => {
      const target = event.target as HTMLImageElement;
      const imageIndex = Number(target.dataset.fallbackImage);
      if (!useImagesRef.current || !Number.isInteger(imageIndex) || imageIndex !== currentImageIndex) return;
      const lastVisible = decodedImagesRef.current.has(activeImageIndexRef.current) ? activeImageIndexRef.current : 0;
      showFallbackImage(lastVisible);
      if (decodedImagesRef.current.has(lastVisible)) fadeVideoToStill();
    };
    poster.addEventListener('load', onPosterLoad);
    video.addEventListener('loadeddata', onVideoReady);
    video.addEventListener('canplay', onVideoReady);
    video.addEventListener('error', onVideoError);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    window.addEventListener('pointerdown', retryPlaybackFromGesture, { passive: true });
    window.addEventListener('wheel', retryPlaybackFromGesture, { passive: true });
    window.addEventListener('keydown', retryPlaybackFromGesture);
    section.addEventListener('load', onFallbackImageLoad, true);
    section.addEventListener('error', onFallbackImageError, true);
    window.addEventListener('architecture-experience-ready', onExperienceReady);

    const revealWithImages = () => {
      if (lowNetwork) {
        useImagesRef.current = true;
        setUseImages(true);
        if (poster.complete && poster.naturalWidth) notifyReady();
      } else {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.src = SCENE_VIDEO_SOURCE;
        video.load();
        playbackWatchdog = window.setTimeout(() => {
          if (!sceneReady) selectImageFallback();
        }, 5000);
      }
    };

    const scrollState = { frame: 0 };
    const smoothRange = (value: number, start: number, end: number) => {
      const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
      return t * t * (3 - 2 * t);
    };
    const setCoverVisuals = () => {
      const coverVeil = section.querySelector<HTMLElement>('[data-cover-veil]');
      if (coverVeil) coverVeil.style.opacity = String(coverProgress * (useImagesRef.current ? 0.12 : 0.9));
      scene.style.filter = coverProgress > 0.02 ? `blur(${coverProgress * 12}px)` : 'none';
    };

    const gsapContext = gsap.context(() => {
      introHero = section.querySelector<HTMLElement>('[data-intro-hero]');
      introTimeline = gsap.timeline({ paused: true });
      introTimeline.fromTo(scene, { scale: 1.08 }, { scale: 1, duration: 1.5, ease: 'power2.out' }, 0);
      introTimeline.to(poster, { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0);
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
          scrub: reducedMotion ? 0 : 0.45,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const frame = scrollState.frame;
          const progress = frame / LAST_FRAME;
          const nextFrame = Math.min(LAST_FRAME, Math.max(0, Math.round(frame)));
          const nextSegment = getSceneSegment(nextFrame);
          if (nextFrame !== frameIndexRef.current) frameIndexRef.current = nextFrame;
          schedulePlayback(nextSegment);
          window.dispatchEvent(new CustomEvent('architecture-frame', { detail: frame }));
          const blueVeil = section.querySelector<HTMLElement>('[data-blue-veil]');
          if (blueVeil) blueVeil.style.opacity = String(smoothRange(frame, 157, 180) * 0.12);
          const introProgress = smoothRange(frame, 0, 45);
          if (frame > 0 && introStarted && !introInterrupted) {
            introInterrupted = true;
            gsap.killTweensOf([scene, loadVeilRef.current, introVeilRef.current, introHero]);
            gsap.set(loadVeilRef.current, { opacity: 0 });
            gsap.set(poster, { opacity: 0 });
            if (!useImagesRef.current) gsap.set(video, { opacity: 1 });
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

    if (poster.complete) onPosterLoad();
    revealWithImages();
    schedulePlayback(getSceneSegment(0));
    window.dispatchEvent(new CustomEvent('architecture-frame', { detail: 0 }));
    return () => {
      disposed = true;
      gsapContext.revert();
      poster.removeEventListener('load', onPosterLoad);
      video.removeEventListener('loadeddata', onVideoReady);
      video.removeEventListener('canplay', onVideoReady);
      video.removeEventListener('error', onVideoError);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      window.removeEventListener('pointerdown', retryPlaybackFromGesture);
      window.removeEventListener('wheel', retryPlaybackFromGesture);
      window.removeEventListener('keydown', retryPlaybackFromGesture);
      section.removeEventListener('load', onFallbackImageLoad, true);
      section.removeEventListener('error', onFallbackImageError, true);
      window.removeEventListener('architecture-experience-ready', onExperienceReady);
      if (playbackWatchdog !== null) window.clearTimeout(playbackWatchdog);
      if (bufferWatchdog !== null) window.clearTimeout(bufferWatchdog);
      decelerationTween?.kill();
      accelerationTween?.kill();
      cancelAnimationFrame(monitorFrame);
      video.pause();
    };
  }, [onSceneReady]);

  useEffect(() => {
    if (!useImages || !loadedImages.includes(0)) return;
    const firstImage = posterRef.current;
    if (firstImage?.complete && firstImage.naturalWidth && !readyRef.current) {
      readyRef.current = true;
      gsap.to(loadVeilRef.current, { opacity: 0, duration: 0.6 });
      onSceneReady();
    }
  }, [loadedImages, onSceneReady, useImages]);

  return (
    <section ref={sectionRef} className="journey-section relative bg-[#080808]" aria-label="Scroll through the architectural sequence">
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#080808]">
        <div ref={sceneVisualRef} className={`architectural-scene-visual absolute -inset-3 ${useImages ? 'scene-fallback-surface' : ''}`}>
          {SCENE_FALLBACK_IMAGES.map((src, index) => loadedImages.includes(index) ? (
            <Image
              key={src}
              ref={index === 0 ? posterRef : undefined}
              data-fallback-image={index}
              src={src}
              fill
              sizes="100vw"
              alt=""
              aria-hidden="true"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`pointer-events-none object-cover transition-opacity duration-[12000ms] ease-in-out motion-reduce:duration-0 ${useImages ? 'scene-fallback-image-active' : ''} ${currentImageClass(index, useImages, activeImageIndex, decodedImages.includes(index))}`}
            />
          ) : null)}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            className="scene-chapter-video pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
          />
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

function currentImageClass(index: number, useImages: boolean, activeImageIndex: number, decoded: boolean) {
  return useImages && index === activeImageIndex && decoded ? 'z-[11] opacity-100' : 'z-0 opacity-0';
}
