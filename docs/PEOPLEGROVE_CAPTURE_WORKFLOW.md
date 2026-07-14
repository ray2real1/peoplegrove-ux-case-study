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

### Social images

```bash
node scripts/capture-peoplegrove.mjs --url http://localhost:3220 --mode social
```

Produces `linkedin-1200x627`, `opengraph-1200x630`, `portfolio-card`.

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
