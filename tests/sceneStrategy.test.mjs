import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_FALLBACK_IMAGES, SCENE_SEGMENTS, SCENE_VIDEO_SOURCE, getSceneSegment, shouldUseImageFallback } from '../src/lib/sceneStrategy.mjs';

test('scene chapters use the requested playback ranges and image order', () => {
  assert.deepEqual(SCENE_SEGMENTS.map(({ startSeconds, endSeconds, imageIndex }) => [startSeconds, endSeconds, imageIndex]), [
    [0, 2, 0],
    [2, 6, 1],
    [6, 10, 2],
  ]);
  assert.deepEqual(SCENE_FALLBACK_IMAGES.map((path) => path.split('/').at(-1)), [
    'Modern_multi-story_residential_building_20261009084417.jpg',
    'Exploded_view_modern_residence_20261009084421.jpg',
    'Exploded_view_modern_house_model_20261009084425.jpg',
  ]);
  assert.equal(SCENE_VIDEO_SOURCE.endsWith('.mp4'), true);
});

test('scroll progress selects hero, facade, and reinforced chapters at their thresholds', () => {
  assert.equal(getSceneSegment(0).id, 'hero');
  assert.equal(getSceneSegment(45).id, 'hero');
  assert.equal(getSceneSegment(46).id, 'facade');
  assert.equal(getSceneSegment(110).id, 'facade');
  assert.equal(getSceneSegment(111).id, 'reinforced');
});

test('slow 2G, 2G, and Data Saver select still images', () => {
  assert.equal(shouldUseImageFallback({ effectiveType: 'slow-2g' }), true);
  assert.equal(shouldUseImageFallback({ effectiveType: '2g' }), true);
  assert.equal(shouldUseImageFallback({ saveData: true, effectiveType: '4g' }), true);
});

test('normal, 3G, and unavailable connection hints retain video playback', () => {
  assert.equal(shouldUseImageFallback({ effectiveType: '3g' }), false);
  assert.equal(shouldUseImageFallback({ effectiveType: '4g' }), false);
  assert.equal(shouldUseImageFallback(undefined), false);
});
