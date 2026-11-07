import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from '@/components/site/SiteChrome';
import SiteImage from '@/components/site/SiteImage';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet 14.85 Concepts, an Abuja-based architecture, construction and built-environment company focused on thoughtful design and enduring spaces.',
  alternates: canonicalUrl('/about') ? { canonical: canonicalUrl('/about') } : undefined,
};

export default function AboutPage() {
  return (
    <ContentLayout>
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <div><PageEyebrow>14.85 / About</PageEyebrow></div>
        <div><PageTitle>Building ideas. Creating spaces. Shaping the future.</PageTitle></div>
        <div className="mt-12 grid gap-10 border-t border-white/15 pt-8 sm:mt-16 sm:pt-12 md:grid-cols-[0.7fr_1.3fr] md:gap-24">
          <p className="technical-label text-[10px] text-[#C5A059]">Abuja, Nigeria · International enquiries</p>
          <div className="max-w-3xl space-y-6 text-sm leading-8 text-white/70 sm:text-base sm:leading-9">
            <p>14.85 Concepts is an Abuja-based architecture, construction and built-environment company. We bring design thinking, technical coordination and construction expertise together to shape spaces that are functional, considered and made to endure.</p>
            <p>From architectural design and interiors to construction, renovation, project management and property development, we begin by understanding the brief, the site, the budget and what the project needs to achieve. That understanding guides decisions from early planning through delivery.</p>
            <p>We work with residential and commercial clients in Nigeria and welcome enquiries from clients based internationally. Each engagement is shaped around its scope, context and requirements.</p>
          </div>
        </div>
        <figure className="mt-12 sm:mt-16">
          <SiteImage
            image="aboutResidence"
            alt="Illustrative render of homes arranged around a landscaped shared drive"
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="site-image-hover aspect-[16/8] sm:aspect-[16/7]"
            objectPosition="center 56%"
          />
          <figcaption className="technical-label mt-3 text-[9px] text-white/50">Illustrative residential imagery · not a named project</figcaption>
        </figure>
        <div className="mt-20 grid gap-10 border-t border-white/15 pt-8 sm:mt-28 sm:grid-cols-2 sm:pt-10 sm:gap-16">
          <article>
            <p className="technical-label mb-4 text-[10px] text-[#C5A059]">Our vision</p>
            <h2 className="font-editorial text-3xl leading-tight text-[#F4F4F0]">A built environment shaped by design, technical care and lasting quality.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">We aim to contribute to Nigeria’s built environment and grow our work across international markets through thoughtful design and dependable project delivery.</p>
          </article>
          <article>
            <p className="technical-label mb-4 text-[10px] text-[#C5A059]">Our mission</p>
            <h2 className="font-editorial text-3xl leading-tight text-[#F4F4F0]">Turn client aspirations into functional, compelling and enduring spaces.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">We do this through considered planning, technical coordination, responsible construction practices and a client-centred process.</p>
          </article>
        </div>
        <div className="mt-20 border-t border-white/15 pt-8 sm:mt-28 sm:pt-10">
          <div className="mb-8 max-w-2xl">
            <p className="technical-label mb-4 text-[10px] text-[#C5A059]">What guides the work</p>
            <h2 className="font-editorial text-4xl text-[#F4F4F0]">Principles we bring to each brief.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Integrity and accountability', 'Be clear about commitments and responsible in the decisions made along the way.'],
              ['Design excellence', 'Make each space intentional, balancing creative direction with function and detail.'],
              ['Quality and craft', 'Give care to specifications, materials and execution throughout the work.'],
              ['Innovation', 'Use thoughtful design and practical methods to respond to changing needs.'],
              ['Client-centred service', 'Listen carefully, communicate clearly and shape solutions around each brief.'],
              ['Sustainability and responsibility', 'Consider resource use, environmental conditions and long-term performance where the project allows.'],
            ].map(([title, text]) => (
              <article key={title} className="border-t border-white/15 pt-5">
                <h3 className="font-editorial text-2xl text-[#F4F4F0]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-20 border-t border-white/15 pt-8 sm:mt-28 sm:pt-10">
          <div className="mb-8 max-w-2xl">
            <p className="technical-label mb-4 text-[10px] text-[#C5A059]">From vision to delivery</p>
            <h2 className="font-editorial text-4xl text-[#F4F4F0]">A clear path through the work.</h2>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Consultation', 'Understand the vision, site, intended use, budget and priorities.'],
              ['02', 'Concept and planning', 'Set a design direction around function, context and feasibility.'],
              ['03', 'Design coordination', 'Develop the design and coordinate relevant technical considerations.'],
              ['04', 'Project preparation', 'Clarify scope, timelines, resources and implementation needs.'],
              ['05', 'Execution', 'Coordinate delivery with care for specifications, workmanship and site requirements.'],
              ['06', 'Quality review', 'Monitor progress against agreed requirements and milestones.'],
              ['07', 'Completion', 'Review the agreed deliverables and coordinate handover.'],
            ].map(([number, title, text]) => (
              <article key={number} className="bg-[#080808] p-5 sm:p-6">
                <p className="technical-label text-[10px] text-[#C5A059]">{number}</p>
                <h3 className="mt-5 font-editorial text-2xl text-[#F4F4F0]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{text}</p>
              </article>
            ))}
          </div>
        </div>
        <Link href="/contact" className="quiet-interaction mt-16 inline-flex min-h-12 items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Start a conversation</Link>
      </section>
    </ContentLayout>
  );
}
