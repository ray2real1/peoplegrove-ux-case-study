#!/usr/bin/env python3
"""Package / transport consistency checks for the Beat 07 geometry package.
Confirms recovered coordinates unchanged, JSON<->SVG agreement, anchors pass,
provenance retained, and the Blender importer shape. Exits non-zero on failure.
Usage: python3 validate.py [out_dir]"""
import json, os, sys, re, ast, pymupdf
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
G = json.load(open(os.path.join(OUT, "beat07_geometry.json")))
svg = open(os.path.join(OUT, "beat07_geometry.svg")).read()
blender = open(os.path.join(OUT, "beat07_blender_import.py")).read()
subs = {s["id"]: s for s in G["recovered_subregions"]}
zones = {z["id"]: z for z in G["semantic_zones"]}
A = G["canonical_anchors"]
fails = []
def check(name, cond):
    print(f"[{'PASS' if cond else 'FAIL'}] {name}")
    if not cond: fails.append(name)

# --- accepted positional anchors (must reproduce exactly) ---
db = subs["detail_frame"]["source_bbox"]; check("frame == 390x844", db["width"]==390 and db["height"]==844)
hb = subs["hero_field"]["source_bbox"]; check("hero_field_end == 318", hb["y"]+hb["height"]==318)
tb = zones["terms"]["source_bbox"]; check("terms_top == 286", tb["y"]==286)
check("terms_rise == -32 (318 - 286 == 32)", 318-tb["y"]==32 and A["terms_rise"]==-32)
cb = subs["sticky_cta_primary"]["source_bbox"]; check("sticky_cta y==790", cb["y"]==790); check("sticky_cta h==54", cb["height"]==54)
tcb = subs["terms_card"]["source_bbox"]
check("gutter == 20", tcb["x"]==20 and 390-(tcb["x"]+tcb["width"])==20 and A["gutter"]==20)
check("terms_row_pad == 9", {round(r["src_path_bbox"][3]-r["src_path_bbox"][1]) for r in G["terms_rows"]}=={9})
check("hairline == 1", {round(d["src_path_bbox"][3]-d["src_path_bbox"][1]) for d in G["terms_dividers"]}=={1})

# --- SVG viewBox + JSON<->SVG agreement ---
check('SVG viewBox == "0 0 390 844"', 'viewBox="0 0 390 844"' in svg)
def has_rect(b): return bool(re.search(rf'x="{b["x"]}"\s+y="{b["y"]}"\s+width="{b["width"]}"\s+height="{b["height"]}"', svg))
check("SVG identity matches JSON", has_rect(zones["identity"]["source_bbox"]))
check("SVG terms card matches JSON", has_rect(subs["terms_card"]["source_bbox"]))
check("SVG narrative union matches JSON", has_rect(zones["narrative"]["source_bbox"]))
check("SVG action union matches JSON", has_rect(zones["action"]["source_bbox"]))

# --- all zone bounds inside frame ---
for zid, z in zones.items():
    b = z["source_bbox"]
    check(f"zone {zid} inside 390x844", b["x"]>=0 and b["y"]>=0 and b["x"]+b["width"]<=390 and b["y"]+b["height"]<=844)

# --- PNG from SVG, 4x ---
p = pymupdf.Pixmap(os.path.join(OUT, "beat07_geometry_preview.png"))
check("PNG 1560x3376 (4x source)", p.width==1560 and p.height==3376)

# --- provenance retained ---
check("narrative classified DERIVED", "DERIVED" in zones["narrative"]["source_class"])
check("action classified DERIVED", "DERIVED" in zones["action"]["source_class"])
check("identity/terms/next_action DIRECTLY RECOVERED",
      all("DIRECTLY" in zones[z]["source_class"] for z in ("identity","terms","next_action")))
rp = G.get("radius_provenance", {})
check("radius nominal token == 20", rp.get("nominal_canonical_token",{}).get("card_radius")==20)
check("radius drawn-geometry per-object present", bool(rp.get("construction_sheet_drawn_geometry",{}).get("per_object_radius_src")))
check("radius divergence classified INFORMATIVE/NON-POSITIONAL", "INFORMATIVE" in rp.get("divergence_classification",""))
check("subregions carry radius_class = DRAWN VECTOR GEOMETRY",
      all(s.get("radius_class")=="CONSTRUCTION-SHEET-DRAWN VECTOR GEOMETRY" for s in G["recovered_subregions"]))

# --- Blender importer shape ---
try:
    tree = ast.parse(blender); parses = True
except SyntaxError:
    tree = None; parses = False
check("blender: valid python", parses)
check("blender: two collections", "PG07_RECOVERED_REFERENCE" in blender and "PG07_PRODUCTION_PLANES" in blender)
for name in ["PG07_IDENTITY","PG07_TERMS","PG07_NEXT_ACTION","PG07_NARRATIVE","PG07_ACTION"]:
    check(f"blender: production plane {name}", f'"{name}"' in blender)
prod = ref = None
for node in ast.walk(tree):
    if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "")=="PRODUCTION_PLANES":
        prod = ast.literal_eval(node.value)
    if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "")=="RECOVERED_REFERENCE":
        ref = ast.literal_eval(node.value)
check("blender: exactly 5 production planes", isinstance(prod, list) and len(prod)==5)
check("blender: reference != production (separate)", isinstance(ref, list) and len(ref)>=1)
check("blender: reference hidden from render", "hide_render = True" in blender)
check("blender: all authored Z init 0", all(float(v)==0.0 for v in re.findall(r'PG07_\w+":\s*([0-9.]+)', blender)))
# Forbidden-CREATION check on CODE ONLY: strip string literals (docstring documents the
# exclusions on purpose) and every '#' comment, then scan the remaining executable text.
code = blender
code = re.sub(r'"""(?:.|\n)*?"""', "", code)      # triple-quoted strings
code = re.sub(r"'''(?:.|\n)*?'''", "", code)
code = re.sub(r'"[^"\n]*"', '""', code)            # single-line strings
code = re.sub(r"'[^'\n]*'", "''", code)
code = re.sub(r'#.*', "", code).lower()
for token, apis in [("camera", ["cameras.new"]), ("light", ["lights.new"]), ("material", ["materials.new"]),
                    ("render", ["render(", "render.render"]), ("studio", ["studio"]),
                    ("hand", ["hand"]), ("thickness", ["solidify", "extrude", "thickness"]),
                    ("shadow", ["shadow"])]:
    check(f"blender: no '{token}' creation in code", not any(a in code for a in apis))

# --- narrative/action bounds unchanged vs accepted ---
check("narrative bbox == accepted (20,650,350,132)", zones["narrative"]["source_bbox"]=={"x":20,"y":650,"width":350,"height":132})
check("action bbox == accepted (20,790,336,54)", zones["action"]["source_bbox"]=={"x":20,"y":790,"width":336,"height":54})
check("status == PASS", G["status"]=="PASS")
check("source_gaps empty", G["source_gaps"]==[])

print()
print("RESULT:", "ALL PASS" if not fails else f"{len(fails)} FAILURES: {fails}")
sys.exit(1 if fails else 0)
