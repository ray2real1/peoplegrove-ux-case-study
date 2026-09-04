# Asset Registry

## VERIFIED — data canon
- `sources/DATA_CANON_raw.txt` — full text of canonical V2 PDF (18pp). Authority for all product
  data: colours (#00253E navy, #2A87F7 pgblue, #20737B teal, #24C86F green, #71FF4E neon,
  #FFCA0B yellow, #E87861 coral, #474747 gray), six categories + counts
  (Care/Clinical&Care 31 · Build/Engineering 24 · Create/Design&Media 18 · Lead/Business 27 ·
  Discover/Research 12 · Teach/Education 16 = 128), clock positions 0/60/120/180/240/300°,
  Nursing card terms (12 wks · starts Jan 12 · 16–20 hrs/wk · $28/hr stipend · 12 spots ·
  closes Oct 3 · SAVED TUE 9:41 AM), tracker trio (Nursing DUE THU / UX Design Apprenticeship
  Fieldnote Media Remote DUE SAT SAVED Mon 8:15 / Student Success Mentor Northgate On campus
  SAVED Sun 6:52 PM), "3 need you this week" (Interview prep FRI, immunization THU, portfolio SAT),
  measurements (390×844, gutter 20, card r20, sheet r30, terms pad 9, hairline 1, cat rule 3,
  tracker key 4, edge tab 22, CTA 54, scroll clear 104, hero ends 318, −32 overlap, CTA 790),
  8 contrast repairs (slate 1.90→inkmute 5.18 etc.), verbs, wildcard copy.

## VERIFIED — canonical Maya screens (recovered)
- `sources/canon_pages/p01..p18.png` (110dpi refs) + `sources/canon_p06_hi.png`,
  `canon_p09_hi.png` (300dpi). Screens are live-rendered vector → rasterize crisp at any DPI.
  Beat screens are cropped from high-DPI page renders (pixel-true).

## AUTHORED — produced plates (approved, reuse per §18/§20-A)
- `sources/canon_plates/` — 24 embedded rasters ≥200px from the V2 PDF:
  p01 x19 2560×1440 (Beat-01 env), p04 5002×2815, p05 storyboard frames,
  p11 x4031 2560×1440 (dashboard device), p12 x4121 5000×2813 (128 mass),
  p13 x4239 5000×2813 (24 filter), p14 4398×2775 (save macro), p15 2560×1440 (tracker),
  p18 2560×1440 (closing). These are Raymond's own art-directed plates.

## Fonts (OFL)
- `fonts/full/InstrumentSerif-Italic.ttf` (full a–z), Anton, IBM Plex Mono, Instrument Serif.
- `build/fonts.css` — base64-embedded, hermetic.

## Build
- `build/tokens.css` — verified colours + measurements. `build/fonts.css`. `beats/*.html`.

## NOT product authority (kept, not used for canon)
- `public/images/peoplegrove-*.png` — generic-demo rebuild (Marcus / UX Research Assistant).
- Figma `M8CY4YwAi40Hz8pAWr2oEP` — same demo data; structural reference only.
