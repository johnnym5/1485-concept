# Implementation Tasks

Status Tracker: `TODO` · `DOING` · `BLOCKED` · `DONE`

## Phase 1: Asset Pipeline & Scaffold
- [ ] **T-01:** Create Node/FFmpeg script to batch convert the raw image folder into WebP format (`/public/sequence`).
- [ ] **T-02:** Initialize Next.js 14 App Router with Tailwind CSS and TypeScript.
- [ ] **T-03:** Define brand color variables in `tailwind.config.ts` (Obsidian: `#080808`, Gold: `#C5A059`, Off-White: `#F4F4F0`).

## Phase 2: Sticky Scene Playback
- [x] **T-04:** Keep the home scene sticky and preserve the loading and intro transition.
- [x] **T-05:** Play the exploded-house video in hero (0–2s), facade (2–6s), and reinforced-concrete (6–10s) chapters; ease playback at chapter edges and pause at each endpoint.
- [x] **T-06:** Use the exterior, annotated exploded, and clean exploded JPGs when the connection is slow, Data Saver is enabled, or video loading/playback fails. Defer later stills and crossfade over two seconds.

## Phase 3: Chapter Text & Depth
- [x] **T-07:** Keep chapter text synchronized to the hero, facade, and reinforced-concrete scroll milestones.
- [x] **T-08:** Preserve the sticky-scene blur, darkening, veils, and footer transitions as content scrolls over the scene.

## Phase 4: Security & Footer
- [ ] **T-10:** Build `BlueprintFooter.tsx` containing the RFQ form.
- [ ] **T-11:** Build Next.js Server Action (`submitRfq`) with strict Zod validation. Ensure no client-side trust. Return generic error messages on failure.
- [ ] **T-12:** Run final Lighthouse audit. Enforce < 15MB total network payload.
