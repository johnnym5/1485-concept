'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import InteractiveCanvasEngine from './InteractiveCanvasEngine';

const FIRST_FRAME = 0;
const BUFFER_END = 30;

export type FrameBuffer = Array<HTMLImageElement | null>;

export default function LoadingBuffer() {
  const [frames, setFrames] = useState<FrameBuffer | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [brandMode, setBrandMode] = useState<'video' | 'logo' | 'text'>('video');
  const [videoStarted, setVideoStarted] = useState(false);
  const [brandReady, setBrandReady] = useState(false);
  const loadingScreenRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const brandTimerRef = useRef<number | null>(null);

  const showLogoFallback = useCallback(() => {
    if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
    setBrandMode('logo');
    brandTimerRef.current = window.setTimeout(() => setBrandReady(true), 850);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const buffer: FrameBuffer = Array(BUFFER_END + 1).fill(null);

    Promise.all(
      Array.from({ length: BUFFER_END - FIRST_FRAME + 1 }, (_, offset) => {
        const index = FIRST_FRAME + offset;
        return new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.decoding = 'async';
          image.onload = () => {
            buffer[index] = image;
            loaded += 1;
            if (!cancelled) setProgress(Math.round((loaded / buffer.length) * 100));
            resolve();
          };
          image.onerror = () => reject(new Error(`Unable to load frame_${String(index).padStart(4, '0')}.webp`));
          image.src = `/sequence/frame_${String(index).padStart(4, '0')}.webp`;
        });
      }),
    )
      .then(() => {
        if (!cancelled) setFrames(buffer);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'The image sequence could not be loaded.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!frames || !isLeaving) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event('architecture-experience-ready'));
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [frames, isLeaving]);

  useEffect(() => {
    if (!frames || !brandReady) return;
    const entry = loadingScreenRef.current;
    if (!entry) return;

    // Keep the completed progress state visible briefly, then let the first canvas frame
    // appear underneath as the loader lifts and fades away.
    const startExit = window.setTimeout(() => setIsLeaving(true), 320);
    const removeLoader = window.setTimeout(() => {
      entry.remove();
    }, 1500);

    return () => {
      window.clearTimeout(startExit);
      window.clearTimeout(removeLoader);
    };
  }, [frames, brandReady]);

  useEffect(() => {
    if (brandMode !== 'video' || videoStarted) return;
    const startupFallback = window.setTimeout(showLogoFallback, 2600);
    return () => window.clearTimeout(startupFallback);
  }, [brandMode, videoStarted, showLogoFallback]);

  useEffect(() => {
    if (brandMode !== 'video') return;
    const playbackWatchdog = window.setTimeout(showLogoFallback, 15000);
    return () => window.clearTimeout(playbackWatchdog);
  }, [brandMode, showLogoFallback]);

  useEffect(() => () => {
    if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-center text-sm text-[#F4F4F0]" role="alert">
        Image sequence unavailable: {error}
      </div>
    );
  }

  if (!frames || !isLeaving) {
    return (
      <div
        ref={loadingScreenRef}
        className={`fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-[#080808] px-8 transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 ${isLeaving ? 'pointer-events-none -translate-y-5 opacity-0 blur-[2px]' : 'translate-y-0 opacity-100 blur-0'}`}
        role="status"
        aria-live="polite"
        aria-busy={!frames}
      >
        <div className={`flex flex-col items-center gap-5 transition-[opacity,transform] duration-700 ease-out ${isLeaving ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}>
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
                autoPlay
                muted
                playsInline
                preload="auto"
                aria-label="14.85 Concept animated brand intro"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out motion-reduce:duration-300 ${brandMode === 'video' ? 'opacity-100' : 'opacity-0'}`}
                onCanPlay={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  void video.play().catch(showLogoFallback);
                }}
                onPlaying={() => setVideoStarted(true)}
                onEnded={showLogoFallback}
                onError={showLogoFallback}
              />
              <img
                src="/brand/1485-logo.webp"
                alt="14.85 Concept Limited"
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out motion-reduce:duration-300 ${brandMode === 'logo' ? 'opacity-100' : 'opacity-0'}`}
                onError={() => {
                  if (brandTimerRef.current !== null) window.clearTimeout(brandTimerRef.current);
                  setBrandMode('text');
                  setBrandReady(true);
                }}
              />
            </div>
          )}
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#C5A059] sm:text-sm">Precision Execution</p>
        </div>
        <p className={`mt-3 text-[10px] uppercase tracking-[0.24em] text-white/55 transition-opacity duration-500 ${isLeaving ? 'opacity-0' : 'opacity-100'}`}>Preparing the experience</p>
        <div className="mt-1 h-px w-full max-w-xs overflow-hidden bg-white/15">
          <div
            className="h-full bg-[#C5A059] transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-[10px] tabular-nums text-white/40 transition-opacity duration-500 ${isLeaving ? 'opacity-0' : 'opacity-100'}`}>{progress}%</span>
      </div>
    );
  }

  return (
    <>
      <InteractiveCanvasEngine initialFrames={frames} />
      <div ref={loadingScreenRef} className="pointer-events-none fixed inset-0 z-[100] -translate-y-5 bg-[#080808] opacity-0 blur-[2px]" aria-hidden="true" />
    </>
  );
}
