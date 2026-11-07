import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteChrome';
import { CookieConsent } from '@/components/site/CookieConsent';
import SiteMotionProvider from '@/components/site/SiteMotionProvider';
import { siteOrigin } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: {
    default: '14.85 Concepts — Architecture, Construction & Development',
    template: '%s | 14.85 Concept Limited',
  },
  description: 'Architecture, construction, interiors and property development from Abuja, Nigeria. Thoughtfully designed, professionally coordinated and built to endure.',
  applicationName: '14.85 Concept Limited',
  category: 'architecture and engineering',
  keywords: [
    '14.85 Concept Limited',
    'architecture and construction in Abuja',
    'building construction in Nigeria',
    'architectural design',
    'interior design',
    'construction project management',
    'property development',
    'commercial architecture',
    'residential architecture',
    'international architectural design consultancy',
  ],
  robots: { index: true, follow: true },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: '14.85 Concept Limited',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: '14.85 Concepts — Architecture, Construction and Development' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <noscript>
          <style>{`.site-motion-content[data-intro-active="true"] .home-hero .hero-copy,.site-motion-content[data-intro-active="true"] .home-hero .hero-meta{visibility:visible!important}.site-motion-content[data-intro-active="true"] .home-hero [data-hero-shade],.site-motion-content[data-intro-active="true"] .home-hero [data-hero-gradient]{opacity:1!important}.site-motion-content [data-hero-blackout],.site-motion-overlay{display:none!important}`}</style>
        </noscript>
        <SiteMotionProvider>
          <SiteHeader />
          {children}
          <CookieConsent />
        </SiteMotionProvider>
      </body>
    </html>
  );
}
