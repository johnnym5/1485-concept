const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
const defaultOrigin = process.env.NODE_ENV === 'production'
  ? 'https://1485concepts.com'
  : 'http://localhost:3001';

export const siteOrigin = new URL(configuredOrigin || defaultOrigin);

export function canonicalUrl(path: string) {
  return siteOrigin ? new URL(path, siteOrigin) : undefined;
}
