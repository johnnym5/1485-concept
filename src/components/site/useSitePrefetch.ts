'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import manifest from '@/lib/siteImages.json';

const siteRoutes = [
  '/',
  '/services',
  '/about',
  '/projects',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/subprocessors',
];

type NavigatorConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

function shouldSkipImagePrefetch() {
  const connection = (navigator as NavigatorConnection).connection;
  return connection?.saveData === true || /^(slow-2g|2g)$/i.test(connection?.effectiveType ?? '');
}

export default function useSitePrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const route of siteRoutes) {
      try {
        router.prefetch(route);
      } catch {
        // Route navigation still works if speculative prefetch is unavailable.
      }
    }

    if (shouldSkipImagePrefetch()) return;

    const imageSources = new Set(Object.values(manifest.assets).map((asset) => asset.smallSrc));
    for (const src of imageSources) {
      const image = new window.Image();
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.src = src;
    }
  }, [router]);
}
