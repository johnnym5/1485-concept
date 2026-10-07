# Architecture & Boundaries

## 1. Pattern
**Client-Side Monolithic Render Engine with Serverless API.** 
The heavy lifting happens strictly in the browser GPU via HTML5 Canvas. The backend only exists to securely process the RFQ lead form submission at the end of the journey.

## 2. Component Map
- `InteractiveCanvasEngine` → Master component holding scroll state and GSAP trigger.
- `CanvasRenderer` → Pure function component drawing WebP frames onto `canvas.getContext('2d')`.
- `TypographyLayer` → Absolute positioned DOM nodes managing the spatial text sandwich.
- `LoadingBuffer` → Pre-flight blocker ensuring `frames[0..30]` are in browser memory.
- `BlueprintFooter` → The terminal DOM section containing the lead form.

## 3. The 3-Layer Depth Illusion
To make text rise *between* the background and the building:
1. **Z-Index 10 (Base):** `<canvas id="sky-and-ground">` (Full scene).
2. **Z-Index 20 (Mid):** `<div>` (Typography locking into view).
3. **Z-Index 30 (Top):** `<canvas id="building-mask">` (Alpha-transparent cutouts of the building facade to overlap the text).

## 4. Trust Boundaries & Security
- **RFQ Form:** The client form must POST to a Next.js Server Action or API Route.
- **Validation:** Input (Email, Name, Scope) MUST be validated on the server using Zod before triggering any email (Resend/SendGrid) or database write. Never trust client-side HTML `required` attributes.
- **Rate Limiting:** The RFQ endpoint must be strictly rate-limited to prevent spam bot exhaustion.

## 5. Folder Structure
```text
/
├── public/
│   ├── logo/ (WhatsApp Image 2026-10-06 at 1.27.03 PM.jpeg)
│   ├── sequence/ (Generated WebP frames)
├── src/
│   ├── app/ (Next.js routing & API)
│   ├── components/
│   │   ├── canvas/ (Engine, Preloader)
│   │   ├── overlay/ (Text Cards, HUD)
│   │   └── footer/ (RFQ Form)
│   ├── data/ (KEYFRAME_MATRIX.json)
│   └── lib/ (GSAP setup, Zod schemas)
```