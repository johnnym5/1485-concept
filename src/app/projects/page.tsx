import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from '@/components/site/SiteChrome';
import SiteImage from '@/components/site/SiteImage';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Selected Projects',
  description: 'Selected residential design imagery and construction work from 14.85 Concepts. Project case studies will be added as details are approved.',
  alternates: canonicalUrl('/projects') ? { canonical: canonicalUrl('/projects') } : undefined,
};

export default function ProjectsPage() {
  const images = [
    { key: 'projectCourtyard' as const, label: 'Residential concept render', alt: 'Villa courtyard and swimming pool shown from above', shape: 'aspect-[4/5]' },
    { key: 'projectConstruction' as const, label: 'Construction progress', alt: 'Masonry building and scaffold during construction', shape: 'aspect-[4/3]' },
    { key: 'projectGardenHome' as const, label: 'Residential concept render', alt: 'Contemporary home opening onto a landscaped garden and pool', shape: 'aspect-[4/5]' },
    { key: 'serviceFoundations' as const, label: 'Foundation and construction work', alt: 'Steel reinforcement installed for a concrete ground slab', shape: 'aspect-[4/3]' },
    { key: 'projectEveningVilla' as const, label: 'Residential concept render', alt: 'Two-storey residence beside a pool at dusk', shape: 'aspect-[4/5]' },
    { key: 'serviceStructure' as const, label: 'Construction progress', alt: 'Multi-storey building under construction with external scaffolding', shape: 'aspect-[4/3]' },
  ];

  return (
    <ContentLayout>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div><PageEyebrow>14.85 / Selected work</PageEyebrow></div>
        <div className="grid gap-8 md:grid-cols-[1fr_0.7fr] md:items-end">
          <div><PageTitle>Design ideas and work taking shape.</PageTitle></div>
          <div className="max-w-xl">
            <p className="text-sm leading-8 text-white/65 sm:text-base">A selection of residential concept renders and construction imagery. Project-specific case studies will be added as approved details are ready.</p>
            <Link href="/contact" className="quiet-interaction mt-6 inline-flex min-h-12 items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Discuss a project</Link>
          </div>
        </div>
        <div className="mt-12 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {images.map((item) => (
            <figure key={item.key}>
              <SiteImage
                image={item.key}
                alt={item.alt}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className={`site-image-hover ${item.shape}`}
              />
              <figcaption className="technical-label mt-3 text-[9px] text-white/55">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </ContentLayout>
  );
}
