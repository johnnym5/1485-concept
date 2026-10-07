import type { Metadata } from 'next';
import { SiteMotion } from '@/components/site/SiteMotion';
import { siteOrigin } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: siteOrigin,
  title: {
    default: '14.85 Concept Limited — Architecture & Engineering',
    template: '%s | 14.85 Concept Limited',
  },
  description: 'Architecture-led design and coordinated engineering for commercial, residential, hospitality, and mixed-use projects.',
  applicationName: '14.85 Concept Limited',
  category: 'architecture and engineering',
  keywords: [
    '14.85 Concept Limited',
    'architecture and engineering',
    'architectural design',
    'engineering coordination',
    'commercial architecture',
    'residential architecture',
    'hospitality design',
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
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: '14.85 Concept Limited — Architecture and Engineering' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteMotion>{children}</SiteMotion></body>
    </html>
  );
}
