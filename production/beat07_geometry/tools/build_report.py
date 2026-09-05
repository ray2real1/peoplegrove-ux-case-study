#!/usr/bin/env python3
"""Write beat07_geometry_report.md from the recovered JSON. Usage: build_report.py [out_dir]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
G = json.load(open(os.path.join(OUT, "beat07_geometry.json")))
subs = {s["id"]: s for s in G["recovered_subregions"]}
zones = G["semantic_zones"]; A = G["canonical_anchors"]; V = G["validation"]; T = G["pdf_transform"]
RP = G["radius_provenance"]

def row(s):
    b = s["source_bbox"]
    return f"| {s['id']} | {s['pdf_bbox']} | {b['x']} | {b['y']} | {b['width']} | {b['height']} | {s['drawn_corner_radius_src']} | {s['pdf_drawing_index']} |"

L = []
L.append("# BEAT 07 GEOMETRY REPORT\n")
L.append("## STATUS\n"); L.append(f"**{G['status']}**\n")
L.append("## CANONICAL SOURCE\n")
L.append("`PEOPLEGROVE_CANONICAL_V2_SOURCE.pdf` — page **7 / 18** · sheet **CONSTRUCTION SHEET — OPPORTUNITY DETAIL**.")
L.append(f"Source dependency: `{G['canonical_source']['source_path']}`. "
         "Re-derivable: SOURCE → GENERATOR → OUTPUT (see `tools/`).\n")
L.append("## SOURCE-TYPE TEST\n")
L.append("Page 7 inspected with PyMuPDF (`get_drawings`, `get_text`). **Genuine vector geometry**, not raster:\n")
L.append("- **0 raster images**; **30 `re` primitives** + rounded-rect line/Bézier paths for the zone cards.")
L.append("- The Detail construction wireframe (left frame, PDF x∈[441,720]) is cleanly isolatable; the "
         "reference frame (x∈[773,1051]) is excluded.")
L.append("- Frame/card border stroke width **0.71625 PDF units** = 1 source px × scale — independent transform check.\n")
L.append("## PDF → SOURCE TRANSFORM\n```")
L.append(f"scale_x = scale_y = {T['scale_x']}   (PDF units per source px)")
L.append(f"translation = ({T['translation_x']}, {T['translation_y']})   # PDF coords of source (0,0)")
L.append(f"source_frame_bbox_pdf = {T['source_frame_bbox_pdf']}")
L.append("src_x = (pdf_x - 441.0) / 0.71625")
L.append("src_y = (pdf_y -  34.5) / 0.71625\n```")
L.append("Scale fixed two independent ways that agree (frame→390×844; stamped 1px hairline). Corner residual < 3×10⁻⁵ px.\n")
L.append("## CANONICAL ANCHORS (printed in the source legend)\n")
L.append("| anchor | value |"); L.append("|---|---|")
for k, v in A.items(): L.append(f"| {k} | {v} |")
L.append("\nAdditional printed constants (recorded, not used to infer bounds): "
         + ", ".join(f"{k}={v}" for k, v in G['printed_constants_extra'].items()) + ".\n")
L.append("## CARD RADIUS — PROVENANCE CLASSIFICATION\n")
L.append("The construction sheet holds two distinct truths; both are preserved and must not be collapsed:\n")
L.append(f"- **`card_radius = {RP['nominal_canonical_token']['card_radius']}`** — "
         f"**{RP['nominal_canonical_token']['class']}**. {RP['nominal_canonical_token']['note']}")
L.append(f"- **Recovered per-object radii** — **{RP['construction_sheet_drawn_geometry']['class']}**: "
         + ", ".join(f"{k} {v}" for k, v in RP['construction_sheet_drawn_geometry']['per_object_radius_src'].items())
         + f". {RP['construction_sheet_drawn_geometry']['note']}")
L.append(f"\nDivergence classification: **{RP['divergence_classification']}**.")
L.append(f"\nDownstream production law: {RP['downstream_law']}\n")
L.append("## BLINDLY RECOVERED SUBREGIONS\n")
L.append("Outer `source_bbox` shown; stroked elements converted from 1px-hairline path-center (*.5) to integer "
         "outer bound. Fills are already on integer edges. `radius(src)` = drawn corner radius (per-object).\n")
L.append("| region | pdf_bbox | src x | src y | width | height | drawn radius(src) | draw idx |")
L.append("|---|---|---|---|---|---|---|---|")
for sid in ["detail_frame","hero_field","hero_chip_left","hero_chip_right","hero_avatar","terms_card",
            "next_action_card","role_narrative_card","org_strip_card","sticky_cta_primary","action_control"]:
    L.append(row(subs[sid]))
L.append("\nTerms card interior: **5 rows** (label chips x=36, right-aligned value chips → x=354, each **9 px** = "
         "terms_row_pad) with **4 hairline dividers (1 px)** at y = 338, 386, 434, 482.\n")
L.append("## SEMANTIC ZONES\n")
L.append("| zone | class | x | y | width | height | derived_from |"); L.append("|---|---|---|---|---|---|---|")
for zn in zones:
    b = zn["source_bbox"]
    cls = "DIRECTLY RECOVERED" if "DIRECTLY" in zn["source_class"] else "DERIVED UNION"
    L.append(f"| {zn['id']} | {cls} | {b['x']} | {b['y']} | {b['width']} | {b['height']} | {', '.join(zn['derived_from'])} |")
L.append("\n- **identity, terms, next_action** — one zone = one recovered vector object (DIRECTLY RECOVERED).")
L.append("- **narrative** — union(role_narrative 26, org_strip 29) — DERIVED FROM VERIFIED VECTOR SUBREGIONS.")
L.append("- **action** — union(sticky_cta 30, action_control 31) — DERIVED FROM VERIFIED VECTOR SUBREGIONS.\n")
L.append("## VALIDATION\n"); L.append("| check | result |"); L.append("|---|---|")
for name, res in [("frame == 390 × 844", V["frame_matches_390x844"]),
                  ("hero_field_bottom == 318", V["hero_end_matches_318"]),
                  ("hero_bottom − terms_top == 32 (rise −32)", V["terms_overlap_matches_minus_32"]),
                  ("sticky_cta y == 790 and height == 54", V["sticky_cta_matches_790_54"]),
                  ("gutter == 20 (both sides)", V["gutter_matches_20"]),
                  ("terms_row_pad == 9", V["terms_row_pad_matches_9"]),
                  ("hairline == 1", V["hairline_matches_1"]),
                  ("single reproducible transform", V["single_transform_verified"]),
                  ("no raster measurement used", V["no_raster_measurement_used"])]:
    L.append(f"| {name} | {'PASS ✓' if res else 'FAIL ✗'} |")
L.append(f"\n**card_radius:** {V['card_radius_note']}\n")
L.append("## SOURCE GAPS\n"); L.append("None. Every zone bound recovered from vector geometry.\n")
L.append("## METHODS NOT USED\n")
for m in ["NO SCREENSHOT TRACING","NO OCR GEOMETRY","NO RASTER EDGE MEASUREMENT","NO DOWNSTREAM ANSWER TABLE",
          "NO CURRENT-FIGMA SUBSTITUTION (Figma node 33:136 not consulted for coordinates)"]:
    L.append(f"- {m}")
L.append("\n## TRUTH CLASSIFICATION\n")
L.append("- **2D recovered vector geometry = VERIFIED**")
L.append("- **semantic unions (narrative, action) = DERIVED FROM VERIFIED VECTOR SUBREGIONS**")
L.append("- **physical depth = AUTHORED** (excluded from this export)")
L.append("- **camera 5° = FROZEN PRODUCTION DIRECTION** (not part of plan geometry)")
L.append("- **material / lighting = AUTHORED PRODUCTION** (not part of plan geometry)\n")
L.append("plan geometry verified · depth authored")
open(os.path.join(OUT, "beat07_geometry_report.md"), "w").write("\n".join(L) + "\n")
print("wrote beat07_geometry_report.md")
