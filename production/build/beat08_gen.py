#!/usr/bin/env python3
"""BEAT 08 — HANGING BY A DATE. Flagship.
Recover the complete Nursing card (open ring + CLOSES OCT 3 tab) from the canonical Search screen.
R = card rectangle + protruding OCT 3 tab. Uniform planar density. Solve resting rotation about
the pivot P (OCT 3 tab centroid) so the centroid C lies vertically below P. Angle is DERIVED, not
chosen. Render: full-bleed saturated teal, monumental complete card, one hard geometry-consistent
shadow, one small hard light, save ring open, yellow non-emissive, card uncropped."""
import pathlib, math, json
from PIL import Image
import numpy as np

SRC="sources/screens_canon/search.png"
im=Image.open(SRC).convert("RGB"); W,H=im.size
arr=np.asarray(im).astype(int)

def near(rgb,target,tol): return (abs(rgb[...,0]-target[0])<tol)&(abs(rgb[...,1]-target[1])<tol)&(abs(rgb[...,2]-target[2])<tol)

# --- detect teal header (#20737B) in the card region ---
teal=near(arr,(32,115,123),46)
teal[:int(H*0.45)]=False; teal[int(H*0.63):]=False
ys,xs=np.where(teal)
card_left,card_right=xs.min(),xs.max()
# card_top = first row where teal covers a large fraction of the card width (the solid header band)
cov=teal[:, card_left:card_right].mean(axis=1)
rows=np.where(cov>0.5)[0]
card_top=int(rows.min())
# --- detect yellow OCT3 tab (#FFCA0B) below the body: strict saturated yellow only ---
R,G,B=arr[...,0],arr[...,1],arr[...,2]
yel=(R>232)&(G>175)&(G<218)&(B<80)
yel[:int(H*0.70)]=False; yel[int(H*0.86):]=False
tys,txs=np.where(yel)
# isolate the OCT3 chip: it sits in the LEFT portion of the card; take the left-most cluster
xmin=txs.min()
keep=txs< (xmin + 0.45*(card_right-card_left))
tys,txs=tys[keep],txs[keep]
tab_left,tab_right=txs.min(),txs.max(); tab_top,tab_bot=tys.min(),tys.max()
card_bottom=tab_top  # white body bottom edge == where the tab attaches
Wc=card_right-card_left; Hc=card_bottom-card_top
tw=tab_right-tab_left; th=tab_bot-tab_top

# --- rigid-body physics (local coords, origin = card_left,card_top; y-down) ---
A1=Wc*Hc; c1=(Wc/2.0, Hc/2.0)
A2=tw*th; c2=((tab_left-card_left)+tw/2.0, (card_bottom-card_top)+th/2.0)
Cx=(A1*c1[0]+A2*c2[0])/(A1+A2); Cy=(A1*c1[1]+A2*c2[1])/(A1+A2)
Px=(tab_left-card_left)+tw/2.0; Py=(card_bottom-card_top)+th/2.0   # pivot = tab centroid
# rotation so P->C points straight down (+y). y-down screen coords.
ang_PC=math.degrees(math.atan2(Cy-Py, Cx-Px))    # current angle from +x (y-down)
theta=90.0-ang_PC                                # rotate by theta so P->C -> +90 (down)
theta=((theta+180)%360)-180                      # normalise to [-180,180]

deriv=dict(card=[int(card_left),int(card_top),int(card_right),int(card_bottom)],
  tab=[int(tab_left),int(tab_top),int(tab_right),int(tab_bot)],
  Wc=int(Wc),Hc=int(Hc),tab_w=int(tw),tab_h=int(th),
  centroid_local=[round(Cx,2),round(Cy,2)], pivot_local=[round(Px,2),round(Py,2)],
  angle_deg=round(theta,3))
pathlib.Path("sources/beat08_derivation.json").write_text(json.dumps(deriv,indent=2))
print(json.dumps(deriv,indent=2))

# --- crop one combined sprite (card body + protruding OCT3 tab) with a clean rounded-rect alpha ---
from PIL import ImageDraw
sil=im.crop((card_left,card_top,card_right,tab_bot)).convert("RGBA")
sw,sh=sil.size
r=int(20*(1150/390))  # card radius (20 canonical) scaled to recovered screen
mask=Image.new("L",(sw,sh),0); md=ImageDraw.Draw(mask)
md.rounded_rectangle([0,0,sw-1,Hc-1],radius=r,fill=255)                      # card body
md.rounded_rectangle([tab_left-card_left,Hc-4,tab_right-card_left,sh-1],radius=8,fill=255)  # OCT3 tab
sil.putalpha(mask); sil.save("sources/beat08_card.png")
# pivot in sprite coords == (Px,Py) (origin card_left,card_top)
import numpy as _np
def rot(pt,piv,deg):
    a=math.radians(deg);c,s=math.cos(a),math.sin(a)
    dx,dy=pt[0]-piv[0],pt[1]-piv[1]
    return (piv[0]+dx*c-dy*s, piv[1]+dx*s+dy*c)   # CSS/std matrix; +deg = clockwise in y-down
corners=[(0,0),(sw,0),(sw,Hc),(0,Hc),(tab_left-card_left,sh),(tab_right-card_left,sh)]
rc=[rot(p,(Px,Py),theta) for p in corners]
xs_=[p[0] for p in rc]; ys_=[p[1] for p in rc]
bbw=max(xs_)-min(xs_); bbh=max(ys_)-min(ys_)
K=min(1480/bbw,780/bbh)          # fit uncropped
# visual position of a sprite point p at scale K, layout origin (0,0), origin=pivot*K:
# vis = pivot*K + M(theta)*(p*K - pivot*K); bbox centre of vis:
def vis(p):
    rp=rot((p[0]*K,p[1]*K),(Px*K,Py*K),theta); return rp
vc=[vis(p) for p in corners]
cx=(min(x for x,_ in vc)+max(x for x,_ in vc))/2; cy=(min(y for _,y in vc)+max(y for _,y in vc))/2
Lx=800-cx; Ly=450-cy
comp_w=sw*K; comp_h=sh*K
html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>
.page{{background:#1f6f77;overflow:hidden}}
.rig{{position:absolute;left:{Lx:.1f}px;top:{Ly:.1f}px;width:{comp_w:.1f}px;height:{comp_h:.1f}px;
   transform:rotate({theta:.2f}deg);transform-origin:{Px*K:.1f}px {Py*K:.1f}px;
   filter:drop-shadow(40px 52px 3px rgba(0,18,20,.42))}}
.rig img{{width:{comp_w:.1f}px;display:block}}
.foot{{position:absolute;left:44px;right:44px;bottom:24px;display:flex;justify-content:space-between;
   font:700 11px 'PG Mono';letter-spacing:.22em;color:#bfe3e2;z-index:9}}
.deckbar{{position:absolute;left:44px;right:44px;top:26px;display:flex;justify-content:space-between;
   font:700 12px 'PG Mono';letter-spacing:.22em;color:#8fcfce;z-index:9}}
</style></head><body><div class="page">
  <div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 08 · HANGING BY A DATE</span></div>
  <div class="rig"><img src="../sources/beat08_card.png"></div>
  <div class="foot"><span>THE OCT 3 LOCATION CARRIES THE ENTIRE INFORMATION OBJECT</span><span>LEAN PHYSICALLY DERIVED · θ = {theta:.1f}° · SAVE RING OPEN</span></div>
</div></body></html>'''
pathlib.Path("beats/beat08.html").write_text(html)
print(f"angle {theta:.2f} | sprite {sw}x{sh} | K {K:.3f} | rot-bbox {bbw:.0f}x{bbh:.0f} | L ({Lx:.0f},{Ly:.0f})")
