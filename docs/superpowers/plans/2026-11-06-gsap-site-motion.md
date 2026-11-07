# 14.85 Concepts GSAP Site Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a logo-led first-visit intro, blurred/faded route transitions, and a restrained center-focus text veil without changing the classic site layout or native scrolling.

**Architecture:** Install GSAP and `@gsap/react`, register `ScrollTrigger` in a client-only motion layer, and mount a `SiteMotionProvider` in the root layout. Keep intro/prefetch, route transitions, and scroll focus in separate focused components/hooks sharing that provider and a decorative transition overlay.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, GSAP 3.13+, `@gsap/react`, `ScrollTrigger`.

**Spec:** `docs/superpowers/specs/2026-11-06-gsap-site-motion-design.md`

## Global Constraints

- Keep the current site layout, brand fonts, palette, routes, image content, forms, and sticky header.
- Use GSAP with `@gsap/react` and `ScrollTrigger`; register plugins in client code so production tree shaking retains them.
- Run the intro once per tab session and never wait for route/image prefetch to finish before showing the site.
- Respect Data Saver and slow 2G by skipping speculative image downloads.
- Cap scroll focus at 1.5px blur and 0.78 opacity; keep navigation, controls, labels, captions, and forms crisp.
- Preserve native wheel, touch, keyboard, scrollbar, hash, external-link, download, modified-click, and new-tab behavior.
- Respect `prefers-reduced-motion: reduce` by disabling intro/transition/scroll-focus motion.
- Do not add video, pinned scenes, scroll hijacking, offline caching, or image-sequence behavior.
- Do not add or run tests unless requested; verify with lint, TypeScript, production build, HTTP checks, and manual browser inspection.

## Review Focus

- **Storage unavailable:** blocked or throwing `sessionStorage` must bypass the intro and leave the route usable; verify with storage disabled in browser settings.
- **Data Saver / slow 2G:** route navigation remains functional while image prefetch is skipped; inspect network requests with throttling or a mocked connection profile.
- **Reduced motion:** the intro, route veil, hero entrance, and scroll focus are all skipped; inspect with OS/browser reduced-motion enabled.
- **Navigation edge cases:** hash links, external links, downloads, modified clicks, new tabs, browser back/forward, and rapid repeated clicks retain expected behavior; inspect each manually.
- **Text readability and viewport size:** at 320px mobile through desktop, top/bottom copy remains readable, center copy is crisp, and forms/navigation never blur; inspect long and short pages in both scroll directions.

---

### Task 1: Add GSAP runtime, opening intro, and in-session prefetch

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/components/site/SiteMotionProvider.tsx`
- Create: `src/components/site/SiteIntro.tsx`
- Create: `src/components/site/useSitePrefetch.ts`
- Create: `src/lib/gsap.client.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `SiteMotionProvider({ children }: { children: React.ReactNode }): JSX.Element` wraps the site shell, owns the shared transition overlay, and mounts intro and motion hooks.
- `SiteIntro({ active, onComplete }: { active: boolean; onComplete: () => void }): JSX.Element | null` renders the logo/wordmark and skip control inside the provider-owned overlay, and runs the first-tab intro.
- `useSitePrefetch(): void` starts on the first client mount, prefetching the nine route paths in the spec and each unique manifest `smallSrc` once, unless Data Saver or slow 2G is reported.
- Use `useGSAP` for timeline setup and cleanup. Register `gsap` and `ScrollTrigger` once in a client-only module.

- [x] **Step 1: Add GSAP dependencies.** Run `npm install gsap @gsap/react`; use GSAP 3.13 or later as recommended by the [official GSAP installation guide](https://gsap.com/docs/v3/Installation/).
- [x] **Step 2: Register the client GSAP runtime.** Create `src/lib/gsap.client.ts` with `"use client"`; import `gsap`, `ScrollTrigger`, and `useGSAP`, then register `ScrollTrigger` and `useGSAP` once and export the shared symbols.
- [x] **Step 3: Create the shared provider and overlay shell.** Add `SiteMotionProvider` with intro state and one fixed overlay element/ref shared with route transitions. Render `children` immediately beneath it. During intro the overlay contains the skip control; during route transitions it is decorative, has no focus trap, and is `aria-hidden`.
- [x] **Step 4: Implement the session intro.** Create `SiteIntro` with a short GSAP timeline for emblem/wordmark opacity, blur, upward slide, and scale. Use `sessionStorage` to mark completion; if storage access throws, skip the intro. Add reduced-motion bypass and skip-button cleanup.
- [x] **Step 5: Implement prefetching.** In `useSitePrefetch`, call `router.prefetch()` for `/`, `/services`, `/about`, `/projects`, `/contact`, `/privacy`, `/terms`, `/cookies`, and `/subprocessors`. Prefetch each unique `siteImages` `smallSrc` once at low priority; skip image downloads if `navigator.connection.saveData` is true or `effectiveType` is `slow-2g`/`2g`. Start route/image requests on the same mount that starts the intro, and do not await them in its timeline. If browser connection information is unavailable, use low-priority image requests.
- [x] **Step 6: Mount the provider in the root layout.** Wrap `SiteHeader`, route `children`, and `CookieConsent` in `SiteMotionProvider`. Confirm server-rendered route content is present if client JavaScript does not run.
- [ ] **Step 7: Verify the intro and prefetch manually.** Browser interaction is unavailable in this environment; code/build checks and HTTP route checks were completed, but fresh-tab, skip, same-tab return, reduced-motion, storage failure, and network-panel behavior remain for visual/manual confirmation.

### Task 2: Add GSAP route transitions

**Files:**
- Modify: `src/components/site/SiteMotionProvider.tsx`
- Create: `src/components/site/useRouteTransitions.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- `useRouteTransitions({ overlayRef, enabled }: { overlayRef: React.RefObject<HTMLDivElement | null>; enabled: boolean }): void` intercepts eligible same-origin navigation and coordinates `router.push()` with `usePathname()`.
- The provider-owned overlay exposes stable `data-motion-overlay` and state attributes for intro and route transition states; route transitions must not remount or duplicate the overlay. Keep transitions disabled until the intro is skipped or complete.

- [x] **Step 1: Implement eligible-link detection.** At document capture phase, find the nearest `a[href]`; ignore default-prevented clicks, non-primary/modifier clicks, downloads, `_blank`, external origins, same-page hash jumps, and links without a route change. Prevent only eligible primary same-origin navigation.
- [x] **Step 2: Implement outgoing route veil.** Animate overlay opacity to near-black and apply a restrained blur/fade to current `main` content. Once covered, call `router.push()` with the original same-origin pathname/search/hash; prevent concurrent navigation while the timeline is active.
- [x] **Step 3: Implement destination reveal and history behavior.** On pathname change, fade the overlay and clear main-content blur. Handle `popstate` by covering the destination promptly and revealing it after the route updates. Ensure failed or unchanged route updates time out by clearing the overlay.
- [x] **Step 4: Add reduced-motion behavior and cleanup.** If motion is reduced, invoke `router.push()` immediately. Revert GSAP contexts and remove document/history listeners on unmount or route change.
- [ ] **Step 5: Verify navigation manually.** Browser interaction is unavailable in this environment; desktop/mobile, history, rapid-click, and link-exception behavior still need a manual browser pass.

### Task 3: Add the center-focus text veil with ScrollTrigger

**Files:**
- Create: `src/components/site/useScrollFocus.ts`
- Modify: `src/components/site/SiteMotionProvider.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `useScrollFocus({ enabled }: { enabled: boolean }): void` registers and cleans up ScrollTriggers for `main h1`, `main h2`, `main h3`, and `main p` elements, excluding `.technical-label` and elements inside figures/captions or forms.
- The center state is `filter: blur(0px); opacity: 1`; edge state is at most `filter: blur(1.5px); opacity: 0.78`.

- [x] **Step 1: Implement each text focus timeline.** Use `gsap.timeline({ scrollTrigger: { trigger: element, start: 'top 100%', end: 'bottom 0%', scrub: 0.35 } })`; ease from edge blur/opacity to crisp center, then back to edge blur/opacity. Use linear scroll interpolation so reverse scrolling restores the same focus state.
- [x] **Step 2: Exclude non-copy elements.** Select only `main` headings and paragraphs; exclude `.technical-label`, paragraphs in forms, image captions, navigation, buttons, and links. Do not wrap text in spans or alter line wrapping.
- [x] **Step 3: Add reduced-motion and refresh handling.** Create no focus triggers when reduced motion is active; clear inline GSAP properties on cleanup and refresh positions after route/viewport changes without duplicate triggers.
- [ ] **Step 4: Verify focus behavior manually.** Browser interaction is unavailable in this environment; readability at viewport edges and both scroll directions needs visual confirmation.

### Task 4: Coordinate initial hero reveal and final verification

**Files:**
- Modify: `src/components/site/HomeSections.tsx`
- Modify: `src/components/site/SiteIntro.tsx`
- Modify: `src/app/globals.css`
- Review: all files changed in Tasks 1–3

**Interfaces:**
- Mark hero copy with stable `data-intro-copy` attributes; the intro reveal staggers its label, heading, supporting copy, and calls to action with a slight upward slide and fade.
- Keep the existing `.hero-image-layer img` 1.5-second CSS blur/brightness/scale settle. The reveal timing must not restart it or create a flash.

- [x] **Step 1: Coordinate the hero reveal.** Start hero image settle with initial render, animate hero copy beneath the intro veil, and clear the veil as the image finishes its existing 1.5-second settle. Skip the sequence on same-tab route return and reduced motion.
- [ ] **Step 2: Verify full route coverage.** Browser interaction is unavailable in this environment; visual route-by-route mobile/desktop checks remain outstanding.
- [x] **Step 3: Verify constraints and production output.** Ran `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`; searched for unwanted smooth-scroll, pinning, video, and image-sequence behavior. Confirmed core routes and an optimized WebP file return HTTP 200.
- [x] **Step 4: Review the final diff.** Reviewed motion implementation and dependencies; leave the branch unpushed unless asked.
