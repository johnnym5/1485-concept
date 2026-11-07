import manifest from './siteImages.json';

type AssetKey = keyof typeof manifest.assets;
type SiteImageEntry = (typeof manifest.assets)[AssetKey];
export type SiteImageKey = keyof typeof manifest.ui;

const resolvedImages = Object.fromEntries(
  Object.entries(manifest.ui).map(([key, assetKey]) => [
    key,
    manifest.assets[assetKey as AssetKey],
  ]),
) as Record<SiteImageKey, SiteImageEntry>;

export const siteImages = resolvedImages;
