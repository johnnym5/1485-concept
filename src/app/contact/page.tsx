import type { Metadata } from 'next';
import RfqForm from '@/components/footer/RfqForm';
import { ContentLayout, PageEyebrow } from '@/components/site/SiteChrome';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Share an early project brief with 14.85 Concept Limited. We aim to respond within two business days.',
  alternates: canonicalUrl('/contact') ? { canonical: canonicalUrl('/contact') } : undefined,
};

export default function ContactPage() {
  return (
    <ContentLayout motion="contact">
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div data-motion-reveal className="lg:sticky lg:top-12 lg:h-fit">
          <PageEyebrow>14.85 / Project brief</PageEyebrow>
          <h1 className="font-editorial text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.98] text-[#F4F4F0]">Define the opportunity.</h1>
          <p className="mt-5 max-w-lg text-xs leading-6 text-white/65 sm:mt-6 sm:text-base sm:leading-8">Share the site, programme, project stage, and primary design or technical considerations. We aim to respond within two business days.</p>
          <p className="mt-10 border-t border-white/15 pt-5 text-[10px] uppercase tracking-[0.18em] text-white/45">Commercial · Residential · Hospitality · Mixed-use</p>
        </div>
        <div data-motion-reveal className="frosted-copy frosted-glass-card rounded-2xl border p-4 shadow-2xl sm:p-8 md:p-10">
          <h2 className="mb-2 font-editorial text-2xl text-[#F4F4F0] sm:text-4xl">Tell us about your project.</h2>
          <p className="mb-5 text-xs leading-5 text-white/60 sm:mb-7 sm:text-sm sm:leading-6">Fields marked as required help us understand how to begin the conversation.</p>
          <RfqForm />
        </div>
      </section>
    </ContentLayout>
  );
}
