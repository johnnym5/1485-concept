import type { ReactNode } from 'react';
import Link from 'next/link';
import { ContentLayout, PageEyebrow, PageTitle } from './SiteChrome';

export function LegalPage({
  motion,
  eyebrow,
  title,
  intro,
  children,
}: {
  motion: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <ContentLayout motion={motion}>
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <div data-motion-reveal><PageEyebrow>14.85 / {eyebrow}</PageEyebrow></div>
        <div data-motion-reveal><PageTitle>{title}</PageTitle></div>
        <p data-motion-reveal className="mt-8 max-w-3xl text-base leading-8 text-white/65 sm:text-lg sm:leading-9">{intro}</p>
        <p className="mt-5 text-[10px] uppercase tracking-[0.15em] text-white/40">Last updated 8 October 2026</p>
        <div className="mt-14 space-y-12 border-t border-white/15 pt-10 sm:mt-20 sm:space-y-14 sm:pt-14">
          {children}
        </div>
        <div data-motion-reveal className="mt-16 border-l border-[#C5A059] pl-5 sm:pl-8">
          <p className="font-editorial text-2xl text-[#F4F4F0]">Questions about this notice?</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">Use the <Link href="/contact" className="quiet-interaction text-[#C5A059] underline underline-offset-4 hover:text-[#F4F4F0]">project contact form</Link> and identify the policy you are asking about. Please do not include sensitive information.</p>
        </div>
      </section>
    </ContentLayout>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-motion-reveal className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr] sm:gap-12">
      <h2 className="font-editorial text-2xl text-[#F4F4F0] sm:text-3xl">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-white/65 sm:text-base sm:leading-8">{children}</div>
    </section>
  );
}
