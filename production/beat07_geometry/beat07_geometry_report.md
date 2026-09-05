# BEAT 07 GEOMETRY REPORT

## STATUS

**PASS**

## CANONICAL SOURCE

`PEOPLEGROVE_CANONICAL_V2_SOURCE.pdf` — page **7 / 18** · sheet **CONSTRUCTION SHEET — OPPORTUNITY DETAIL**.
Source dependency: `production/beat07_geometry/source/PEOPLEGROVE_CANONICAL_V2_SOURCE.pdf`. Re-derivable: SOURCE → GENERATOR → OUTPUT (see `tools/`).

## SOURCE-TYPE TEST

Page 7 inspected with PyMuPDF (`get_drawings`, `get_text`). **Genuine vector geometry**, not raster:

- **0 raster images**; **30 `re` primitives** + rounded-rect line/Bézier paths for the zone cards.
- The Detail construction wireframe (left frame, PDF x∈[441,720]) is cleanly isolatable; the reference frame (x∈[773,1051]) is excluded.
- Frame/card border stroke width **0.71625 PDF units** = 1 source px × scale — independent transform check.

## PDF → SOURCE TRANSFORM
```
scale_x = scale_y = 0.71625   (PDF units per source px)
translation = (441.0, 34.5)   # PDF coords of source (0,0)
source_frame_bbox_pdf = [441.0, 34.5, 720.338, 639.015]
src_x = (pdf_x - 441.0) / 0.71625
src_y = (pdf_y -  34.5) / 0.71625
```
Scale fixed two independent ways that agree (frame→390×844; stamped 1px hairline). Corner residual < 3×10⁻⁵ px.

## CANONICAL ANCHORS (printed in the source legend)

| anchor | value |
|---|---|
| hero_field_end_y | 318 |
| terms_rise | -32 |
| sticky_cta_y | 790 |
| sticky_cta_height | 54 |
| gutter | 20 |
| card_radius | 20 |
| terms_row_pad | 9 |
| hairline | 1 |

Additional printed constants (recorded, not used to infer bounds): base_unit=4, sheet_radius=30, category_rule=3, tracker_keyline=4, edge_tab=22, scroll_clearance=104.

## CARD RADIUS — PROVENANCE CLASSIFICATION

The construction sheet holds two distinct truths; both are preserved and must not be collapsed:

- **`card_radius = 20`** — **NOMINAL CANONICAL TOKEN PRINTED ON THE CONSTRUCTION SHEET**. Printed in the source legend. Documented; must not overwrite recovered plane outlines.
- **Recovered per-object radii** — **CONSTRUCTION-SHEET-DRAWN VECTOR GEOMETRY**: terms_card 17.5, next_action_card 19.5, role_narrative_card 11.5, org_strip_card 11.5. Recovered per-object corner radii from the drawn vector outlines. NOT automatically the product's shipped per-component radius spec. Use these recovered outlines for each plane.

Divergence classification: **INFORMATIVE SOURCE DIVERGENCE — NOT A POSITIONAL GEOMETRY FAILURE**.

Downstream production law: USE THE RECOVERED CANONICAL CONSTRUCTION-SHEET OUTLINE FOR EACH BEAT 07 PLANE; the nominal card_radius=20 token remains documented separately and must not silently overwrite the recovered plane outlines.

## BLINDLY RECOVERED SUBREGIONS

Outer `source_bbox` shown; stroked elements converted from 1px-hairline path-center (*.5) to integer outer bound. Fills are already on integer edges. `radius(src)` = drawn corner radius (per-object).

| region | pdf_bbox | src x | src y | width | height | drawn radius(src) | draw idx |
|---|---|---|---|---|---|---|---|
| detail_frame | [441.0, 34.5, 720.338, 639.015] | 0 | 0 | 390 | 844 | None | 3 |
| hero_field | [441.0, 34.5, 720.338, 262.268] | 0 | 0 | 390 | 318 | None | 5 |
| hero_chip_left | [455.683, 80.698, 486.482, 111.497] | 20 | 64 | 44 | 44 | None | 7 |
| hero_chip_right | [674.856, 80.698, 705.654, 111.497] | 326 | 64 | 44 | 44 | None | 8 |
| hero_avatar | [455.683, 140.863, 492.212, 177.392] | 20 | 148 | 52 | 52 | None | 9 |
| terms_card | [455.683, 239.706, 705.654, 413.754] | 20 | 286 | 350 | 244 | 17.5 | 10 |
| next_action_card | [455.683, 428.796, 705.654, 483.947] | 20 | 550 | 350 | 78 | 19.5 | 25 |
| role_narrative_card | [455.683, 500.421, 705.654, 545.544] | 20 | 650 | 350 | 64 | 11.5 | 26 |
| org_strip_card | [455.683, 556.288, 705.654, 594.249] | 20 | 728 | 350 | 54 | 11.5 | 29 |
| sticky_cta_primary | [455.683, 600.696, 648.354, 638.657] | 20 | 790 | 270 | 54 | None | 30 |
| action_control | [657.666, 600.696, 695.627, 638.657] | 302 | 790 | 54 | 54 | None | 31 |

Terms card interior: **5 rows** (label chips x=36, right-aligned value chips → x=354, each **9 px** = terms_row_pad) with **4 hairline dividers (1 px)** at y = 338, 386, 434, 482.

## SEMANTIC ZONES

| zone | class | x | y | width | height | derived_from |
|---|---|---|---|---|---|---|
| identity | DIRECTLY RECOVERED | 0 | 0 | 390 | 318 | hero_field |
| terms | DIRECTLY RECOVERED | 20 | 286 | 350 | 244 | terms_card |
| next_action | DIRECTLY RECOVERED | 20 | 550 | 350 | 78 | next_action_card |
| narrative | DERIVED UNION | 20 | 650 | 350 | 132 | role_narrative_card, org_strip_card |
| action | DERIVED UNION | 20 | 790 | 336 | 54 | sticky_cta_primary, action_control |

- **identity, terms, next_action** — one zone = one recovered vector object (DIRECTLY RECOVERED).
- **narrative** — union(role_narrative 26, org_strip 29) — DERIVED FROM VERIFIED VECTOR SUBREGIONS.
- **action** — union(sticky_cta 30, action_control 31) — DERIVED FROM VERIFIED VECTOR SUBREGIONS.

## VALIDATION

| check | result |
|---|---|
| frame == 390 × 844 | PASS ✓ |
| hero_field_bottom == 318 | PASS ✓ |
| hero_bottom − terms_top == 32 (rise −32) | PASS ✓ |
| sticky_cta y == 790 and height == 54 | PASS ✓ |
| gutter == 20 (both sides) | PASS ✓ |
| terms_row_pad == 9 | PASS ✓ |
| hairline == 1 | PASS ✓ |
| single reproducible transform | PASS ✓ |
| no raster measurement used | PASS ✓ |

**card_radius:** Nominal token card_radius=20 documented separately (radius_provenance). Recovered drawn corner radii vary per object and are preserved as CONSTRUCTION-SHEET-DRAWN VECTOR GEOMETRY. Divergence is INFORMATIVE / NON-POSITIONAL — not a geometry failure.

## SOURCE GAPS

None. Every zone bound recovered from vector geometry.

## METHODS NOT USED

- NO SCREENSHOT TRACING
- NO OCR GEOMETRY
- NO RASTER EDGE MEASUREMENT
- NO DOWNSTREAM ANSWER TABLE
- NO CURRENT-FIGMA SUBSTITUTION (Figma node 33:136 not consulted for coordinates)

## TRUTH CLASSIFICATION

- **2D recovered vector geometry = VERIFIED**
- **semantic unions (narrative, action) = DERIVED FROM VERIFIED VECTOR SUBREGIONS**
- **physical depth = AUTHORED** (excluded from this export)
- **camera 5° = FROZEN PRODUCTION DIRECTION** (not part of plan geometry)
- **material / lighting = AUTHORED PRODUCTION** (not part of plan geometry)

plan geometry verified · depth authored
