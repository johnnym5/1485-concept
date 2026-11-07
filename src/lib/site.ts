const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
const developmentOrigin = process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : undefined;

export const siteOrigin = configuredOrigin
  ? new URL(configuredOrigin)
  : developmentOrigin
    ? new URL(developmentOrigin)
    : undefined;

export function canonicalUrl(path: string) {
  return siteOrigin ? new URL(path, siteOrigin) : undefined;
}
