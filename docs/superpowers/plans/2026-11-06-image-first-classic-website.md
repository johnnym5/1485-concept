# 14.85 Concepts Image-First Classic Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing page as a classic image-led architecture and construction website and integrate optimized supplied imagery into the main marketing routes.

**Architecture:** Keep the existing Next.js App Router, site chrome, routes, and page copy. Create a shared JSON image manifest and an idempotent Sharp script that writes responsive WebP derivatives outside the source folder; render them through one reusable accessible image component. Build the landing page and add appropriate imagery to Services, About, Projects, and Contact, with legal pages remaining text-first.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `next/image`, Sharp (already installed), Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-06-image-first-classic-website-design.md`

## Global Constraints

- Keep `1485 IMAGES/` untouched; generate selected derivatives under `public/site-images/`.
- The hero image settles from softened, darkened, and 1.04 scale to clear and normal scale over 1.5 seconds; respect `prefers-reduced-motion`.
- Keep text clear and scrolling ordinary; add no video, autoplay, pinned scenes, or chapter-based scrolling.
- Preserve existing routes, navigation, footer, forms, privacy/cookie behavior, and approved copy.
- Do not invent project names, clients, locations, completion status, or outcomes.
- Generate responsive WebP derivatives at 720 px and 1440 px, capped at source dimensions; use explicit responsive image sizes, reserve aspect ratios, prioritize only the hero image, and defer below-the-fold images.
- Omit dated promotional graphics from architectural page imagery; use the logo only for brand identity.

## Review Focus

- **Project-image claims:** Renders and progress photos could be mistaken for completed named commissions. Verify visible labels do not claim project identity or completion that has not been confirmed.
- **Image crop on mobile:** The hero or tall photographs could crop out the house/site subject. Inspect mobile and desktop focal points and adjust `object-position` where needed.
- **Image delivery size:** A small viewport could download a desktop-sized derivative. Inspect browser network requests and confirm the image `srcset` selects the smaller WebP source.
- **Reduced motion:** The entrance/hover treatment could still run for reduced-motion users. Verify the hero and gallery images remain still when the OS preference is enabled.
- **Image loading layout shift:** Missing dimensions could move content during load. Inspect slow-load behavior and confirm image slots retain their intended aspect ratios.

---

### Task 1: Curate and optimize the image set

**Files:**
- Create: `scripts/optimize-site-images.mjs`
- Create: `src/lib/siteImages.json`
- Create: `src/lib/siteImages.ts`
- Create: `public/site-images/` generated WebP files
- Modify: `package.json` to add `images:optimize`
- Source only: `1485 IMAGES/` (read-only; never write generated files here)

**Interfaces:**
- `src/lib/siteImages.json` is the shared source of truth for the Node conversion script and TypeScript UI manifest. Each entry contains `source`, `smallSrc`, `largeSrc`, original `width`/`height`, and default `alt`.
- `src/lib/siteImages.ts` exports `siteImages` and `SiteImageKey`; UI keys are `heroHome`, `practiceConstruction`, `serviceFoundations`, `serviceStructure`, `aboutResidence`, `projectCourtyard`, `projectGardenHome`, `projectEveningVilla`, `projectConstruction`, and `contactConstruction`.
- `heroHome` uses `render-aerial-residential-home.jpg`; `practiceConstruction` and `contactConstruction` use `construction-home-on-sloped-site.jpg`; service keys use the foundation and scaffolding source photos; About uses `render-residential-homes-driveway.jpg`; project keys use distinct courtyard, garden-pool, and evening-villa renders.
- The script reads the JSON manifest’s source mapping and writes `public/site-images/<key>-720.webp` and `<key>-1440.webp`, capped at source dimensions, preserving aspect ratio, at WebP quality 74. It skips a larger derivative when the source itself is below that width.
- The script may overwrite only files in `public/site-images/`; it must not rename, modify, or delete source assets.

- [x] **Step 1: Define the curated source-to-output manifest** in `src/lib/siteImages.json` and its typed wrapper `src/lib/siteImages.ts`. Use the residential aerial render for the hero, construction photos for practice/services/contact, the residential render for About, and distinct residential renders for Projects. Exclude promo graphics. Confirm source dimensions and detect duplicate sources before conversion; `render-two-storey-home-landscaped-front.jpg` is byte-identical to `masonry-building-scaffolding-alt.jpg`, so treat it as a scaffold photo and convert it only once if selected.
- [x] **Step 2: Implement the repeatable conversion script** in `scripts/optimize-site-images.mjs` using Sharp. Normalize orientation, strip unnecessary metadata, emit 720 px and 1440 px WebP derivatives at quality 74 when those widths are smaller than the source, and report source/output byte sizes.
- [x] **Step 3: Add and run `npm run images:optimize`**. Confirm every manifest output exists, originals remain unchanged, no output exceeds its source dimensions, and the conversion summary shows reduced transfer size.
- [x] **Step 4: Review the generated derivatives visually** against the originals, especially fine facade, scaffold, and rebar detail. Adjust quality only if visible artifacts occur; keep all generated variants in `public/site-images/`.

### Task 2: Add a responsive image component and redesign the landing page

**Files:**
- Create: `src/components/site/SiteImage.tsx`
- Modify: `src/components/site/HomeSections.tsx`
- Modify: `src/app/page.tsx` only if needed for the homepage composition
- Modify: `src/app/globals.css`

**Interfaces:**
- `SiteImage` accepts `{ image, alt?, sizes, priority?, className?, objectPosition? }`, where `image` is a key of `siteImages`; it emits a `<picture>` with the manifest’s 720/1440 WebP sources and an accessible `next/image` fallback with intrinsic dimensions.
- Hero use sets `priority`; every other use defaults to lazy loading. The component keeps image dimensions/aspect ratio stable and does not animate text.

- [x] **Step 1: Implement `SiteImage`** and verify it outputs responsive WebP source candidates, intrinsic width/height, descriptive alt text, and a decorative-image override.
- [x] **Step 2: Replace the current homepage composition** in `HomeSections.tsx` with the spec’s conventional flow: image hero and two calls to action; practice introduction; six service cards; selected image grid; approach section; contact prompt; existing footer.
- [x] **Step 3: Add the 1.5-second hero image settle effect** in `globals.css`: image-only blur/darken/scale 1.04 to clear/scale 1.0, while keeping the dark text-legibility overlay static. Add a small hover zoom for selected gallery images and disable both effects under `prefers-reduced-motion: reduce`.
- [ ] **Step 4: Inspect the homepage at mobile and desktop widths.** Browser UI automation is unavailable in this environment; route delivery was verified by HTTP and layout behavior was reviewed in source, but visual crop/overflow/focus inspection remains for the user’s local preview.

### Task 3: Integrate relevant imagery into the existing marketing pages

**Files:**
- Modify: `src/app/services/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/projects/page.tsx`
- Modify: `src/app/contact/page.tsx`
- Reuse: `src/components/site/SiteImage.tsx`, `src/lib/siteImages.ts`

**Interfaces:**
- All route images use `SiteImage` and typed manifest keys; per-use `alt`, `sizes`, and crop position are supplied at the route component.
- Existing route layouts, copy, metadata, form fields/actions, and footer remain intact unless adding a caption that is explicitly framed as illustrative imagery.

- [x] **Step 1: Add image sections to Services** beside the appropriate residential design, construction, and engineering groups, using the residential render and real foundation/scaffolding photos.
- [x] **Step 2: Add a supporting image to About** using `aboutResidence`; describe it as representative imagery where a caption is required, not as an identified 14.85 project.
- [x] **Step 3: Replace the Projects placeholder-only presentation** with a responsive selected-imagery grid from distinct renders and construction photos. State clearly that project case studies and approvals are pending; do not create project names or imply all renders are built work.
- [x] **Step 4: Add a restrained supporting image to Contact** without shrinking or obscuring the existing project form; preserve form validation and submission behavior.
- [ ] **Step 5: Review each marketing route on mobile and desktop** for responsive candidates, aspect-ratio stability, legible captions, correct crops, and no unsupported project claims. Browser UI automation is unavailable; validate visually in the local preview.

### Task 4: Final implementation verification

**Files:**
- Review: all files changed in Tasks 1–3
- Do not change: `1485 IMAGES/` originals

- [x] **Step 1: Run `npm run lint` and `npx tsc --noEmit`.** Resolve errors caused by this implementation; record unrelated pre-existing warnings separately.
- [x] **Step 2: Run `npm run build`.** Confirm Next.js builds and all existing routes prerender or compile as expected.
- [x] **Step 3: Check the running local site** at `/`, `/services`, `/about`, `/projects`, `/contact`, and a legal route. Verify that the image-first pages work while legal pages remain text-first and readable.
- [ ] **Step 4: Check image network delivery** at mobile and desktop sizes: source includes responsive `srcSet`/`sizes`, hero priority, lazy loading, intrinsic dimensions, and reduced-motion CSS; actual viewport network selection was not observed because browser UI automation is unavailable.
- [x] **Step 5: Search application source and public assets** for references to the removed video, frame sequence, pinned scene, or prior image-sequence paths. Confirm none are reintroduced by the redesign.
