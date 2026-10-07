'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import InteractiveCanvasEngine from './InteractiveCanvasEngine';

export default function LoadingBuffer() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [brandMode, setBrandMode] = useState<'video' | 'logo' | 'text'>('video');
  const [videoStarted, setVideoStarted] = useState(false);
  const [brandReady, setBrandReady] = useState(false);
  const [introModeResolved, setIntroModeResolved] = useState(false);
  const [experiencePrepared, setExperiencePrepared] = useState(false);
  const [sequenceFrames, setSequenceFrames] = useState<HTMLImageElement[] | null>(null);
  const [progress, setProgress] = useState(0);
  const loadingScreenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const brandTimerRef = useRef<number | null>(null);
  const fallbackStartedRef = useRef(false);
  const brandPlaybackStartedRef = useRef(false);

  const finishBrandIntro = useCallback(() => {
    setBrandReady(true);
    try {
      window.sessionStorage.setItem('1485-home-intro-seen', '1');
    } catch {
      // Storage can be unavailable in private or restricted browsing contexts.
    }
  }, []);

  const showLogoFallback = useCallback(() => {
    if (fallbackStartedRef.current) return;
    fallbackStartedRef.current = true;
    if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
    setProgress((current) => Math.max(current, 88));
    setBrandMode('logo');
    brandTimerRef.current = window.setTimeout(finishBrandIntro, 1050);
  }, [finishBrandIntro]);

  useEffect(() => {
    let cancelled = false;
    const frameCacheName = '1485-experience-frames-v3';
    const framePaths = Array.from({ length: 201 }, (_, index) => `/slower-sequence-webp/frame_${String(index).padStart(4, '0')}.webp`);
    const loadFrameFallback = async () => {
      const frames: HTMLImageElement[] = new Array(framePaths.length);
      let completed = 0;
      const setLoadProgress = () => setProgress((current) => Math.max(current, Math.min(88, Math.round((completed / framePaths.length) * 88))));
      const decodeFrame = async (path: string, response?: Response) => {
        const image = new Image();
        image.decoding = 'async';
        if (response) image.src = URL.createObjectURL(await response.blob());
        else image.src = path;
        await image.decode();
        if (response && image.src.startsWith('blob:')) URL.revokeObjectURL(image.src);
        completed += 1;
        setLoadProgress();
        return image;
      };

      try {
        if (!('caches' in window)) throw new Error('Cache storage unavailable');
        const cache = await window.caches.open(frameCacheName);
        const cachedFrames = await Promise.all(framePaths.map((path) => cache.match(path)));
        for (let start = 0; start < framePaths.length; start += 8) {
          const batch = framePaths.slice(start, start + 8);
          await Promise.all(batch.map(async (path, offset) => {
            const index = start + offset;
            let response = cachedFrames[index];
            if (!response) {
              response = await fetch(path, { cache: 'force-cache' });
              if (!response.ok) throw new Error(`Unable to load ${path}`);
              await cache.put(path, response.clone());
            }
            frames[index] = await decodeFrame(path, response);
          }));
          if (cancelled) return;
        }
        if (cancelled) return;
        setSequenceFrames(frames);
        setExperiencePrepared(true);
      } catch {
        if (cancelled) return;
        // Without Cache Storage, load and decode the image sequence directly.
        try {
          for (let start = 0; start < framePaths.length; start += 8) {
            const batch = framePaths.slice(start, start + 8);
            await Promise.all(batch.map(async (path, offset) => {
              frames[start + offset] = await decodeFrame(path);
            }));
            if (cancelled) return;
          }
          setSequenceFrames(frames);
        } catch {
          // Reveal the page using whatever frames are available rather than leave
          // the loading overlay stuck if one of the sequence images is missing.
          const firstFrame = new Image();
          firstFrame.src = '/slower-sequence-webp/frame_0000.webp';
          try { await firstFrame.decode(); } catch { /* canvas has its own poster */ }
          if (cancelled) return;
          frames[0] = firstFrame;
          setSequenceFrames(frames);
        }
        if (cancelled) return;
        setExperiencePrepared(true);
      }
    };

    const prepareExperience = async () => {
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setProgress(88);
          setExperiencePrepared(true);
          return;
        }
        let sequenceIsCached = false;
        if ('caches' in window) {
          try {
            const cache = await window.caches.open(frameCacheName);
            const cachedFrames = await Promise.all(framePaths.map((path) => cache.match(path)));
            sequenceIsCached = cachedFrames.every(Boolean);
          } catch {
            // Continue with normal frame loading when Cache Storage is unavailable.
          }
        }
        if (sequenceIsCached) {
          fallbackStartedRef.current = true;
          setBrandMode('logo');
          brandTimerRef.current = window.setTimeout(finishBrandIntro, 760);
        } else {
          setIntroModeResolved(true);
        }
        await loadFrameFallback();
      } catch {
        if (cancelled) return;
        await loadFrameFallback();
      } finally {
        if (!cancelled) setIntroModeResolved(true);
      }
    };

    void prepareExperience();
    return () => {
      cancelled = true;
      if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
    };
  }, [finishBrandIntro]);

  useEffect(() => {
    if (!brandReady || !experiencePrepared) return;
    setProgress(100);
    const entry = loadingScreenRef.current;
    if (!entry) return;

    const startExit = window.setTimeout(() => {
      setIsLeaving(true);
      window.dispatchEvent(new Event('architecture-experience-ready'));
    }, 320);
    // Clear the loader shortly after its faster fade so it doesn't cover the
    // longer architectural image reveal underneath it.
    const removeLoader = window.setTimeout(() => setLoaderVisible(false), 2820);
    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(removeLoader);
    };
  }, [brandReady, experiencePrepared]);

  useEffect(() => {
    if (!introModeResolved || brandMode !== 'video' || videoStarted) return;
    const startupFallback = window.setTimeout(showLogoFallback, 7000);
    return () => window.clearTimeout(startupFallback);
  }, [brandMode, videoStarted, showLogoFallback, introModeResolved]);

  useEffect(() => {
    if (!introModeResolved || brandMode !== 'video') return;
    const playbackWatchdog = window.setTimeout(showLogoFallback, 20000);
    return () => window.clearTimeout(playbackWatchdog);
  }, [brandMode, showLogoFallback, introModeResolved]);

  useEffect(() => {
    if (!introModeResolved || brandMode !== 'video') return;
    const video = videoRef.current;
    if (!video || fallbackStartedRef.current) return;
    const startPlayback = () => {
      if (fallbackStartedRef.current || brandPlaybackStartedRef.current) return;
      brandPlaybackStartedRef.current = true;
      video.currentTime = 0;
      void video.play().catch(showLogoFallback);
    };
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) startPlayback();
    else video.addEventListener('canplay', startPlayback, { once: true });
    return () => video.removeEventListener('canplay', startPlayback);
  }, [brandMode, introModeResolved, showLogoFallback]);

  useEffect(() => () => {
    if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
  }, []);

  return (
    <>
      <InteractiveCanvasEngine initialFrames={sequenceFrames} />
      {loaderVisible && (
        <div
          ref={loadingScreenRef}
          className={`fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-[#080808] px-8 transition-[opacity,transform] duration-[2500ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 ${isLeaving ? 'pointer-events-none scale-[1.035] opacity-0' : 'scale-100 opacity-100'}`}
          role="status"
          aria-live="polite"
          aria-busy={!brandReady}
        >
          <div className={`flex flex-col items-center gap-5 transition-[opacity,transform] duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 ${isLeaving ? 'scale-[1.16] opacity-0' : 'scale-100 opacity-100'}`}>
            {brandMode === 'text' && (
              <div className="text-center" aria-label="14.85 Concept">
                <p className="font-editorial text-[clamp(2rem,8vw,3.5rem)] tracking-[0.08em] text-[#F4F4F0]">
                  14.<span className="text-[#C5A059]">85</span> CONCEPT
                </p>
                <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.25em] text-white/55">Architecture · Engineering</p>
              </div>
            )}
            {brandMode !== 'text' && (
              <div className="relative h-36 w-[min(72vw,18rem)] sm:h-44">
                <video
                  ref={videoRef}
                  src="/brand/landing-intro.mp4"
                  muted
                  playsInline
                  preload={introModeResolved && brandMode === 'video' ? 'auto' : 'none'}
                  aria-label="14.85 Concept animated brand intro"
                  className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out motion-reduce:duration-300 ${brandMode === 'video' && introModeResolved ? 'opacity-100' : 'opacity-0'}`}
                  onPlaying={() => setVideoStarted(true)}
                  onTimeUpdate={() => {
                    const video = videoRef.current;
                    if (video && Number.isFinite(video.duration) && video.duration > 0) {
                      setProgress(Math.min(88, Math.round((video.currentTime / video.duration) * 88)));
                    }
                  }}
                  onEnded={showLogoFallback}
                  onError={showLogoFallback}
                />
                <img
                  src="/brand/1485-logo.webp"
                  alt="14.85 Concept Limited"
                  className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out motion-reduce:duration-300 ${brandMode === 'logo' || !introModeResolved ? 'opacity-100' : 'opacity-0'}`}
                  onError={() => {
                    if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
                    setBrandMode('text');
                    finishBrandIntro();
                  }}
                />
              </div>
            )}
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#C5A059] sm:text-sm">Precision Execution</p>
          </div>
          <p className={`mt-3 text-[10px] uppercase tracking-[0.24em] text-white/55 transition-opacity duration-500 ${isLeaving ? 'opacity-0' : 'opacity-100'}`}>Preparing the experience</p>
          <div className="mt-1 h-px w-full max-w-xs overflow-hidden bg-white/15">
            <div
              className="h-full bg-[#C5A059] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
}
