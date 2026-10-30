import Link from 'next/link';
import { SiteFooter } from './SiteChrome';
import { PageMotion } from './SiteMotion';
import ImageScrollGallery from './ImageScrollGallery';

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

export default function HomeSections() {
  return (
    <>
      <PageMotion page="home-support">
      <section className="spatial-practice-section relative isolate overflow-hidden border-y border-white/10 px-5 py-24 sm:px-8 sm:py-32">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-20">
          <div data-motion-reveal>
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Building ideas · Creating spaces</p>
            <h2 className="font-editorial text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.02] text-[#F4F4F0]">Thoughtfully designed spaces. Built to endure.</h2>
          </div>
          <div data-motion-reveal className="max-w-2xl md:pb-2">
            <p className="text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
              Based in Abuja, Nigeria, 14.85 Concepts transforms ideas into functional, considered spaces and lasting structures. We bring architectural thinking, engineering coordination and construction expertise together, keeping the brief, site and intended use in view from the beginning.
            </p>
            <Link href="/about" className="quiet-interaction mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#C5A059] hover:text-[#F4F4F0]">
              About 14.85 Concepts <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#080808]/95 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div data-motion-reveal className="max-w-3xl">
              <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Architecture · Construction · Development</p>
              <h2 className="font-editorial text-[clamp(2.7rem,6vw,5.8rem)] leading-none text-[#F4F4F0]">From first idea to lasting place.</h2>
            </div>
            <Link data-motion-reveal href="/services" className="quiet-interaction inline-flex shrink-0 items-center gap-3 border-b border-[#C5A059]/50 pb-2 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0]/80 hover:text-[#C5A059]">
              Explore services <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.number} className="architectural-card min-h-64 p-7 sm:p-10 md:p-12">
                <div data-motion-reveal>
                  <p className="technical-label mb-12 text-xs text-[#C5A059]">{service.number} / Discipline</p>
                  <h3 className="font-editorial text-3xl text-[#F4F4F0] sm:text-4xl">{service.title}</h3>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/65 sm:text-base sm:leading-8">{service.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ImageScrollGallery />

      <section className="bg-[#080808]/95 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 border-y border-white/15 py-10 sm:py-14 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <div data-motion-reveal>
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Abuja, Nigeria · International enquiries</p>
            <h2 className="font-editorial text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.02] text-[#F4F4F0]">Based in Nigeria. Open to working beyond it.</h2>
          </div>
          <div data-motion-reveal data-motion-delay="0.08" className="max-w-2xl md:pb-2">
            <p className="text-base leading-8 text-white/70 sm:text-lg sm:leading-9">We welcome enquiries from clients, property owners, developers and organisations based internationally. Remote consultation, design development and project communication can be discussed around the scope and location of each brief.</p>
            <p className="mt-5 text-sm leading-7 text-white/55">For projects in Nigeria managed from overseas, we can discuss suitable design, coordination and local project support based on the requirements.</p>
            <Link href="/contact" className="quiet-interaction mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#C5A059] hover:text-[#F4F4F0]">Discuss an international project <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1014]/95 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
          <div data-motion-reveal>
            <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Start a conversation</p>
            <h2 className="font-editorial text-[clamp(2.6rem,5.5vw,5rem)] leading-[1.02] text-[#F4F4F0]">Have a project in mind? Let’s bring it to life.</h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Whether you are planning a home, developing a commercial property, renovating a space or exploring a new opportunity, let’s start with the brief and the outcome you have in mind.
            </p>
            <Link href="/contact" className="quiet-interaction mt-8 inline-flex min-h-12 items-center justify-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.17em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">
              Discuss your project
            </Link>
          </div>
          <div className="grid gap-0 border-t border-white/15">
            {[
              ['01', 'Define parameters', 'Confirm the programme, site context, project stage, and priorities.'],
              ['02', 'Assess constraints', 'Identify design, planning, and technical conditions to resolve.'],
              ['03', 'Coordinate disciplines', 'Align architectural form with engineering input and execution requirements.'],
            ].map(([number, title, text]) => (
              <div key={number} data-motion-reveal className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/15 py-6 sm:grid-cols-[4rem_1fr] sm:py-8">
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

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 border-t border-[#C5A059]/35 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div data-motion-reveal>
            <p className="technical-label mb-4 text-[10px] text-[#C5A059]">Project record</p>
            <h2 className="font-editorial text-4xl text-[#F4F4F0] sm:text-5xl">Work is best understood in context.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">Selected work will be presented here as approved project records become available.</p>
          </div>
          <Link data-motion-reveal href="/contact" className="quiet-interaction inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#C5A059] hover:text-[#F4F4F0]">Discuss a project <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      </PageMotion>
      <SiteFooter />
    </>
  );
}
