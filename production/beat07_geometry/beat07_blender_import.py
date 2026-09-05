"""Beat 07 — Opportunity Detail plan geometry -> Blender planes.

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
RECOVERED_REFERENCE = [
    {
        "x": 0,
        "y": 0,
        "w": 390,
        "h": 318,
        "name": "PG07_REF_HERO_FIELD"
    },
    {
        "x": 20,
        "y": 286,
        "w": 350,
        "h": 244,
        "name": "PG07_REF_TERMS_CARD"
    },
    {
        "x": 20,
        "y": 550,
        "w": 350,
        "h": 78,
        "name": "PG07_REF_NEXT_ACTION_CARD"
    },
    {
        "x": 20,
        "y": 650,
        "w": 350,
        "h": 64,
        "name": "PG07_REF_ROLE_NARRATIVE_CARD"
    },
    {
        "x": 20,
        "y": 728,
        "w": 350,
        "h": 54,
        "name": "PG07_REF_ORG_STRIP_CARD"
    },
    {
        "x": 20,
        "y": 790,
        "w": 270,
        "h": 54,
        "name": "PG07_REF_STICKY_CTA_PRIMARY"
    },
    {
        "x": 302,
        "y": 790,
        "w": 54,
        "h": 54,
        "name": "PG07_REF_ACTION_CONTROL"
    }
]

# Collection B - five production planes (verified 2D plan geometry).
PRODUCTION_PLANES = [
    {
        "x": 0,
        "y": 0,
        "w": 390,
        "h": 318,
        "name": "PG07_IDENTITY",
        "class": "DIRECTLY RECOVERED (hero_field)"
    },
    {
        "x": 20,
        "y": 286,
        "w": 350,
        "h": 244,
        "name": "PG07_TERMS",
        "class": "DIRECTLY RECOVERED (terms_card)"
    },
    {
        "x": 20,
        "y": 550,
        "w": 350,
        "h": 78,
        "name": "PG07_NEXT_ACTION",
        "class": "DIRECTLY RECOVERED (next_action_card)"
    },
    {
        "x": 20,
        "y": 650,
        "w": 350,
        "h": 132,
        "name": "PG07_NARRATIVE",
        "class": "DERIVED FROM VERIFIED VECTOR SUBREGIONS (role_narrative + org_strip)"
    },
    {
        "x": 20,
        "y": 790,
        "w": 336,
        "h": 54,
        "name": "PG07_ACTION",
        "class": "DERIVED FROM VERIFIED VECTOR SUBREGIONS (sticky_cta + action_control)"
    }
]

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

    print("PG07_RECOVERED_REFERENCE: %d reference objects (hidden, Z=0)." % len(RECOVERED_REFERENCE))
    print("PG07_PRODUCTION_PLANES: %d production planes (Z=0; depth authored downstream)." % len(PRODUCTION_PLANES))

if __name__ == "__main__":
    main()
