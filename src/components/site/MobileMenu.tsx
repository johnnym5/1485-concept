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
      if (event.key === 'Escape') setOpen(false);
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
    <div ref={menuRef} className="relative md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-site-navigation"
        onClick={() => setOpen((value) => !value)}
        className="mobile-menu-toggle quiet-interaction relative z-[100] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/15 text-[#F4F4F0] shadow-[0_4px_18px_rgba(0,0,0,0.22)] backdrop-blur-md hover:border-[#C5A059]/70 sm:h-12 sm:w-12"
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
        className={`mobile-menu-panel fixed inset-0 z-[80] h-[100dvh] w-screen ${open ? 'mobile-menu-panel--open' : ''}`}
      >
        <div className="mobile-menu-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              tabIndex={open ? 0 : -1}
              className="quiet-interaction flex h-11 items-center justify-end rounded-xl px-4 text-right text-xs uppercase tracking-[0.16em] text-white/75 hover:text-[#F4F4F0]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
