import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from '@/components/site/SiteChrome';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Architecture and integrated engineering coordination for commercial and residential projects.',
  alternates: canonicalUrl('/services') ? { canonical: canonicalUrl('/services') } : undefined,
};

const capabilities = [
  {
    number: '01',
    title: 'Architectural design',
    description: 'A full design service that establishes spatial direction around the brief, site, programme, and intended use of a project.',
    points: ['Brief definition and feasibility', 'Spatial planning and concept design', 'Facade development and design documentation'],
  },
  {
    number: '02',
    title: 'Engineering disciplines',
    description: 'Structural and technical input is coordinated with architectural intent, supporting informed decisions on systems, tolerances, and execution.',
    points: ['Identify structural and technical parameters', 'Coordinate specialist input with design decisions', 'Maintain alignment between form and execution'],
  },
];

export default function ServicesPage() {
  return (
    <ContentLayout motion="services">
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div data-motion-reveal data-motion-delay="0.04"><PageEyebrow>14.85 / Core capabilities</PageEyebrow></div>
        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-20">
          <div data-motion-reveal><PageTitle>Spatial design. Technical precision.</PageTitle></div>
          <p data-motion-reveal data-motion-delay="0.1" className="max-w-xl pb-2 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Architectural design and engineering coordination developed together from the early brief, with form, function, and execution requirements held in view.
          </p>
        </div>
        <div className="mt-16 border-t border-white/15 sm:mt-24">
          {capabilities.map((item, index) => (
            <article key={item.number} data-motion-reveal data-motion-delay={String(index * 0.12)} className="grid gap-6 border-b border-white/15 py-9 sm:py-12 md:grid-cols-[5rem_0.8fr_1.2fr] md:gap-10">
              <span className="text-xs tracking-[0.2em] text-[#C5A059]">{item.number}</span>
              <h2 className="font-editorial text-3xl text-[#F4F4F0] sm:text-4xl">{item.title}</h2>
              <div>
                <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{item.description}</p>
                <ul className="mt-5 grid gap-2 text-xs leading-6 text-white/55 sm:grid-cols-2 sm:text-sm">
                  {item.points.map((point) => <li key={point} className="before:mr-3 before:text-[#C5A059] before:content-['—']">{point}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <div data-motion-reveal className="mt-16 flex flex-col gap-5 border-l border-[#C5A059] pl-5 sm:mt-20 sm:pl-8">
          <p className="font-editorial text-3xl text-[#F4F4F0] sm:text-4xl">Establish the design brief.</p>
          <p className="max-w-2xl text-sm leading-7 text-white/60">Review site conditions, programme requirements, and the technical parameters that will inform the project.</p>
          <Link href="/contact" className="quiet-interaction mt-2 inline-flex min-h-12 w-fit items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Discuss your project</Link>
        </div>
      </section>
    </ContentLayout>
  );
}
