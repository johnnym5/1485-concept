import { createHash } from 'node:crypto';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(projectRoot, '1485 IMAGES');
const outputRoot = path.resolve(projectRoot, 'public/site-images');
const manifestPath = path.resolve(projectRoot, 'src/lib/siteImages.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const assets = Object.entries(manifest.assets);
const sourceOwners = new Map();

for (const [key, asset] of assets) {
  const sourcePath = path.resolve(sourceRoot, asset.source);
  if (!sourcePath.startsWith(`${sourceRoot}${path.sep}`)) {
    throw new Error(`Source for ${key} is outside the approved source folder.`);
  }
  if (sourceOwners.has(asset.source)) {
    throw new Error(`Duplicate source mapping: ${key} and ${sourceOwners.get(asset.source)} both use ${asset.source}. Use a manifest alias instead.`);
  }
  sourceOwners.set(asset.source, key);

  const outputs = [
    { targetWidth: 720, expectedWidth: asset.smallWidth, output: asset.smallSrc },
    { targetWidth: 1440, expectedWidth: asset.largeWidth, output: asset.largeSrc },
  ];
  for (const { output } of outputs) {
    const outputPath = path.resolve(projectRoot, 'public', `.${output}`);
    if (!outputPath.startsWith(`${outputRoot}${path.sep}`)) {
      throw new Error(`Output for ${key} is outside public/site-images.`);
    }
  }
}

await mkdir(outputRoot, { recursive: true });

let sourceBytes = 0;
let responsiveBytes = 0;
let fullSizeBytes = 0;
for (const [key, asset] of assets) {
  const sourcePath = path.resolve(sourceRoot, asset.source);
  const sourceInfo = await stat(sourcePath);
  const sourceMetadata = await sharp(sourcePath).metadata();
  if (sourceMetadata.width !== asset.width || sourceMetadata.height !== asset.height) {
    throw new Error(`${asset.source} is ${sourceMetadata.width}x${sourceMetadata.height}; expected ${asset.width}x${asset.height}.`);
  }
  sourceBytes += sourceInfo.size;

  const variants = [
    { targetWidth: 720, expectedWidth: asset.smallWidth, output: asset.smallSrc },
    { targetWidth: 1440, expectedWidth: asset.largeWidth, output: asset.largeSrc },
  ];
  for (const [index, variant] of variants.entries()) {
    const outputPath = path.resolve(projectRoot, 'public', `.${variant.output}`);
    await sharp(sourcePath)
      .rotate()
      .resize({ width: variant.targetWidth, withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(outputPath);

    const outputInfo = await stat(outputPath);
    const outputMetadata = await sharp(outputPath).metadata();
    if (outputMetadata.width !== variant.expectedWidth || outputMetadata.width > sourceMetadata.width || outputMetadata.height > sourceMetadata.height) {
      throw new Error(`${path.basename(outputPath)} has unexpected dimensions ${outputMetadata.width}x${outputMetadata.height}.`);
    }
    responsiveBytes += outputInfo.size;
    if (index === variants.length - 1) fullSizeBytes += outputInfo.size;
  }
  console.log(`${key}: ${(sourceInfo.size / 1024).toFixed(0)} KB source → ${asset.smallSrc}, ${asset.largeSrc}`);
}

const savings = sourceBytes ? (1 - fullSizeBytes / sourceBytes) * 100 : 0;
console.log(`Full-size comparison: ${(sourceBytes / 1024 / 1024).toFixed(2)} MiB source → ${(fullSizeBytes / 1024 / 1024).toFixed(2)} MiB WebP (${savings.toFixed(1)}% smaller).`);
console.log(`Responsive set: ${assets.length} unique images, ${(responsiveBytes / 1024 / 1024).toFixed(2)} MiB across both variants; each page selects one variant per image.`);
console.log(`SHA-256 manifest: ${createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 16)}`);
