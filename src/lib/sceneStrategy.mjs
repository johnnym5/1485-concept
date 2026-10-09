export const SCENE_VIDEO_SOURCE = '/brand/Exploded_view_of_house_1080p_20261009084148.mp4';
export const SCENE_FALLBACK_IMAGES = [
  '/brand/Modern_multi-story_residential_building_20261009084417.jpg',
  '/brand/Exploded_view_modern_residence_20261009084421.jpg',
  '/brand/Exploded_view_modern_house_model_20261009084425.jpg',
];

export const SCENE_SEGMENTS = [
  { id: 'hero', startFrame: 0, endFrame: 46, startSeconds: 0, endSeconds: 2, imageIndex: 0 },
  { id: 'facade', startFrame: 46, endFrame: 111, startSeconds: 2, endSeconds: 6, imageIndex: 1 },
  { id: 'reinforced', startFrame: 111, endFrame: 200, startSeconds: 6, endSeconds: 10, imageIndex: 2 },
];

export function getSceneSegment(frame) {
  const safeFrame = Math.max(0, Math.min(200, frame));
  return safeFrame < SCENE_SEGMENTS[1].startFrame
    ? SCENE_SEGMENTS[0]
    : safeFrame < SCENE_SEGMENTS[2].startFrame
      ? SCENE_SEGMENTS[1]
      : SCENE_SEGMENTS[2];
}

export function shouldUseImageFallback(connection) {
  return connection?.saveData === true || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
}
