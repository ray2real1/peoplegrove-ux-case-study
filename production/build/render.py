#!/usr/bin/env python3
"""Render a beat HTML -> landscape PDF (1600x900) via Chromium headless, + PNG preview."""
import subprocess, sys, os, pathlib, tempfile
CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
ROOT=pathlib.Path(__file__).resolve().parents[1]  # production/
def render(html_path):
    html=pathlib.Path(html_path).resolve()
    stem=html.stem
    pdf=ROOT/"pages"/f"{stem}.pdf"
    pdf.parent.mkdir(parents=True, exist_ok=True)
    cmd=[CHROME,"--headless","--no-sandbox","--disable-gpu","--force-color-profile=srgb",
         "--no-pdf-header-footer","--allow-file-access-from-files","--run-all-compositor-stages-before-draw","--virtual-time-budget=10000",
         f"--print-to-pdf={pdf}", html.as_uri()]
    subprocess.run(cmd, check=True, capture_output=True)
    # PNG preview via pymupdf
    import pymupdf
    d=pymupdf.open(pdf); png=ROOT/"proof"/f"{stem}_preview.png"
    png.parent.mkdir(parents=True, exist_ok=True)
    d[0].get_pixmap(dpi=96).save(png)
    print(f"OK {stem}: {pdf}  preview {png} ({d[0].rect.width:.0f}x{d[0].rect.height:.0f}pt)")
    return pdf
if __name__=="__main__":
    for p in sys.argv[1:]:
        render(p)
