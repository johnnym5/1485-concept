# Implementation Tasks

Status Tracker: `TODO` · `DOING` · `BLOCKED` · `DONE`

## Phase 1: Asset Pipeline & Scaffold
- [ ] **T-01:** Create Node/FFmpeg script to batch convert the raw image folder into WebP format (`/public/sequence`).
- [ ] **T-02:** Initialize Next.js 14 App Router with Tailwind CSS and TypeScript.
- [ ] **T-03:** Define brand color variables in `tailwind.config.ts` (Obsidian: `#080808`, Gold: `#C5A059`, Off-White: `#F4F4F0`).

## Phase 2: Core Canvas Engine
- [ ] **T-04:** Build `LoadingBuffer.tsx` to preload frames 0 through 30 before mounting the canvas.
- [ ] **T-05:** Build `InteractiveCanvasEngine.tsx`. Draw `frame_0000.webp` to the canvas.
- [ ] **T-06:** Integrate GSAP ScrollTrigger. Map `window.scrollY` (0 to 100%) to `frameIndex` (0 to 239). Validate smooth scrubbing.

## Phase 3: Spatial Matrix & Depth
- [ ] **T-07:** Implement `KEYFRAME_MATRIX.json` parsing. Apply Canvas `ctx.scale()` and `ctx.translate()` based on the active frame.
- [ ] **T-08:** Build `TypographyLayer.tsx`. Sync text visibility and Y-axis translation to the frame checkpoints.
- [ ] **T-09:** (Optional/Stretch for Agent) Generate alpha-mask overlay frames for the first 80 frames to allow text to rise *behind* the building.

## Phase 4: Security & Footer
- [ ] **T-10:** Build `BlueprintFooter.tsx` containing the RFQ form.
- [ ] **T-11:** Build Next.js Server Action (`submitRfq`) with strict Zod validation. Ensure no client-side trust. Return generic error messages on failure.
- [ ] **T-12:** Run final Lighthouse audit. Enforce < 15MB total network payload.