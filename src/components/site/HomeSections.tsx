import Link from 'next/link';
import SiteImage from './SiteImage';
import { SiteFooter } from './SiteChrome';

const services = [
  {
    number: '01',
    title: 'Architectural design',
    text: 'Develop a considered design around the brief, site, intended use and technical requirements.',
  },
  {
    number: '02',
    title: 'Building construction',
    text: 'Coordinate construction delivery with care for specifications, workmanship and quality.',
  },
  {
    number: '03',
    title: 'Interior design',
    text: 'Shape useful, coherent interiors through planning, materials, lighting and finishes.',
  },
  {
    number: '04',
    title: 'Renovation and refurbishment',
    text: 'Improve existing spaces to meet new needs and restore function, condition and character.',
  },
  {
    number: '05',
    title: 'Project management',
    text: 'Bring clarity to coordination, programme, progress and quality through project delivery.',
  },
  {
    number: '06',
    title: 'Property development',
    text: 'Consider land, design, construction and intended use as connected parts of development.',
  },
];

const selectedImages = [
  { key: 'projectCourtyard' as const, label: 'Residential concept render', alt: 'Aerial view of a villa courtyard and swimming pool' },
  { key: 'projectGardenHome' as const, label: 'Residential concept render', alt: 'Contemporary home opening onto a garden and pool' },
  { key: 'projectEveningVilla' as const, label: 'Residential concept render', alt: 'Two-storey villa shown at dusk beside a pool' },
  { key: 'projectConstruction' as const, label: 'Construction progress', alt: 'Masonry walls and scaffold on a building under construction' },
];

export default function HomeSections() {
  return (
    <>
      <section className="home-hero relative isolate flex items-end overflow-hidden bg-[#101820]">
        <SiteImage
          image="heroHome"
          alt="Contemporary residence viewed from above within its landscaped setting"
          sizes="100vw"
          priority
          objectPosition="center 48%"
          className="hero-image-layer absolute inset-0"
        />
        <div data-hero-blackout aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-black" />
        <div data-hero-shade aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-black/35" />
        <div data-hero-gradient aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        <div data-hero-gradient aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/65 via-transparent to-black/10" />
        <div className="hero-copy relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:pb-24">
          <p className="hero-eyebrow technical-label mb-5 text-[10px] text-[#D5AF68] sm:text-xs">Abuja, Nigeria · Architecture · Construction · Development</p>
          <h1 className="font-editorial max-w-5xl text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] text-[#F4F4F0]">Thoughtfully designed spaces. Built to endure.</h1>
          <p className="hero-summary mt-6 max-w-2xl text-sm leading-7 text-white/85 sm:mt-8 sm:text-lg sm:leading-8">
            14.85 Concepts brings architectural thinking, technical coordination and construction expertise together—from the first brief through delivery.
          </p>
          <div className="hero-actions mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link href="/services" className="inline-flex min-h-12 items-center justify-center bg-[#C5A059] px-6 text-xs font-medium uppercase tracking-[0.14em] text-[#080808] hover:bg-[#D6B46F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4F4F0]">
              Explore services <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center border border-white/70 bg-black/20 px-6 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4F4F0]">
              Discuss your project
            </Link>
          </div>
        </div>
        <div data-hero-meta aria-hidden="true" className="hero-meta technical-label absolute bottom-5 right-5 z-10 hidden text-[9px] text-white/70 sm:block sm:right-8">01 — 04</div>
      </section>

      <section className="home-following-section bg-[#080808] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16 lg:gap-24">
          <div className="order-2 md:order-1">
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Building ideas · Creating spaces</p>
            <h2 className="font-editorial max-w-2xl text-[clamp(2.6rem,5vw,5rem)] leading-[0.98] text-[#F4F4F0]">A clear brief. A considered response.</h2>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/70 sm:text-base sm:leading-9">
              Based in Abuja, Nigeria, 14.85 Concepts transforms ideas into functional, considered spaces and lasting structures. We keep the brief, site and intended use in view from the beginning.
            </p>
            <Link href="/about" className="quiet-interaction mt-7 inline-flex min-h-11 items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#C5A059] hover:text-[#F4F4F0]">
              About 14.85 Concepts <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <SiteImage
            image="practiceConstruction"
            alt="Residential construction underway on a sloped site"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="site-image-hover order-1 aspect-[4/3] md:order-2 md:aspect-[5/4]"
            objectPosition="center 55%"
          />
        </div>
      </section>

      <section id="services" className="home-following-section border-y border-white/10 bg-[#101010] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 md:mb-14 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-4xl">
              <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Architecture · Construction · Development</p>
              <h2 className="font-editorial text-[clamp(2.7rem,6vw,5.8rem)] leading-[0.94] text-[#F4F4F0]">From first idea to lasting place.</h2>
            </div>
            <Link href="/services" className="quiet-interaction inline-flex min-h-11 items-center gap-3 border-b border-[#C5A059]/55 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/80 hover:text-[#C5A059]">
              All services <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="mb-px grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            <SiteImage
              image="serviceFoundations"
              alt="Reinforcement steel prepared for a concrete ground slab"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="site-image-hover aspect-[16/9] md:aspect-[2/1]"
              objectPosition="center 52%"
            />
            <div className="flex min-h-56 flex-col justify-between bg-[#0A0A0A] p-6 sm:p-9">
              <p className="technical-label text-[10px] text-[#C5A059]">Form · Function · Execution</p>
              <div>
                <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">Our capabilities connect architecture, engineering coordination, construction and development around the project’s real requirements.</p>
                <Link href="/services" className="quiet-interaction mt-5 inline-flex min-h-10 items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#C5A059] hover:text-[#F4F4F0]">Explore our capabilities <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.number} className="architectural-card min-h-56 bg-[#080808] p-6 sm:p-8">
                <p className="technical-label mb-8 text-[10px] text-[#C5A059]">{service.number} / Discipline</p>
                <h3 className="font-editorial text-3xl text-[#F4F4F0] sm:text-4xl">{service.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-white/65">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-following-section bg-[#080808] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-4xl">
              <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Selected imagery</p>
              <h2 className="font-editorial text-[clamp(2.6rem,5vw,5rem)] leading-none text-[#F4F4F0]">Design thinking, taking shape.</h2>
            </div>
            <Link href="/projects" className="quiet-interaction inline-flex min-h-11 items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#C5A059] hover:text-[#F4F4F0]">View selected work <span aria-hidden="true">↗</span></Link>
          </div>
          <p className="mb-8 max-w-2xl text-sm leading-7 text-white/55">Residential renders and construction imagery. Project-specific case studies will be added as approved details are available.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selectedImages.map((item) => (
              <figure key={item.key}>
                <SiteImage
                  image={item.key}
                  alt={item.alt}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="site-image-hover aspect-[4/5]"
                />
                <figcaption className="technical-label mt-3 text-[9px] text-white/55">{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="home-following-section border-y border-white/10 bg-[#101010] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1fr_0.85fr] md:gap-16">
          <div>
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Abuja, Nigeria · International enquiries</p>
            <h2 className="font-editorial max-w-3xl text-[clamp(2.6rem,5.5vw,5.2rem)] leading-[0.98] text-[#F4F4F0]">Based in Nigeria. Open to working beyond it.</h2>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/70 sm:text-base sm:leading-9">We welcome enquiries from residential and commercial clients in Nigeria and internationally. Each engagement is shaped around the brief, context and project requirements.</p>
          </div>
          <SiteImage
            image="serviceStructure"
            alt="Multi-storey structure in progress with scaffolding around the exterior"
            sizes="(min-width: 768px) 42vw, 100vw"
            className="site-image-hover aspect-[4/3]"
          />
        </div>
      </section>

      <section className="home-following-section bg-[#080808] px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
          <div>
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">A clear process</p>
            <h2 className="font-editorial text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.98] text-[#F4F4F0]">The right questions shape the work.</h2>
            <p className="mt-6 max-w-lg text-sm leading-8 text-white/65">We begin with the project parameters and constraints, then coordinate the design and technical decisions that support delivery.</p>
            <Link href="/about" className="quiet-interaction mt-6 inline-flex min-h-11 items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#C5A059] hover:text-[#F4F4F0]">How we work <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="grid gap-0 border-t border-white/15">
            {[
              ['01', 'Define parameters', 'Confirm the programme, site context, project stage and priorities.'],
              ['02', 'Assess constraints', 'Identify design, planning and technical conditions to resolve.'],
              ['03', 'Coordinate disciplines', 'Align architectural form with engineering input and execution requirements.'],
            ].map(([number, title, text]) => (
              <div key={number} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/15 py-6 sm:grid-cols-[4rem_1fr] sm:py-8">
                <span className="pt-1 text-xs tracking-[0.18em] text-[#C5A059]">{number}</span>
                <div>
                  <h3 className="font-editorial text-2xl text-[#F4F4F0] sm:text-3xl">{title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-7 text-white/60">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-following-section border-t border-[#C5A059]/35 bg-[#0B1014] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-4xl">
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Start a conversation</p>
            <h2 className="font-editorial text-[clamp(2.8rem,5vw,5.5rem)] leading-[0.95] text-[#F4F4F0]">Have a project in mind?</h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/65 sm:text-base">Tell us what you are planning, where the project is based and the support you need.</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center border border-[#C5A059]/70 px-6 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Discuss your project <span aria-hidden="true" className="ml-3">↗</span></Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
