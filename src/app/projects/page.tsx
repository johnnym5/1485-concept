import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from '@/components/site/SiteChrome';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Selected Projects',
  description: 'Project case studies from 14.85 Concept Limited will be shared as approved project details are ready.',
  alternates: canonicalUrl('/projects') ? { canonical: canonicalUrl('/projects') } : undefined,
};

export default function ProjectsPage() {
  return (
    <ContentLayout motion="projects">
      <section className="mx-auto flex min-h-[72svh] max-w-7xl flex-col justify-center px-5 py-20 sm:px-8 sm:py-28">
        <div data-motion-reveal><PageEyebrow>14.85 / Selected work</PageEyebrow></div>
        <div data-motion-reveal><PageTitle>Every project has a story worth telling well.</PageTitle></div>
        <div data-motion-reveal className="mt-10 max-w-2xl border-l border-[#C5A059] pl-5 sm:pl-8">
          <p className="text-sm leading-8 text-white/65 sm:text-base">Project case studies are being prepared for publication. We will share project names, locations, and details when they are approved to be public.</p>
          <Link href="/contact" className="quiet-interaction mt-7 inline-flex min-h-12 items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808]">Discuss a project</Link>
        </div>
      </section>
    </ContentLayout>
  );
}
