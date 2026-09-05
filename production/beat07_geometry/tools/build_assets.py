#!/usr/bin/env python3
"""Emit beat07_geometry.svg from recovered geometry, then rasterize that SVG to
beat07_geometry_preview.png (1560x3376 = 4x). PNG is rasterized FROM the final
SVG, not redrawn. Usage: python3 build_assets.py [out_dir]"""
import json, os, sys, pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
G = json.load(open(os.path.join(OUT, "beat07_geometry.json")))
zones = {z["id"]: z for z in G["semantic_zones"]}
subs = {s["id"]: s for s in G["recovered_subregions"]}

RECOV="#1560bd"; UNION="#c05a00"; FIELD="#eef2f6"; CARD="#f7f9fb"; GUIDE="#8a939b"; TXT="#1b2430"

def z(i): b=zones[i]["source_bbox"]; return b["x"],b["y"],b["width"],b["height"]
def s(i): b=subs[i]["source_bbox"]; return b["x"],b["y"],b["width"],b["height"]
def rad(i): return subs[i].get("drawn_corner_radius_src") or 0
def rect(x,y,w,h,stroke,fill="none",sw=1,dash=None,rx=0):
    d=f' stroke-dasharray="{dash}"' if dash else ""; r=f' rx="{rx}"' if rx else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{r}{d}/>'
def txt(x,y,t,size=11,fill=TXT,anchor="start",weight="600"):
    return f'<text x="{x}" y="{y}" font-family="monospace" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{t}</text>'

p=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">',
   '<rect x="0" y="0" width="390" height="844" fill="#ffffff"/>']
ix,iy,iw,ih=z("identity"); p.append(rect(ix,iy,iw,ih,RECOV,FIELD,1))
tx,ty,tw,th=s("terms_card"); p.append(rect(tx,ty,tw,th,RECOV,CARD,1,rx=rad("terms_card")))
nx,ny,nw,nh=s("next_action_card"); p.append(rect(nx,ny,nw,nh,RECOV,CARD,1,rx=rad("next_action_card")))
for cid in ("role_narrative_card","org_strip_card"):
    cx,cy,cw,ch=s(cid); p.append(rect(cx,cy,cw,ch,RECOV,CARD,1,rx=rad(cid)))
ux,uy,uw,uh=z("narrative"); p.append(rect(ux,uy,uw,uh,UNION,"none",1,dash="4 3"))
px,py,pw,ph=s("sticky_cta_primary"); p.append(rect(px,py,pw,ph,RECOV,CARD,1,rx=rad("sticky_cta_primary")))
ax,ay,aw,ah=s("action_control"); p.append(rect(ax,ay,aw,ah,RECOV,CARD,1,rx=aw/2))
uax,uay,uaw,uah=z("action"); p.append(rect(uax,uay,uaw,uah,UNION,"none",1,dash="4 3"))
for cid in ("hero_chip_left","hero_chip_right","hero_avatar"):
    cx,cy,cw,ch=s(cid); p.append(rect(cx,cy,cw,ch,RECOV,"none",1,rx=8))
for _id,lab,lx,ly in [("identity","IDENTITY",ix+8,iy+20),("terms","TERMS",tx+8,ty+16),
                      ("next_action","NEXT ACTION",nx+8,ny+16),("narrative","ROLE NARRATIVE / ORG STRIP",ux+8,uy+16),
                      ("action","STICKY CTA",uax+8,uay+16)]:
    p.append(txt(lx,ly,lab,10,TXT))
# dimension guides (source-stated anchors only)
p.append(f'<line x1="0" y1="318" x2="390" y2="318" stroke="{GUIDE}" stroke-width="0.6" stroke-dasharray="3 2"/>')
p.append(txt(384,314,"HERO FIELD END · 318",8,GUIDE,"end","500"))
p.append(f'<line x1="374" y1="286" x2="374" y2="318" stroke="{UNION}" stroke-width="1"/>')
p.append(txt(370,300,"−32",8,UNION,"end","700"))
p.append(f'<line x1="0" y1="286" x2="390" y2="286" stroke="{GUIDE}" stroke-width="0.5" stroke-dasharray="2 2"/>')
p.append(txt(6,283,"TERMS TOP · 286 (318−32)",8,GUIDE,"start","500"))
p.append(f'<line x1="0" y1="790" x2="390" y2="790" stroke="{GUIDE}" stroke-width="0.6" stroke-dasharray="3 2"/>')
p.append(txt(384,786,"STICKY CTA · y=790",8,GUIDE,"end","500"))
p.append(f'<line x1="6" y1="790" x2="6" y2="844" stroke="{GUIDE}" stroke-width="1"/>')
p.append(txt(10,820,"h=54",8,GUIDE,"start","600"))
p.append(f'<line x1="0" y1="560" x2="20" y2="560" stroke="{GUIDE}" stroke-width="1"/>'); p.append(txt(2,556,"20",8,GUIDE,"start","600"))
p.append(f'<line x1="370" y1="560" x2="390" y2="560" stroke="{GUIDE}" stroke-width="1"/>'); p.append(txt(388,556,"20",8,GUIDE,"end","600"))
p.append(txt(tx+tw-4,ty+th-6,f"drawn r≈{rad('terms_card')} · token 20",7,GUIDE,"end","500"))
p.append(txt(tx+8,ty+40,"5 rows · row pad 9 · hairline 1",8,GUIDE,"start","500"))
for ry in (338,386,434,482):
    p.append(f'<line x1="36" y1="{ry}" x2="354" y2="{ry}" stroke="{GUIDE}" stroke-width="0.6"/>')
p.append('<rect x="0" y="0" width="390" height="844" fill="none" stroke="#c9d2da" stroke-width="1"/>')
p.append(txt(195,838,"plan geometry verified · depth authored",9,"#5a6470","middle","600"))
p.append(txt(6,12,"BEAT 07 · OPPORTUNITY DETAIL · PLAN GEOMETRY",8,"#5a6470","start","700"))
p.append(f'<rect x="6" y="826" width="10" height="6" fill="none" stroke="{RECOV}" stroke-width="1"/>'); p.append(txt(20,832,"recovered vector",7,"#5a6470","start","500"))
p.append(f'<rect x="120" y="826" width="10" height="6" fill="none" stroke="{UNION}" stroke-width="1" stroke-dasharray="3 2"/>'); p.append(txt(134,832,"derived union",7,"#5a6470","start","500"))
p.append("</svg>")
svg="\n".join(p)
svg_path=os.path.join(OUT,"beat07_geometry.svg"); open(svg_path,"w").write(svg)
print("wrote", os.path.relpath(svg_path,OUT), len(svg),"bytes")

svgdoc=pymupdf.open(svg_path); pdfbytes=svgdoc.convert_to_pdf()
pdoc=pymupdf.open("pdf",pdfbytes)
pix=pdoc[0].get_pixmap(matrix=pymupdf.Matrix(4.0,4.0),alpha=False)
png_path=os.path.join(OUT,"beat07_geometry_preview.png"); pix.save(png_path)
print("wrote", os.path.relpath(png_path,OUT), pix.width,"x",pix.height)
