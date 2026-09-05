#!/usr/bin/env python3
"""Regenerate the full Beat 07 geometry package from the canonical source, then
validate. SOURCE -> GENERATOR -> OUTPUT. Usage: python3 tools/run.py"""
import subprocess, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.dirname(HERE)
def step(name, *args):
    print(f"\n=== {name} ===")
    r = subprocess.run([sys.executable, os.path.join(HERE, name), *args])
    if r.returncode != 0:
        sys.exit(r.returncode)
step("recover_beat07.py")   # PDF -> beat07_geometry.json
step("build_assets.py")     # JSON -> svg + png
step("build_report.py")     # JSON -> report.md
step("build_blender.py")    # JSON -> blender importer (2 collections)
step("validate.py")         # package/transport consistency
print("\n=== REGENERATION COMPLETE ===")
