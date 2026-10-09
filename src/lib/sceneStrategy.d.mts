export interface SceneSegment {
  id: 'hero' | 'facade' | 'reinforced';
  startFrame: number;
  endFrame: number;
  startSeconds: number;
  endSeconds: number;
  imageIndex: number;
}

export const SCENE_VIDEO_SOURCE: string;
export const SCENE_FALLBACK_IMAGES: string[];
export const SCENE_SEGMENTS: SceneSegment[];
export function getSceneSegment(frame: number): SceneSegment;
export function shouldUseImageFallback(connection?: { saveData?: boolean; effectiveType?: string } | null): boolean;
