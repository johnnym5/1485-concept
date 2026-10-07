import { spawnSync } from 'node:child_process';
import { mkdir, readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectoryName = (await readdir(root, { withFileTypes: true }))
  .find((entry) => entry.isDirectory() && entry.name.toLowerCase() === 'image frames')?.name;
if (!sourceDirectoryName) throw new Error('Could not find the "image frames" source directory.');
const inputDir = path.join(root, sourceDirectoryName);
const outputDir = path.join(root, 'public', 'sequence');
const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';

const inputs = (await readdir(inputDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /^frame_\d+\.jpg$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

if (inputs.length === 0) {
  throw new Error(`No frame_*.jpg inputs found in "${path.relative(root, inputDir)}".`);
}

await mkdir(outputDir, { recursive: true });
for (const existing of await readdir(outputDir, { withFileTypes: true })) {
  if (existing.isFile() && /^frame_\d{4}\.webp$/i.test(existing.name)) {
    await unlink(path.join(outputDir, existing.name));
  }
}

const ffmpegCheck = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8' });
const useFfmpeg = !ffmpegCheck.error && ffmpegCheck.status === 0;
let sharp;
if (!useFfmpeg) {
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    throw new Error(
      `FFmpeg is unavailable (${ffmpegCheck.error?.message ?? 'version check failed'}) and Sharp is not installed. Install FFmpeg or run npm install.`,
    );
  }
  console.warn('FFmpeg is unavailable; converting with the Sharp WebP encoder instead.');
}

let convertedBytes = 0;

for (const [sequenceIndex, input] of inputs.entries()) {
  const match = input.match(/(\d+)/);
  const outputName = `frame_${String(sequenceIndex).padStart(4, '0')}.webp`;
  const inputPath = path.join(inputDir, input);
  const outputPath = path.join(outputDir, outputName);

  if (useFfmpeg) {
    const result = spawnSync(ffmpeg, [
      '-y', '-hide_banner', '-loglevel', 'error', '-i', inputPath,
      '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80',
      '-compression_level', '6', outputPath,
    ], { encoding: 'utf8' });
    if (result.error || result.status !== 0) {
      throw new Error(`FFmpeg failed for ${input}: ${result.error?.message ?? result.stderr}`);
    }
  } else {
    await sharp(inputPath).webp({ quality: 80, effort: 6 }).toFile(outputPath);
  }

  convertedBytes += (await stat(outputPath)).size;
  console.log(`${input} -> ${outputName}`);
}

console.log(
  `Converted ${inputs.length} frames (${(convertedBytes / 1024 / 1024).toFixed(2)} MiB total) to ${path.relative(root, outputDir)}.`,
);
