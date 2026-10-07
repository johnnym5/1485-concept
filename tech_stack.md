# Technology Stack

| Layer | Choice | Version | Why | Rejected Alternative |
|---|---|---|---|---|
| Framework | Next.js (App Router) | 14.x+ | Server-side rendering for initial load speed and SEO. | Raw React (Vite) — lacks built-in API routes for the RFQ form. |
| Language | TypeScript | 5.x+ | Strict typing for the keyframe matrix and canvas engine constraints. | JavaScript — too brittle for complex matrix state handling. |
| Styling | Tailwind CSS | 3.x+ | Utility-first styling for rapid, consistent glassmorphic UI. | Styled Components — runtime overhead hurts frame rate. |
| Animation | GSAP ScrollTrigger | 3.12+ | Industry standard for locking scroll position to frame timelines. | Framer Motion — lacks the low-level scrub control of GSAP for canvas. |
| Media Format| WebP | N/A | Sub-100kb per frame while maintaining alpha transparency for masking. | JPEG/PNG — too heavy; PNG alpha is unoptimized for 240 frames. |

## Pre-Build Asset Pipeline
**FFmpeg** is mandatory to pre-process the raw image folder. The agent must write a script to execute:
`ffmpeg -i raw_frame_%04d.jpg -c:v libwebp -quality 80 -compression_level 6 frame_%04d.webp`