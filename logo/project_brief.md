# 14.85 Concept Limited — Interactive Architecture Profile

## 1. Overview
A premium, scroll-driven interactive web experience for 14.85 Concept Limited. The platform plays a 240-frame high-resolution sequence that smoothly zooms, pans, and deconstructs a building down to its foundation blueprint as the user scrolls, culminating in a lead-generation footer.

## 2. Core Problem & Success Criteria
- **Problem:** Standard static portfolios fail to communicate the depth of structural engineering and luxury execution.
- **Success Criteria:** 
  - Consistent 60 FPS scroll performance on mid-tier mobile devices.
  - Initial Time-to-Interactive (TTI) under 2.5 seconds.
  - Total initial payload < 15MB.
  - Zero scroll jacking (native scroll bar must map to frame index).

## 3. Target Users
- Property developers, government contract boards, and high-net-worth private clients requiring verified proof of structural capability.

## 4. Core Capabilities (In Scope for v1)
- HTML5 Canvas sequence renderer linked to `window.scrollY`.
- 3-Layer visual depth stack (Background -> Rising Text -> Foreground Silhouette Mask).
- Automated pre-loader buffer (blocks interaction until first 30 frames are ready).
- Interactive RFQ (Request for Quote) modal at the footer over the blueprint.

## 5. Explicitly Out of Scope (v1)
- 3D WebGL rendering (unnecessary overhead for pre-rendered frames).
- User authentication/login portals.
- Content Management System (CMS) backend. (Hardcoded JSON matrix for v1).

## 6. Constraints & Assumptions
- **Constraint (Asset Weight):** 240 JPEGs will crush mobile browsers. They MUST be compiled to aggressively compressed WebP sequences before frontend development begins.
- **Assumption:** The brand aesthetic is "Obsidian Black & Architectural Gold" based on the provided `14.85 Concept Limited` logo geometry.