# PeopleGrove Capture Workflow

Deterministic screenshot capture for the PeopleGrove case-study microsite.

Verified 2026-06-06. Script: [`scripts/capture-peoplegrove.mjs`](../scripts/capture-peoplegrove.mjs).

---

## Prerequisites

| Requirement | Status |
|---|---|
| Node.js | v26.3.0 (any modern LTS works) |
| Google Chrome | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` |
| `puppeteer-core` | dev dependency, `^23.11.1` |

**No browser bundle is downloaded.** `puppeteer-core` drives the Chrome you already have. If Chrome lives elsewhere, set `CHROME_PATH`:

```bash
export CHROME_PATH="/path/to/Chrome"
```

Install (already done; only needed on a fresh clone):

```bash
npm install
```

---

## Commands

Start the local production build first — capture against the production build, not `next dev`:

```bash
npm run build
npx next start -p 3220
```

### Smoke (the standard pre-flight — 7 captures)

```bash
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --output ./artifacts/captures/local --mode smoke
```

Produces: `hero`, `snapshot`, `testing`, `accessibility`, `decisions`, `fullpage-desktop`, `fullpage-mobile`.

### Full page only

```bash
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --mode full
```

### Single element

```bash
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --mode element --selector testing
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --mode element --selector "#deliverables"
```

Accepts a key from the selector map below, or any raw CSS selector.

### Hero composition source (clean, no header/skip-link)

```bash
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --mode hero
```

Produces `hero-source-desktop` and `hero-source-mobile` — the **locked hero source** (see below).

### Social images

```bash
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --mode social
```

Produces `linkedin-1200x627`, `opengraph-1200x630`, `portfolio-card`. These are **neutral source crops**, not the final composed distributed assets — Run 2 composes titles/margins on top (see the OG/social spec below).

---

## Locked hero source (Run 2)

**Mode:** `--mode hero`. **Source files:** `hero-source-desktop.png`, `hero-source-mobile.png`.

**Why not a raw `#hero` element screenshot:** centering a taller-than-viewport hero floats the sticky header (z-40) and the fixed skip-link over its top edge. The `hero` mode instead scrolls to the very top, blurs focus (skip-link stays hidden), reads the sticky header's height live, and clips the hero region **starting just below the header band**. No layout mutation; the crop self-adjusts if header height changes.

| Field | Desktop | Mobile |
|---|---|---|
| Viewport | 1440×900 @2× | 390×844 @3× |
| Selector | `#hero`, clipped below `header` | same |
| Output (px) | ~2560×2288 | ~1170×5121 |
| Safe area | Title + pill in top-left third; phone mockups right half | Title/pill top; screens stacked below |
| Contains | pill (internship+capstone), H1, body, CTAs, ROLE/SCOPE/FOCUS, 2 lead screens | same, stacked |
| Known overlap risks | none — header/skip-link excluded by design | none |
| Fallback | crop from `fullpage-desktop.png` below the header band | crop from `fullpage-mobile.png` |

Run 2 hero-composition input filename: **`hero-source-desktop.png`**.

---

## OG / social composition spec (for Run 2 — do NOT ship in this run)

The current OG metadata points at a **portrait** phone screenshot (declared 1170×2532; the actual file `peoplegrove-dashboard.png` is 780×1688). Portrait sources render letterboxed or cropped in landscape social cards. **This is a distribution defect to fix in Run 2** — not in this pass, because metadata and the final landscape asset must ship together to avoid a broken preview.

**Source strategy (chosen): option 4 — dedicated landscape composition** using verified assets: the two lead phone screens as the right-side visual, a dark brand-panel left column carrying title + status. No portrait stretching.

### Open Graph image
- **Canvas:** 1200×630 (export @2× = 2400×1260)
- **Source asset:** right half = `hero-source-desktop.png` phone-mockups region (or `peoplegrove-dashboard.png` + `peoplegrove-search.png` framed); left column = solid `#070B14` panel
- **Title:** "PeopleGrove Opportunity Discovery" (≤ 2 lines, ~56–64px @1×)
- **Subtitle/status:** "UX Design Internship · WGU Applied Learning Capstone" (~24px, `sky` #78B7FF)
- **Safe margins:** 64px all sides; keep title clear of the right 45% (phones)
- **Type scale:** title 60/subtitle 24; nothing below 20px (mobile-feed legibility)
- **No:** metrics, "8 of 9", endorsement language, PeopleGrove logo
- **Export path:** `artifacts/captures/social/opengraph-1200x630.png`
- **Alt text:** "PeopleGrove Opportunity Discovery — a UX design internship case study by Ray Merrill, shown as two mobile prototype screens."
- **Fallback:** if composition fails, use a centered-crop of `hero-source-desktop` to 1200×630 (accept looser framing) rather than the portrait image.
- **Production destination (Run 2, shipped):** `public/images/social/opengraph-1200x630.png`
- **Metadata target (Run 2 only, same commit as the asset):** `openGraph.images[0].url = "/images/social/opengraph-1200x630.png"`, width 1200, height 630.

### LinkedIn preview image
- **Canvas:** 1200×627 (export @2×)
- **Source asset:** same composition as OG, re-exported at 1200×627 (3px shorter — no re-layout needed)
- **Title treatment:** identical to OG
- **Image placement:** phones right ~45%, title left
- **Safe margins:** 64px
- **Type scale:** as OG
- **Export path:** `artifacts/captures/social/linkedin-1200x627.png`
- **Alt text:** same as OG

### Portfolio-card thumbnail
- **Ratio:** **4:3 / 1200×900** — VERIFIED against the portfolio hub. The PeopleGrove card is rendered by `RangeStrip.tsx` at a fixed `aspect-[4/3]` card window (no responsive override), so the correct portfolio-card export is 1200×900. (Supersedes the earlier unconfirmed 1200×800 / 3:2 default.)
- **Source asset:** focal crop of `hero-source-desktop.png` centered on the H1 + lead phone
- **Focal point:** H1 "decision-support journey" + Dashboard screen
- **Export path:** `artifacts/captures/social/portfolio-card.png`
- **Alt text:** "PeopleGrove case study — opportunity discovery prototype."
- **Mobile-card fallback:** center-crop to square 800×800 preserving the H1.

**Output directory (Run 2 working):** `artifacts/captures/social/` (gitignored).
**Public destination (Run 2 shipped):** `public/images/social/`.
**Metadata rule:** leave current metadata untouched until Run 2 produces the asset at its public path; metadata + asset ship in one authorized commit.

### Against the live deployment

```bash
node scripts/capture-peoplegrove.mjs --url https://peoplegrove-ux-case-study.vercel.app --output ./artifacts/captures/live --mode smoke
```

---

## Viewport presets

| Preset | Size | DPR | Notes |
|---|---|---|---|
| `desktop` (default) | 1440×900 | 2× | Retina-quality captures |
| `mobile` | 390×844 | 3× | iPhone-class frame |
| `linkedin` | 1200×627 | 2× | LinkedIn link preview |
| `social` | 1200×630 | 2× | Open Graph |
| `card` | 800×600 | 2× | Portfolio-card thumbnail |

Override with `--viewport mobile`.

---

## Selector map

Stable IDs in the page markup. They double as in-page anchors and QA hooks — they are not screenshot-only additions.

| Key | Selector | Section |
|---|---|---|
| `hero` | `#hero` | Hero |
| `snapshot` | `#snapshot` | Project Snapshot |
| `problem` | `#problem` | Problem |
| `prototype` | `#prototype` | Prototype Screens |
| `loop` | `#loop` | Opportunity Loop |
| `matrix` | `#matrix` | Screen Responsibility Matrix |
| `decisions` | `#decisions` | Design Decisions |
| `testing` | `#testing` | Usability Testing |
| `accessibility` | `#accessibility` | Accessibility & UX Quality |
| `deliverables` | `#deliverables` | Deliverables |

---

## Reduced-motion behavior

Captures emulate `prefers-reduced-motion: reduce` **by default**. This makes frames deterministic — no mid-transition captures, no caret blink. Content is identical either way: the scroll-reveal system shows the same content whether or not motion is allowed, so reduced-motion changes nothing about what is captured.

To capture with motion enabled: `--motion no-preference`.

---

## Blank-image detection

The failure this workflow exists to prevent is a screenshot that *looks* successful but is an empty rectangle. Every capture is checked on both sides.

**Before capture** — the script fails if the target:
- does not exist (selector miss)
- has computed `opacity` of 0
- is `visibility: hidden` or `display: none`
- has a bounding box smaller than 40×40px
- contains no text *and* no images

**After capture** — the script fails if the file:
- was not written
- is under 5 KB
- has unexpected width
- is **flat**: PNG bytes-per-pixel below 0.01. A single-colour fill compresses to almost nothing; real UI carries far more entropy. This is the check that catches the exact blank-frame failure mode, and it needs no image-processing dependency.

Failures print the reason and **exit non-zero**. The script never silently emits a blank PNG.

Reference values from a verified run: `testing` 0.052 B/px, `accessibility` 0.047 B/px, `hero` 0.177 B/px. Anything near zero is blank.

---

## Expected outputs

Written to `--output` (default `./artifacts/captures`). `artifacts/` is gitignored.

```
artifacts/captures/local/
  hero.png                 2560×2410   ~1.0 MB
  snapshot.png             2560×1092   ~400 KB
  testing.png              2560×1528   ~200 KB
  accessibility.png        2560×1168   ~140 KB
  decisions.png            2560×1718   ~240 KB
  fullpage-desktop.png     2880×25654  ~6.1 MB
  fullpage-mobile.png      1170×68700  ~10.4 MB
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `No Chrome binary found` | Chrome not at the default path | `export CHROME_PATH=...` |
| `selector not found: #hero` | Target page predates the ID | Deploy the current build, or capture locally |
| `image appears blank/flat` | Element rendered but painted empty | Real defect — investigate; do not bypass |
| `Runtime.callFunctionOn timed out` | A font or image never settled | Already guarded by timeouts; raise `protocolTimeout` if it recurs |
| Capture differs from live | Local build ahead of deployment | Expected; deploy, then re-capture |

Minor anti-aliasing differences between local and live are **not** drift. Only content or layout differences matter.

---

## Manual fallback

If the script cannot run at all:

1. Open the page in Chrome at 1440×900.
2. DevTools → ⌘⇧P → *Capture full size screenshot* (full page), or *Capture node screenshot* with the element selected in the Elements panel (element-level).
3. Emulate reduced motion: DevTools → ⌘⇧P → *Emulate CSS prefers-reduced-motion: reduce*.

This is slower and non-reproducible. Prefer the script.

---

## Why the Claude preview pane is not used

The in-app preview pane was the original capture path and it **silently produced blank frames**.

- Its screenshot viewport did not stay synchronized with programmatic page scrolling. `window.scrollTo` and `scrollIntoView` moved the page, but the captured frame did not follow.
- Below-fold captures came back as uniform dark rectangles **while the DOM confirmed the section was fully visible** — correct `reveal-visible` class, computed `opacity: 1`, non-zero bounding box, inside the viewport.
- One capture succeeded after a real mouse-wheel scroll event; it did not reproduce.

The danger is not that it failed — it is that it failed *silently*, returning a plausible-looking image file. A capture workflow whose failure mode is an innocent-looking blank PNG cannot be trusted for portfolio proof.

**External browser automation via `puppeteer-core` + system Chrome is now the canonical capture method**, and it fails loudly by design.
