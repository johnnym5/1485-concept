'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const placePanel = () => {
      const header = menuRef.current?.closest('header');
      const panel = panelRef.current;
      if (!header || !panel) return;
      panel.style.setProperty('--mobile-menu-content-top', `${Math.round(header.getBoundingClientRect().bottom + 20)}px`);
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target === panelRef.current) {
        setOpen(false);
        return;
      }
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', placePanel);
    window.addEventListener('scroll', placePanel, { passive: true });
    placePanel();
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', placePanel);
      window.removeEventListener('scroll', placePanel);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-site-navigation"
        onClick={() => setOpen((value) => !value)}
        className="mobile-menu-toggle relative z-[100] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#080808] text-[#F4F4F0] hover:border-[#C5A059]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059]"
      >
        <span className="mobile-menu-line mobile-menu-line--top" />
        <span className="mobile-menu-line mobile-menu-line--middle" />
        <span className="mobile-menu-line mobile-menu-line--bottom" />
      </button>
      <nav
        ref={panelRef}
        id="mobile-site-navigation"
        aria-label="Site navigation"
        aria-hidden={!open}
        inert={!open}
        className={`mobile-menu-panel fixed inset-0 z-[80] h-[100dvh] w-screen ${open ? 'mobile-menu-panel--open' : ''}`}
      >
        <div className="mobile-menu-links">
          <p className="technical-label mb-5 text-[10px] text-[#C5A059]">Explore 14.85 Concepts</p>
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              tabIndex={open ? 0 : -1}
              className="quiet-interaction flex min-h-14 items-center gap-5 border-b border-white/15 py-3 text-left text-[#F4F4F0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C5A059]"
            >
              <span aria-hidden="true" className="text-[10px] tracking-[0.16em] text-[#C5A059]">0{index + 1}</span>
              <span className="font-editorial text-2xl sm:text-3xl">{link.label}</span>
            </Link>
          ))}
          <Link href="/contact" tabIndex={open ? 0 : -1} className="mt-8 inline-flex min-h-12 items-center border border-[#C5A059]/70 px-5 text-[10px] uppercase tracking-[0.16em] text-[#F4F4F0]">Discuss your project <span aria-hidden="true" className="ml-3">↗</span></Link>
        </div>
      </nav>
    </div>
  );
}
