import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';

const routes = [
  ['/', 1.0],
  ['/services', 0.8],
  ['/about', 0.7],
  ['/projects', 0.6],
  ['/contact', 0.8],
  ['/privacy', 0.3],
  ['/terms', 0.3],
  ['/cookies', 0.3],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteOrigin) return [];

  return routes.map(([path, priority]) => ({
    url: new URL(path, siteOrigin).toString(),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority,
  }));
}
