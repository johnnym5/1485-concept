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

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
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
        className="mobile-menu-toggle quiet-interaction relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] text-[#F4F4F0] shadow-[0_4px_18px_rgba(0,0,0,0.22)] hover:border-[#C5A059]/70"
      >
        <span className="mobile-menu-line mobile-menu-line--top" />
        <span className="mobile-menu-line mobile-menu-line--middle" />
        <span className="mobile-menu-line mobile-menu-line--bottom" />
      </button>
      {open && (
        <nav id="mobile-site-navigation" aria-label="Mobile navigation" className="frosted-menu absolute right-0 top-[calc(100%+0.65rem)] z-[80] w-[min(17rem,calc(100vw-2rem))] rounded-2xl border border-white/15 p-2 shadow-2xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className="quiet-interaction flex min-h-12 items-center rounded-xl px-4 text-xs uppercase tracking-[0.16em] text-white/75 hover:bg-white/[0.06] hover:text-[#F4F4F0]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
