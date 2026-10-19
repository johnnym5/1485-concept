'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  aspect: string;
  metrics: { label: string; value: string }[];
}

const galleryItems: GalleryItem[] = [
  {
    id: 'residence-01',
    title: 'Precision Residence & Enclosure',
    category: 'Residential Architecture',
    description: 'A multi-tiered private sanctuary engineered with cantilevered post-tensioned slabs, triple-glazed thermally isolated facades, and integrated timber cladding.',
    image: '/brand/Exploded_view_modern_residence_20261009084421.jpg',
    aspect: 'aspect-[16/10]',
    metrics: [
      { label: 'Structural Span', value: '18.4m Clear' },
      { label: 'Facade Performance', value: 'U-Value 0.82' },
    ],
  },
  {
    id: 'model-02',
    title: 'Deconstructed Structural Core',
    category: 'Engineering Coordination',
    description: 'Complete BIM coordination revealing the reinforced concrete framing, shear wall cores, and sub-grade foundation piling matrix required for long-term permanence.',
    image: '/brand/Exploded_view_modern_house_model_20261009084425.jpg',
    aspect: 'aspect-[16/10]',
    metrics: [
      { label: 'Foundation Depth', value: '14.5m Piles' },
      { label: 'BIM Discipline Sync', value: '100% LOD 400' },
    ],
  },
  {
    id: 'frame-03',
    title: 'Integrated Building Envelope',
    category: 'Technical Design',
    description: 'Custom perimeter fenestration and ventilated rain-screen panels aligned with computational solar shading to optimize energy density and interior acoustic insulation.',
    image: '/exploded-images-webp/frame_0045.webp',
    aspect: 'aspect-[16/10]',
    metrics: [
      { label: 'Acoustic Isolation', value: 'STC 58' },
      { label: 'Envelope Air-Tightness', value: '0.6 ACH@50Pa' },
    ],
  },
];

export default function ImageScrollGallery() {
  const containerRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const leftCol = leftColRef.current;
    if (!container || !leftCol) return;

    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    const ctx = gsap.context(() => {
      if (reducedMotion) return;

      // Desktop sticky pinning for the left context column
      if (isDesktop) {
        ScrollTrigger.create({
          trigger: container,
          start: 'top 120px',
          end: 'bottom 90%',
          pin: leftCol,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      }

      // Scroll-driven scale, opacity, and blur animations for each gallery card
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const image = card.querySelector<HTMLElement>('[data-gallery-image]');
        const textWords = card.querySelectorAll<HTMLElement>('[data-scrub-word]');

        if (image) {
          // Entry scaling & focus
          gsap.fromTo(
            image,
            { scale: 0.84, opacity: 0.35, filter: 'blur(10px)' },
            {
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 32%',
                scrub: 0.5,
              },
            }
          );

          // Exit fading & recession
          gsap.to(image, {
            scale: 0.92,
            opacity: 0.25,
            filter: 'blur(6px)',
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'bottom 45%',
              end: 'bottom 10%',
              scrub: 0.5,
            },
          });
        }

        // Sequential word opacity scrub reveal
        if (textWords.length > 0) {
          gsap.fromTo(
            textWords,
            { opacity: 0.18, y: 4 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 70%',
                end: 'top 35%',
                scrub: 0.4,
              },
            }
          );
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative isolate overflow-hidden bg-[#080808] px-5 py-28 sm:px-8 sm:py-40 border-t border-white/10"
      aria-label="Architectural sequence gallery"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          {/* Left Column — Pinned Title & Technical Context */}
          <div ref={leftColRef} className="lg:h-fit lg:self-start">
            <div className="max-w-xl">
              <p className="technical-label mb-4 text-[10px] text-[#C5A059]">
                14.85 / Structural Sequence
              </p>
              <h2 className="font-editorial text-[clamp(2.5rem,5vw,4.8rem)] leading-[1.02] text-[#F4F4F0]">
                Engineering revealed through form.
              </h2>
              <p className="mt-6 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                Explore key architectural stages where design geometry directly correlates with structural, thermal, and spatial efficiency.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <Link
                  href="/projects"
                  className="quiet-interaction inline-flex min-h-12 items-center justify-center border border-[#C5A059]/70 px-6 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808] transition-colors duration-300"
                >
                  View selected work
                </Link>
                <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/40">
                  3 Highlights
                </span>
              </div>
            </div>
          </div>

          {/* Right Column — Scroll-Driven Gallery Cards */}
          <div className="flex flex-col gap-24 sm:gap-36">
            {galleryItems.map((item, index) => {
              const words = item.description.split(' ');
              return (
                <article
                  key={item.id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className="group relative flex flex-col gap-6"
                >
                  {/* Image Container with Subtle Gold Border Glow */}
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5 ${item.aspect} shadow-2xl transition-colors duration-500 group-hover:border-[#C5A059]/50`}
                  >
                    <div
                      data-gallery-image
                      className="absolute inset-0 h-full w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
                      <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C5A059]">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Typography & Details */}
                  <div className="px-1">
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#F4F4F0] leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base sm:leading-8 max-w-2xl">
                      {words.map((word, wIdx) => (
                        <span
                          key={`${item.id}-w-${wIdx}`}
                          data-scrub-word
                          className="inline-block mr-1.5 transition-opacity"
                        >
                          {word}
                        </span>
                      ))}
                    </p>

                    {/* Technical Metric Chips */}
                    <div className="mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-5">
                      {item.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2"
                        >
                          <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-white/45">
                            {m.label}:
                          </span>
                          <span className="font-sans text-xs font-medium tracking-wide text-[#C5A059]">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
