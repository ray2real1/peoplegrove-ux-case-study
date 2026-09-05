#!/usr/bin/env python3
"""Emit beat07_blender_import.py — TWO collections:
  A. PG07_RECOVERED_REFERENCE  — recovered vector subregions (provenance, hidden)
  B. PG07_PRODUCTION_PLANES    — exactly five semantic planes (unions labeled)
All Z = 0. No camera / light / material / thickness / hand / render.
Usage: python3 build_blender.py [out_dir]"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
G = json.load(open(os.path.join(OUT, "beat07_geometry.json")))
subs = {s["id"]: s for s in G["recovered_subregions"]}
zones = {z["id"]: z for z in G["semantic_zones"]}

def box(b): return {"x": b["x"], "y": b["y"], "w": b["width"], "h": b["height"]}

# Collection A: recovered reference subregions (only those that actually exist)
REFERENCE = []
for sid in ["hero_field","terms_card","next_action_card","role_narrative_card",
            "org_strip_card","sticky_cta_primary","action_control"]:
    b = box(subs[sid]["source_bbox"]); b["name"] = "PG07_REF_" + sid.upper(); REFERENCE.append(b)

# Collection B: five production planes (identity/terms/next_action directly recovered;
# narrative + action are DERIVED UNIONS)
prod_map = [
    ("PG07_IDENTITY",    "identity",    "DIRECTLY RECOVERED (hero_field)"),
    ("PG07_TERMS",       "terms",       "DIRECTLY RECOVERED (terms_card)"),
    ("PG07_NEXT_ACTION", "next_action", "DIRECTLY RECOVERED (next_action_card)"),
    ("PG07_NARRATIVE",   "narrative",   "DERIVED FROM VERIFIED VECTOR SUBREGIONS (role_narrative + org_strip)"),
    ("PG07_ACTION",      "action",      "DERIVED FROM VERIFIED VECTOR SUBREGIONS (sticky_cta + action_control)"),
]
PRODUCTION = []
for name, zid, cls in prod_map:
    b = box(zones[zid]["source_bbox"]); b["name"] = name; b["class"] = cls; PRODUCTION.append(b)

script = '''"""Beat 07 — Opportunity Detail plan geometry -> Blender planes.

Auto-generated from production/beat07_geometry/beat07_geometry.json, whose bounds
were recovered from vector objects on page 7 of PEOPLEGROVE_CANONICAL_V2_SOURCE.pdf.

plan geometry verified - depth authored.

Two collections:
  A. PG07_RECOVERED_REFERENCE  - direct vector-recovered subregions for provenance /
     inspection. Hidden from render by default. Z = 0. No authored depth.
  B. PG07_PRODUCTION_PLANES    - exactly five semantic planes. IDENTITY / TERMS /
     NEXT_ACTION are directly recovered; NARRATIVE and ACTION are DERIVED UNIONS.

Native 390 x 844 source coordinate system (top-left origin, +x right, +y down),
mapped to Blender XY (Y flipped so the frame reads upright). Z-depth is NOT
recovered from product geometry: every plane starts at Z = 0. AUTHORED_DEPTH
exposes editable per-plane Z (all 0.0) for downstream authoring. This script
creates NO camera, 5-degree staging, studio, light, material, board thickness,
hand, shadow, or render.
"""
import bpy

FRAME_W, FRAME_H = 390.0, 844.0

# Collection A - recovered vector subregions (provenance / reference).
RECOVERED_REFERENCE = %s

# Collection B - five production planes (verified 2D plan geometry).
PRODUCTION_PLANES = %s

# Authored Z-depth - initialized to 0.0. NOT from verified product geometry.
AUTHORED_DEPTH = {
    "PG07_IDENTITY": 0.0,
    "PG07_TERMS": 0.0,
    "PG07_NEXT_ACTION": 0.0,
    "PG07_NARRATIVE": 0.0,
    "PG07_ACTION": 0.0,
}

def _get_collection(name):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col

def _make_plane(name, x, y, w, h, z, collection):
    cx = x + w / 2.0
    cy = FRAME_H - (y + h / 2.0)   # flip Y so the frame reads upright in Blender
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    hw, hh = w / 2.0, h / 2.0
    verts = [(cx-hw, cy-hh, z), (cx+hw, cy-hh, z), (cx+hw, cy+hh, z), (cx-hw, cy+hh, z)]
    mesh.from_pydata(verts, [], [(0, 1, 2, 3)])
    mesh.update()
    return obj

def main():
    ref_col = _get_collection("PG07_RECOVERED_REFERENCE")
    for p in RECOVERED_REFERENCE:
        _make_plane(p["name"], p["x"], p["y"], p["w"], p["h"], 0.0, ref_col)
    # hide the provenance/reference collection from the final render by default
    ref_col.hide_render = True
    ref_col.hide_viewport = True

    prod_col = _get_collection("PG07_PRODUCTION_PLANES")
    for p in PRODUCTION_PLANES:
        z = AUTHORED_DEPTH.get(p["name"], 0.0)
        obj = _make_plane(p["name"], p["x"], p["y"], p["w"], p["h"], z, prod_col)
        obj["pg07_class"] = p["class"]

    print("PG07_RECOVERED_REFERENCE: %%d reference objects (hidden, Z=0)." %% len(RECOVERED_REFERENCE))
    print("PG07_PRODUCTION_PLANES: %%d production planes (Z=0; depth authored downstream)." %% len(PRODUCTION_PLANES))

if __name__ == "__main__":
    main()
''' % (json.dumps(REFERENCE, indent=4), json.dumps(PRODUCTION, indent=4))

open(os.path.join(OUT, "beat07_blender_import.py"), "w").write(script)
print("wrote beat07_blender_import.py:", len(REFERENCE), "reference +", len(PRODUCTION), "production planes")
