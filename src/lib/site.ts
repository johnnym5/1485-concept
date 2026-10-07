const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');

export const siteOrigin = configuredOrigin ? new URL(configuredOrigin) : undefined;

export function canonicalUrl(path: string) {
  return siteOrigin ? new URL(path, siteOrigin) : undefined;
}
