# 14.85 Concepts Image-First Classic Website Design

## Status

Design direction approved in chat on 6 November 2026. This document is for review; implementation has not started.

## Goal

Redesign the landing page as the entry point to a conventional, image-led architecture and construction company website. Present 14.85 Concepts’ services and work clearly, use the company’s supplied imagery throughout relevant routes, and keep the earlier restrained blur-and-zoom image treatment without recreating the video-led, pinned-scroll experience.

## Approved direction

- Use a classic multi-page website structure with a persistent, solid sticky header, conventional sections, clear navigation, and the existing footer.
- Use supplied architecture renders and real construction-site photos as the primary visual material.
- Retain the prior restrained blur-and-zoom feeling as an image-only effect: on initial page entry, the hero image settles from slightly softened, darkened, and 1.04 scale to clear and normal scale over 1.5 seconds. Supporting gallery images may use a small, fast hover zoom. Text stays clear; scrolling remains ordinary. No video, autoplay, pinned scenes, or chapter-based scrolling.
- Keep the existing dark charcoal, warm white, and muted gold identity and the current editorial display font pairing.
- Preserve current routes, content, privacy and cookie behavior, contact forms, and approved copy unless a later page-specific change is agreed.

## Landing page structure

1. **Hero:** A broad, static residential image with a dark legibility overlay, the company’s positioning, and clear links to Services and Contact. Use the landscaped two-storey home render as the initial hero candidate; verify crop and image quality at mobile and desktop sizes.
2. **Practice introduction:** Short company introduction paired with a construction or residential image, linking to About.
3. **Services overview:** Six current capability cards. Use restrained image support where an asset clearly represents the service; avoid forcing a separate image into every small card.
4. **Selected imagery / work:** A responsive editorial grid from the supplied renders and construction photos. Treat these as company imagery or concepts unless project identity, completion status, location, and publication approval are verified. Do not invent client names, project facts, or outcomes.
5. **Approach:** Explain brief definition, constraint assessment, and multidisciplinary coordination as a readable text-and-image section.
6. **Contact prompt:** A clear transition to the existing project inquiry form.
7. **Existing site footer.**

## Image use by route

- `/`: landscaped two-storey render for the hero; selected home renders and construction photographs in the practice, service, and imagery sections.
- `/services`: construction progress and foundation photographs alongside relevant service groups; residential renders for design/development services.
- `/about`: neighborhood aerial or a representative completed-looking residential render, clearly presented as illustrative company imagery rather than a confirmed project claim.
- `/projects`: image-led grid using the supplied renders and construction photographs. Until case-study details are approved, label this as selected imagery / design and construction work; do not imply every render is a completed commission.
- `/contact`: one supporting construction or residential image, placed so it does not compete with or reduce the space available to the form.
- `/privacy`, `/cookies`, `/terms`, `/subprocessors`: retain text-first legal layouts. If a shared image header is used, keep it small, decorative, and outside the legal reading column; skip it if it harms legibility or adds no value.
- `/not-found`: keep the error page simple; no image is required.

The logo and dated promotional graphics are not architectural portfolio photographs. Use the logo only for brand identity and omit the two dated promo graphics from page imagery.

## Asset handling and performance

- Treat `1485 IMAGES/` as the untouched source collection. Do not rename, overwrite, or delete its files as part of implementation.
- Create optimized derivatives in a dedicated public asset directory, only for files selected by the final page design.
- Generate responsive WebP derivatives at sizes appropriate to actual display usage (for example, a medium width near 720 px and a large width near 1440 px, capped at the source dimensions). Preserve aspect ratio and use quality settings that avoid visible artifacts in architectural details. Produce smaller thumbnails only when the grid needs them.
- Use Next.js image rendering with explicit `sizes`, meaningful alternative text for content images, and empty alternative text for decorative images. Prioritize only the hero image; defer below-the-fold images.
- Reserve image aspect ratios to prevent layout shifts. Avoid loading duplicate full-resolution assets or the entire source collection.
- Keep the originals available for future adjustments and compare derivative sizes and visual quality before choosing final quality settings.

## Interaction and accessibility

- Normal document scrolling and ordinary route navigation.
- The image treatment must remain subtle, must not obscure captions or content, and must not create a focus/visibility problem. Respect `prefers-reduced-motion`; when reduction is requested, show images without entrance or hover motion.
- Ensure hero text contrast over photographs using a static overlay, not a moving or scroll-triggered blur layer.
- Preserve keyboard operation and visible focus styles for navigation, links, and forms. Keep meaningful image alt text concise and descriptive.
- Maintain responsive layouts without horizontal overflow; check touch target sizes and image crops on small screens.

## References reviewed

- [Studio MK27](https://mk27.com/) — reference for clear project-type navigation and image-forward architecture work.
- [D&B Limited](https://www.dandb.ng/) — local Abuja architecture/construction reference for presenting practice context, services, and project material.

These references inform information architecture only; no copy or visual assets will be copied.

## Acceptance criteria for implementation

- The landing page reads as a conventional architecture/construction website and uses the selected supplied images.
- Relevant supplied images appear on the main marketing routes, while legal pages remain readable and text-first.
- The old video, pinned scene, and frame-sequence behavior does not return.
- Image assets are delivered in responsive, optimized derivatives and preserve a clear source-to-output mapping.
- Existing page routes, navigation, contact forms, privacy/cookie behavior, and footer remain functional.
- Mobile and desktop layouts preserve content hierarchy, image focal points, contrast, and stable layout.
- Lint, type checking, and production build complete successfully after implementation.

## Scope boundary

This spec covers the landing page redesign and placement of the supplied image collection across existing routes. It does not authorize new case-study claims, client or project naming, new pages, service changes, or replacement of legal content. Such content remains subject to the company’s confirmation.
