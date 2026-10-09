'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import InteractiveCanvasEngine from './InteractiveCanvasEngine';

const loadingMessages = [
  'Preparing the experience',
  'Sorry this is taking a little longer than expected',
  'We’re close — thanks for hanging in there',
  'Finishing the final details',
];

export default function LoadingBuffer({ children }: { children: ReactNode }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [brandMode, setBrandMode] = useState<'video' | 'logo' | 'text'>('video');
  const [videoStarted, setVideoStarted] = useState(false);
  const [brandReady, setBrandReady] = useState(false);
  const [introModeResolved, setIntroModeResolved] = useState(false);
  const [experiencePrepared, setExperiencePrepared] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingScreenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const brandTimerRef = useRef<number | null>(null);
  const messageIntervalRef = useRef<number | null>(null);
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

  const onSceneReady = useCallback(() => setExperiencePrepared(true), []);

  const showLogoFallback = useCallback(() => {
    if (fallbackStartedRef.current) return;
    fallbackStartedRef.current = true;
    if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
    setProgress((current) => Math.max(current, 88));
    setBrandMode('logo');
    brandTimerRef.current = window.setTimeout(finishBrandIntro, 1050);
  }, [finishBrandIntro]);

  useEffect(() => {
    setProgress(88);
    setIntroModeResolved(true);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setExperiencePrepared(true);
    return () => {
      if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
    };
  }, []);

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
    if (!loaderVisible || isLeaving) return;
    const showReassurance = window.setTimeout(() => {
      setLoadingMessageIndex(1);
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
      }, 3200);
    }, 6500);
    return () => {
      window.clearTimeout(showReassurance);
      if (messageIntervalRef.current !== null) {
        window.clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    };
  }, [loaderVisible, isLeaving]);

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
      <InteractiveCanvasEngine onSceneReady={onSceneReady}>
        {children}
      </InteractiveCanvasEngine>
      {loaderVisible && (
        <div
          ref={loadingScreenRef}
          className={`fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-black px-8 transition-[opacity,transform] duration-[2500ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 ${isLeaving ? 'pointer-events-none scale-[1.035] opacity-0' : 'scale-100 opacity-100'}`}
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
          <p key={loadingMessageIndex} className={`mt-3 min-h-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/55 transition-opacity duration-500 ${isLeaving ? 'opacity-0' : 'animate-[loader-message-in_500ms_ease-out] opacity-100'}`}>
            {loadingMessages[loadingMessageIndex]}
          </p>
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
