import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(siteOrigin ? { sitemap: new URL('/sitemap.xml', siteOrigin).toString() } : {}),
  };
}
