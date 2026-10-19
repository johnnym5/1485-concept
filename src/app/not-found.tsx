import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site/SiteChrome';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F4F4F0] flex flex-col justify-between">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 py-36 text-center">
        <p className="technical-label mb-4 text-xs text-[#C5A059]">404 / Page Not Found</p>
        <h1 className="font-editorial text-5xl sm:text-7xl">Requested coordinate does not exist.</h1>
        <p className="mt-4 max-w-md text-sm text-white/60">
          The architectural record or page you are seeking could not be located in our index.
        </p>
        <Link
          href="/"
          className="quiet-interaction mt-8 inline-flex min-h-12 items-center justify-center border border-[#C5A059]/70 px-6 text-[10px] uppercase tracking-[0.18em] text-[#F4F4F0] hover:bg-[#C5A059] hover:text-[#080808] transition-colors"
        >
          Return to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
