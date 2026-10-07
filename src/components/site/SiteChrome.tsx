import Link from 'next/link';
import { PageMotion } from './SiteMotion';
import MobileMenu from './MobileMenu';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ overlay = false, rightSlot }: { overlay?: boolean; rightSlot?: React.ReactNode }) {
  return (
    <header className={`frosted-site-header ${overlay ? 'absolute inset-x-3 top-3 px-3 py-2.5 sm:inset-x-8 sm:top-7 sm:px-5 sm:py-3' : 'relative mx-auto w-[calc(100%-1.5rem)] max-w-7xl px-3 py-2.5 sm:w-full sm:px-8 sm:py-5'} z-40 flex items-center justify-between gap-3 rounded-2xl border border-white/10`}>
      <Link href="/" aria-label="14.85 Concept Limited home" className="flex shrink-0 items-center gap-2 sm:gap-3">
        <img src="/brand/1485-emblem.webp" alt="" className="h-8 w-8 object-contain sm:h-12 sm:w-12" />
        <span className="font-sans text-[9px] uppercase leading-relaxed tracking-[0.14em] text-[#F4F4F0] sm:text-[11px] sm:tracking-[0.22em]">
          <span className="sm:hidden">14.85 Concept</span>
          <span className="hidden sm:inline">14.85 Concept Limited</span>
          <span className="hidden text-[8px] tracking-[0.16em] text-[#F4F4F0]/60 sm:block sm:text-[9px]">Architecture · Engineering</span>
        </span>
      </Link>
      <div className="flex min-w-0 items-center gap-2 sm:gap-5">
        <nav aria-label="Main navigation" className="hidden items-center gap-2 md:flex md:gap-5">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="quiet-interaction rounded-sm py-2 font-sans text-[8px] uppercase tracking-[0.08em] text-white/75 hover:text-[#C5A059] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A059] sm:text-[10px] sm:tracking-[0.16em]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileMenu />
        {rightSlot}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.3fr_0.7fr_0.8fr_0.8fr] md:gap-12 md:pb-16">
          <div>
            <Link href="/" aria-label="14.85 Concept Limited home" className="inline-flex items-center gap-3">
              <img src="/brand/1485-emblem.webp" alt="" className="h-11 w-11 object-contain" />
              <span className="text-[10px] uppercase leading-relaxed tracking-[0.2em] text-[#F4F4F0]">14.85 Concept Limited<span className="block text-[9px] tracking-[0.16em] text-white/45">Architecture · Engineering</span></span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">Spatial design and coordinated technical thinking, shaped around the brief, the site, and the requirements of execution.</p>
          </div>
          <FooterColumn title="Explore" links={[
            ['Home', '/'], ['Core capabilities', '/services'], ['Practice', '/about'], ['Selected work', '/projects'],
          ]} />
          <FooterColumn title="Begin a project" links={[
            ['Discuss your project', '/contact'], ['Project brief', '/contact'], ['How we work', '/about'],
          ]} />
          <FooterColumn title="Policies" links={[
            ['Privacy notice', '/privacy'], ['Website terms', '/terms'], ['Cookie notice', '/cookies'],
          ]} />
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[9px] uppercase tracking-[0.15em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:text-[10px]">
          <span>© {new Date().getFullYear()} 14.85 Concept Limited</span>
          <span>Architecture · Engineering</span>
          <Link href="/contact" className="quiet-interaction w-fit text-[#C5A059] hover:text-[#F4F4F0]">Discuss your project <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <nav aria-label={title}>
      <h2 className="technical-label mb-5 text-[9px] text-[#C5A059]">{title}</h2>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={`${label}-${href}`}><Link href={href} className="quiet-interaction text-sm text-white/60 hover:text-[#F4F4F0]">{label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

export function ContentLayout({ children, motion = 'page' }: { children: React.ReactNode; motion?: string }) {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F4F4F0]">
      <SiteHeader />
      <main><PageMotion page={motion}>{children}</PageMotion></main>
      <SiteFooter />
    </div>
  );
}

export function PageEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="technical-label mb-5 text-[10px] text-[#C5A059] sm:text-xs">{children}</p>;
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="font-editorial text-balance text-[clamp(2.25rem,7vw,6.5rem)] font-normal leading-[0.98] tracking-[0.005em] text-[#F4F4F0]">{children}</h1>;
}
