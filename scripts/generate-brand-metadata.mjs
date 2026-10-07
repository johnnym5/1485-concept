import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const emblemPath = fileURLToPath(new URL('../public/brand/1485-emblem.webp', import.meta.url));
const emblem = await readFile(emblemPath);

await Promise.all([
  sharp(emblem).resize(64, 64, { fit: 'cover' }).png().toFile(fileURLToPath(new URL('../src/app/icon.png', import.meta.url))),
  sharp(emblem).resize(180, 180, { fit: 'cover' }).png().toFile(fileURLToPath(new URL('../src/app/apple-icon.png', import.meta.url))),
]);

const svg = Buffer.from(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102b3d"/><stop offset=".56" stop-color="#09141d"/><stop offset="1" stop-color="#080808"/></linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#C5A059" stop-opacity=".1"/><stop offset=".5" stop-color="#C5A059" stop-opacity=".8"/><stop offset="1" stop-color="#C5A059" stop-opacity=".1"/></linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#F4F4F0" stroke-opacity=".035" stroke-width="1"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#grid)"/>
  <path d="M80 78H1120" stroke="url(#rule)"/><path d="M80 552H1120" stroke="url(#rule)"/>
  <text x="82" y="180" fill="#C5A059" font-family="Arial,sans-serif" font-size="18" letter-spacing="6">ARCHITECTURE  ·  ENGINEERING</text>
  <text x="78" y="330" fill="#F4F4F0" font-family="Georgia,serif" font-size="82" letter-spacing="1">14.85 CONCEPT</text>
  <text x="82" y="392" fill="#F4F4F0" fill-opacity=".82" font-family="Arial,sans-serif" font-size="26" letter-spacing="5">LIMITED</text>
  <text x="82" y="488" fill="#F4F4F0" fill-opacity=".66" font-family="Arial,sans-serif" font-size="21">Spatial design. Coordinated technical thinking.</text>
</svg>`);

await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#080808' } })
  .composite([
    { input: svg },
    { input: await sharp(emblem).resize(110, 110, { fit: 'cover' }).png().toBuffer(), left: 1000, top: 250 },
  ])
  .png()
  .toFile(fileURLToPath(new URL('../src/app/opengraph-image.png', import.meta.url)));

console.log('Generated app icons and Open Graph image from public/brand/1485-emblem.webp.');
