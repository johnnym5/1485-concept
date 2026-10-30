import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from '@/components/site/SiteChrome';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Architectural design, building construction, interiors, renovation, project management and property development from Abuja, Nigeria.',
  alternates: canonicalUrl('/services') ? { canonical: canonicalUrl('/services') } : undefined,
};

const capabilities = [
  {
    number: '01',
    title: 'Architectural design and consultancy',
    description: 'Design solutions that connect the client brief, site conditions and intended use with spatial planning and technical considerations.',
    points: ['Concept and building design', 'Residential, commercial and institutional briefs', 'Space planning and design documentation', 'Design review and technical coordination'],
  },
  {
    number: '02',
    title: 'Building construction and project delivery',
    description: 'Construction delivery with attention to project specifications, workmanship, quality control and coordination from site activities through completion.',
    points: ['Residential and commercial construction', 'Structural and general building works', 'Extensions and modifications', 'Construction supervision and completion'],
  },
  {
    number: '03',
    title: 'Interior design and space development',
    description: 'Interior environments planned around how people use a space, with careful consideration of layout, materials, lighting and finishes.',
    points: ['Residential, commercial and workspace interiors', 'Interior space planning', 'Materials, finishes and lighting coordination', 'Renovation and refurbishment'],
  },
  {
    number: '04',
    title: 'Renovation and refurbishment',
    description: 'Improvements to existing properties that respond to changing needs, improve usability and refresh the condition and appearance of a space.',
    points: ['Residential and commercial renovations', 'Interior remodelling and extensions', 'Exterior and finishing improvements', 'Structural changes subject to engineering assessment'],
  },
  {
    number: '05',
    title: 'Project management and consultancy',
    description: 'Planning, coordination and monitoring to help clients maintain clarity across the professionals, activities and milestones involved in a project.',
    points: ['Project planning and coordination', 'Construction programme and site monitoring', 'Consultant and contractor coordination', 'Progress, quality and resource monitoring'],
  },
  {
    number: '06',
    title: 'Property development',
    description: 'Development support that considers the relationship between land, design, construction, intended use and market requirements.',
    points: ['Residential and commercial development', 'Mixed-use development planning', 'Property improvement and redevelopment', 'Development and investment project coordination'],
  },
];

export default function ServicesPage() {
  return (
    <ContentLayout motion="services">
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div data-motion-reveal data-motion-delay="0.04"><PageEyebrow>14.85 / Core capabilities</PageEyebrow></div>
        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-20">
          <div data-motion-reveal><PageTitle>Architecture, construction and development—considered together.</PageTitle></div>
          <p data-motion-reveal data-motion-delay="0.1" className="max-w-xl pb-2 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            From an initial design direction to construction and property development, our services support projects at different stages. We align design intent with practical, technical and delivery requirements.
          </p>
        </div>
        <div className="mt-16 border-t border-white/15 sm:mt-24">
          {capabilities.map((item, index) => (
            <article key={item.number} data-motion-reveal data-motion-delay={String(index * 0.06)} className="grid gap-6 border-b border-white/15 py-9 sm:py-12 md:grid-cols-[5rem_0.8fr_1.2fr] md:gap-10">
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
          <p className="font-editorial text-3xl text-[#F4F4F0] sm:text-4xl">Your vision deserves the right execution.</p>
          <p className="max-w-2xl text-sm leading-7 text-white/60">Tell us what you are planning, where the project is based and the support you need. We’ll discuss the brief and agree on a suitable next step.</p>
          <Link href="/contact" className="quiet-interaction mt-2 inline-flex min-h-12 w-fit items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Discuss your project</Link>
        </div>
      </section>
    </ContentLayout>
  );
}
