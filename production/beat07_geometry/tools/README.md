# Beat 07 geometry — generator

Deterministic recovery of the **Opportunity Detail** plan geometry from the
canonical construction sheet. `SOURCE → GENERATOR → OUTPUT`, re-derivable.

## Source dependency

`../source/PEOPLEGROVE_CANONICAL_V2_SOURCE.pdf` — page **7 / 18**,
*CONSTRUCTION SHEET — OPPORTUNITY DETAIL*. Geometry is recovered from **vector
drawing objects** only (no raster measurement, no OCR, no screenshot tracing).

## Regenerate

```
python3 production/beat07_geometry/tools/run.py
```

Runs, in order:

1. `recover_beat07.py` — PDF vector recovery → `beat07_geometry.json`
2. `build_assets.py` — JSON → `beat07_geometry.svg` → `beat07_geometry_preview.png` (1560×3376, rasterized from the SVG)
3. `build_report.py` — JSON → `beat07_geometry_report.md`
4. `build_blender.py` — JSON → `beat07_blender_import.py` (two collections)
5. `validate.py` — package / transport consistency assertions

Requires `pymupdf` (`pip install pymupdf`).

## Truth model

- 2D recovered vector geometry = **VERIFIED**
- semantic unions (narrative, action) = **DERIVED FROM VERIFIED VECTOR SUBREGIONS**
- physical depth / camera 5° / material / lighting = **AUTHORED** (excluded)
- `card_radius = 20` = **nominal canonical token**; per-object drawn radii =
  **construction-sheet-drawn vector geometry** (informative, non-positional)

_plan geometry verified · depth authored_
