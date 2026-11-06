# 14.85 Concepts GSAP Site Motion Design

## Purpose

Add a cohesive, restrained motion system to the image-first classic website. The site should feel polished when it first opens and when visitors move between pages, while keeping its existing editorial architecture, readable text, and ordinary browser scrolling.

## Approved direction

Use GSAP with `@gsap/react` and `ScrollTrigger` for the opening, route transitions, and center-focus text treatment. Keep the current site layout, brand fonts, palette, routes, image content, forms, and sticky header. Do not restore the former video, pinned scene, or scroll-controlled image sequence.

## Opening and in-session prefetch

- On a tab’s first visit, show a viewport-covering, dark logo intro. Reveal the existing 14.85 emblem and wordmark with a soft fade, blur, and small scale settle; then clear the veil to reveal the current page.
- Run the intro once per tab session. Returning to the site in the same tab skips the intro.
- Keep the existing landing hero image’s 1.5-second blur, brightness, and scale settle. Coordinate the intro so the effect resolves into the hero instead of replaying or flashing.
- While the logo is visible, start best-effort Next.js prefetching for `/`, `/services`, `/about`, `/projects`, `/contact`, `/privacy`, `/terms`, `/cookies`, and `/subprocessors`, plus the small optimized WebP derivatives in the image manifest. Prefetch continues after the intro if necessary; it never delays page interaction or claims offline availability.
- Avoid speculative image downloads when the browser reports Data Saver or a slow 2G connection. If that network information is unavailable, proceed with low-priority prefetching.
- Provide a visible, keyboard-accessible skip control. Bypass the intro for `prefers-reduced-motion: reduce`, missing client-side storage, or script failure.

## Page transitions

- For same-origin route navigation, use a short GSAP sequence: fade and gently blur the current view beneath a near-black veil, change route while covered, then fade the veil and blur away as the destination appears.
- Keep the persistent header in place beneath the veil. Do not lock or replace the document scroll model.
- Support primary site links and browser back/forward navigation. Preserve normal behavior for same-page hash links, external destinations, downloads, modified clicks, and links targeting a new tab.
- Keep focus behavior and route semantics intact: after navigation, the destination heading remains reachable and visible to assistive technology; transition overlays are decorative and do not trap focus.
- With reduced motion enabled, navigate immediately without the transition.

## Scroll focus veil

- Use `ScrollTrigger` to scrub a restrained text focus effect based on distance from the viewport’s vertical center.
- Keep text at the center crisp. As text approaches the upper or lower viewport edge, ease it toward no more than 1.5px blur and 0.78 opacity, then reverse smoothly as it returns toward the center.
- Apply only to content headings and body copy. Exclude the site header, navigation, buttons, links, labels, captions, and form controls.
- Content is fully clear before scrolling and at the top of the page. The focus treatment is visual only; preserve native wheel, touch, keyboard, and scrollbar behavior.
- Skip scroll-triggered blur and fade under reduced-motion preference. Clean up/rebuild triggers on route changes and viewport refreshes to avoid duplicate triggers.

## Accessibility and resilience

- The full site remains visible and usable if JavaScript, GSAP, storage, or prefetch fails.
- No content is hidden behind the opening overlay after its timeline ends; the skip control is available during the intro.
- Use `aria-hidden` for decorative overlay graphics and maintain a logical focus order.
- Motion does not affect text contrast in the in-focus state or hide important controls.
- Respect browser data-saving signals, avoid scroll hijacking, and avoid waiting on network prefetch before showing usable content.

## Acceptance criteria

1. A first visit to a tab displays the short logo intro and the current page; the intro does not replay on same-tab navigation or return to the home route.
2. Route prefetch begins during the intro and continues independently; navigating to primary routes uses client-side navigation when possible.
3. Internal route transitions fade and blur through near-black; back/forward navigation enters with the same treatment. Hash and external navigation work normally.
4. Scrolling keeps content near the viewport center sharp while content above and below softens gradually but remains readable. Reverse scrolling restores focus smoothly.
5. The landing hero retains its current image settle without a visual flash or double animation.
6. Reduced-motion users receive immediate page content, immediate route changes, and no scroll-focus animation.
7. No videos, pinned sections, smooth-scroll overrides, or image sequence are introduced.

## Verification

- Run lint, TypeScript, and production build checks.
- Inspect first visit, same-tab return, internal navigation, browser history, hash links, and reduced-motion behavior.
- Inspect scroll focus at the top, middle, and bottom of a long page in both directions; confirm text remains legible and controls never blur.
- Confirm route and image prefetch is best-effort and does not block first paint or user interaction.
