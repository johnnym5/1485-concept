import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from '@/components/site/SiteChrome';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'A design-led architecture practice with engineering coordination at the table from the start.',
  alternates: canonicalUrl('/about') ? { canonical: canonicalUrl('/about') } : undefined,
};

export default function AboutPage() {
  return (
    <ContentLayout motion="about">
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <div data-motion-reveal><PageEyebrow>14.85 / About</PageEyebrow></div>
        <div data-motion-reveal><PageTitle>Good design begins with understanding what a project needs to become.</PageTitle></div>
        <div className="mt-12 grid gap-10 border-t border-white/15 pt-8 sm:mt-16 sm:pt-12 md:grid-cols-[0.7fr_1.3fr] md:gap-24">
          <p data-motion-reveal data-motion-direction="left" className="technical-label text-[10px] text-[#C5A059]">Form · Function · Execution</p>
          <div data-motion-reveal data-motion-direction="left" data-motion-delay="0.08" className="max-w-3xl space-y-6 text-sm leading-8 text-white/70 sm:text-base sm:leading-9">
            <p>14.85 Concept Limited brings spatial design and engineering coordination into one project conversation. We define the brief, examine the site and programme, and develop architectural direction with structural and technical parameters in view.</p>
            <p>Across commercial and residential briefs, design decisions are considered in relation to form, function, tolerances, and execution. Our work begins with the conditions of each project and the requirements it must resolve.</p>
          </div>
        </div>
        <div className="mt-20 grid gap-8 border-t border-white/15 pt-8 sm:mt-28 sm:grid-cols-3 sm:pt-10">
          {[
            ['Clarity', 'Make the purpose, constraints, and priorities of a project easier to see.'],
            ['Coordination', 'Keep architectural intent connected to technical input as the design develops.'],
            ['Consideration', 'Shape decisions around how a place needs to work and feel.'],
          ].map(([title, text], index) => (
            <article key={title} data-motion-reveal data-motion-direction="left" data-motion-delay={String(index * 0.1)}>
              <h2 className="font-editorial text-3xl text-[#F4F4F0]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">{text}</p>
            </article>
          ))}
        </div>
        <Link data-motion-reveal href="/contact" className="quiet-interaction mt-16 inline-flex min-h-12 items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Start a conversation</Link>
      </section>
    </ContentLayout>
  );
}
