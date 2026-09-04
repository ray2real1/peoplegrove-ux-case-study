# Capability Registry — 18-beat production build

Environment: Claude Code remote (headless Linux), repo `ray2real1/peoplegrove-ux-case-study`.

## Authority (Raymond's ruling, this run)
1. **Frozen 18-beat master** = creative authority (composition/camera/DO-NOT-DRIFT).
2. **Canonical V2 PDF** (`PEOPLEGROVE_CANONICAL_V2_SOURCE.pdf`, 18pp landscape 1200×675) =
   product/data/screen authority for the Maya / Nursing / 128 system.
3. **Current generic-data Figma** `M8CY4YwAi40Hz8pAWr2oEP` = secondary structural reference only,
   where non-conflicting. Its screens (Marcus / UX Research Assistant / 11,586) are the demo
   rebuild and are NOT product authority.
4. **Repo PNGs** `public/images/peoplegrove-*.png` = the SAME generic-demo rebuild (Marcus). NOT
   Maya canon — disqualified as product authority; kept only as the microsite's own assets.

## Figma
LIVE (authed Raymond Merrill, Pro). BUT `figma.com` egress is blocked by org proxy (403 CONNECT) —
screenshots render server-side but their URLs can't be fetched into the sandbox; base64-over-MCP is
the only pixel channel. Not needed for this run: canon comes from the V2 PDF.

## Canonical screen recovery — SOLVED
V2 PDF screens are **live-rendered vector** ("nothing pasted"), so they rasterize crisp at any DPI.
Method: `pymupdf` page render at 300dpi → crop the clean screen regions = pixel-true Maya screens.
Confirmed on p06/p09.

## Browser / render
Chromium 141 (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) headless `--print-to-pdf` →
landscape PDF at `@page{size:1600px 900px}`. VERIFIED working. node 22, pymupdf, Pillow present.
Pipeline: beat HTML (hermetic, base64 fonts) → Chromium → per-beat PDF → pymupdf merge → 18-page PDF.

## Fonts — SOLVED
`fonts.gstatic.com` egress WORKS. Full families downloaded (OFL, redistributable):
- **Instrument Serif Italic** (64KB, full a–z) = the sanctioned italic (Beat 16). Confirmed.
- Anton (display numerals/headlines), IBM Plex Mono (mono/labels), Instrument Serif Regular.
Embedded base64 into `production/build/fonts.css`.

## Generation (image/video) — to be tested per beat, PATH-B only where a photographic plate is
required and no approved plate exists. Available surfaces: Higgsfield, ViralAi, Adobe Firefly,
Gamma image. Governance: ≤6 serious attempts, hard-fact gate; honest STOP on failure (§20-C, §35).

## 3D / vector
Three.js / CSS-3D / SVG / Canvas via the HTML pipeline. No Blender (not required).

## Generation capability — TESTED (2026-09-04)
- **Higgsfield generate_image: CALLABLE.** 252.9 credits (plus plan), 2 credits/image,
  nano_banana_pro (Nano Banana / Gemini image). Job abe9f57b (Beat 09 hero) completed.
- **BLOCKER — results are undownloadable & uninspectable from this sandbox.** The result CDN
  (`d8j0ntlcm91z4.cloudfront.net`) is egress-blocked by org policy (403 CONNECT, same class as
  figma.com). Consequence: a generated plate renders in the Higgsfield widget (visible to Raymond)
  but CANNOT be fetched locally, so I cannot (a) run the hard-fact audit myself, (b) composite
  verified UI onto it (§22), or (c) include it in the local landscape PDF (§45).
- **Therefore:** pure-generation photographic beats (01, 02, 04, 09, 17) → generate base plate to
  the widget as CANDIDATE (Raymond judges perceptually + downloads if he wants), but no local
  compositing/PDF inclusion. Beats with a local RECOVERED V2 plate (05 storyboard, 14 save macro,
  18 closing) are built locally from those plates instead.

## Local recovered produced-plates (from V2 PDF, downloadable) — usable in the PDF
sources/canon_plates/: p01(2560×1440), p04(5002×2815), p05 storyboard frames(2848×1600 ×2,
2560×1440), p11 device(2560×1440), p12(5000×2813), p13(5000×2813), p14 save macro(4398×2775,
2848×1600), p15(2560×1440), p18(2560×1440).
