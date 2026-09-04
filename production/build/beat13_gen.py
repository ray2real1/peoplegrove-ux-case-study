#!/usr/bin/env python3
"""BEAT 13 — THE TURN. Same field as Beat 12 (identical framing, seed 1284), one page later.
Luminance (not colour) withdrawn: 104 skeletons sink into shadow (hue intact, still present &
countable); 24 rise into light. One canon record legible — Nursing Clinical Rotation.
True filter sheet small at right; 128 -> 24 only on the apply bar. Dim != delete."""
import random, pathlib
random.seed(1284)  # MUST match beat12 for identical framing

CATS=[("clinical","#20737B",31),("engineering","#2A87F7",24),("design","#E87861",18),
 ("business","#00253E",27),("research","#24C86F",12),("education","#FFCA0B",16)]
units=[]
for name,col,n in CATS: units+=[(name,col)]*n
random.shuffle(units)

W,H=1600,900
ORIGIN=(70,150,300,470)
def in_origin(x,y,w,h):
    ox,oy,ow,oh=ORIGIN
    return not (x>ox+ow+30 or x+w<ox-10 or y>oy+oh+20 or y+h<oy-10)

skel=[]
for (name,col) in units:
    for _ in range(40):
        gx=random.random()**0.62; gy=random.random()**0.62
        x=120+gx*(W-120-150); y=110+gy*(H-110-140)
        crush=(gx+gy)/2; scale=random.uniform(0.55,1.5)*(1.0-0.35*crush)
        w=int(150*scale); h=int((70+22*random.randint(0,3))*scale)
        if x+w>W-30: x=W-30-w
        if in_origin(x,y,w,h) and y<ORIGIN[1]+ORIGIN[3]: continue
        rows=random.choice([1,1,2,2,3,4]); rot=random.uniform(-3,3)
        skel.append([x,y,w,h,col,rows,rot,crush,name]); break
skel.sort(key=lambda s:s[7])

# choose 24 lit units: filter = Clinical & Care + Business (compatible). Nursing is the legible one.
lit_idx=[i for i,s in enumerate(skel) if s[8] in ("clinical","business")][:24]
lit_set=set(lit_idx)
nursing_i=next(i for i in lit_idx if skel[i][8]=="clinical")

def veil_unit(s, lit):
    x,y,w,h,col,rows,rot,cr,name=s
    inner=w-14
    tw=int(inner*random.uniform(.55,.9)); ow=int(inner*random.uniform(.35,.6))
    trows="".join(f'<div style="height:{max(3,int(h*0.05))}px;width:{int(inner*random.uniform(.4,.95))}px;'
        f'background:#c3ccd4;border-radius:2px;margin-top:{max(3,int(h*0.05))}px"></div>' for _ in range(rows))
    z=60 if lit else 1
    return (f'<div style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;width:{w}px;height:{h}px;'
      f'background:#fff;border:1px solid #d5dde3;border-radius:8px;box-shadow:0 6px 14px rgba(11,40,64,.07);'
      f'transform:rotate({rot:.1f}deg);overflow:hidden;z-index:{z}">'
      f'<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:{col}"></div>'
      f'<div style="padding:{int(h*0.13)}px 8px 8px 12px">'
      f'<div style="height:{max(6,int(h*0.14))}px;width:{tw}px;background:#8a99a6;border-radius:3px"></div>'
      f'<div style="height:{max(4,int(h*0.08))}px;width:{ow}px;background:#aab6c0;border-radius:2px;margin-top:6px"></div>'
      f'{trows}</div></div>')

random.seed(77)  # veil widths (cosmetic only)
dim_html="".join(veil_unit(s,False) for i,s in enumerate(skel) if i not in lit_set)
random.seed(78)
lit_html="".join(veil_unit(s,True) for i,s in enumerate(skel) if i in lit_set and i!=nursing_i)

# legible Nursing at its own position
nx,ny=skel[nursing_i][0],skel[nursing_i][1]
nx=min(nx,W-360); ny=min(ny,H-260)
nursing=(f'<div style="position:absolute;left:{nx:.0f}px;top:{ny:.0f}px;width:330px;z-index:80;'
  f'background:#fff;border:1px solid #cfd8de;border-radius:16px;box-shadow:0 26px 60px rgba(11,40,64,.28);'
  f'overflow:hidden;font-family:-apple-system,Arial,sans-serif">'
  f'<div style="height:4px;background:#20737B"></div><div style="padding:15px 17px 17px">'
  f'<div style="font:700 8px \'PG Mono\';letter-spacing:.14em;color:#20737B">CLINICAL & CARE · CLINICAL PLACEMENT</div>'
  f'<div style="font-weight:800;font-size:19px;color:#0b2840;margin-top:8px">Nursing Clinical Rotation</div>'
  f'<div style="font-size:12px;color:#5b6b78;margin-top:3px">Aspen Health · Denver, CO</div>'
  f'<div style="font-size:12px;color:#33424e;margin-top:10px">16–20 hrs/wk · 12 wks · starts Jan 12 · 12 spots</div>'
  f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:13px">'
  f'<span style="font:800 9px \'PG Mono\';letter-spacing:.08em;color:#00253E;background:#FFCA0B;border-radius:5px;padding:4px 8px">CLOSES OCT 3</span>'
  f'<span style="font:700 9px \'PG Mono\';letter-spacing:.05em;color:#20737B">SAVED TUE · 9:41 AM</span></div></div></div>')

# filter sheet (true state) small at right + apply bar
def chip(t,on): return (f'<span style="display:inline-block;font:700 9px \'PG Mono\';letter-spacing:.04em;'
  f'padding:5px 9px;border-radius:20px;margin:0 5px 6px 0;'
  f'{"background:#20737B;color:#fff" if on else "background:#12324a;color:#7f9cb4"}">{("✓ " if on else "")+t}</span>')
sheet=(f'<div style="position:absolute;right:44px;top:150px;width:290px;z-index:90;background:#00253E;'
  f'border-radius:22px;box-shadow:0 30px 70px rgba(0,0,0,.45);overflow:hidden;color:#fff;font-family:-apple-system,Arial,sans-serif">'
  f'<div style="padding:16px 18px 0;display:flex;justify-content:space-between;align-items:baseline">'
  f'<span style="font:800 15px sans-serif">Narrow the field</span><span style="font:700 9px \'PG Mono\';color:#7f9cb4">RESET</span></div>'
  f'<div style="padding:12px 18px 0"><div style="font:700 9px \'PG Mono\';letter-spacing:.14em;color:#7f9cb4">CATEGORY</div>'
  f'<div style="margin-top:8px">{chip("Clinical & Care",1)}{chip("Business",1)}{chip("Engineering",0)}{chip("Research",0)}</div></div>'
  f'<div style="padding:8px 18px 0"><div style="font:700 9px \'PG Mono\';letter-spacing:.14em;color:#7f9cb4">TYPE</div>'
  f'<div style="margin-top:8px">{chip("Clinical placement",1)}{chip("Fellowship",1)}{chip("Internship",0)}</div></div>'
  f'<div style="padding:8px 18px 0"><div style="font:700 9px \'PG Mono\';letter-spacing:.14em;color:#7f9cb4">WEEKLY · DISTANCE</div>'
  f'<div style="margin-top:8px">{chip("10–20 hrs",1)}{chip("within 25 mi",1)}</div></div>'
  f'<div style="margin:14px 0 0;background:#24C86F;color:#00253E;padding:15px 18px;display:flex;justify-content:space-between;align-items:center">'
  f'<span style="font:800 13px \'PG Mono\';letter-spacing:.06em">128 → 24</span>'
  f'<span style="font:800 13px sans-serif">Show 24 roles</span></div></div>')

html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>.page{{background:#e9eef2}}
.scrim{{position:absolute;inset:0;background:rgba(3,20,36,.52);z-index:40}}
.pool{{position:absolute;inset:0;z-index:45;pointer-events:none;
  background:radial-gradient(60% 55% at 42% 52%, rgba(255,255,255,.16), transparent 70%)}}
.deckbar{{position:absolute;left:40px;right:40px;top:24px;display:flex;justify-content:space-between;font:700 12px 'PG Mono';letter-spacing:.22em;color:#8fa0ad;z-index:99}}
.foot{{position:absolute;left:40px;right:40px;bottom:22px;display:flex;justify-content:space-between;font:700 11px 'PG Mono';letter-spacing:.22em;color:#aeb9c2;z-index:99}}</style></head>
<body><div class="page">
{dim_html}
<div class="scrim"></div><div class="pool"></div>
{lit_html}
{nursing}
{sheet}
<div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 13 · THE TURN · 24 IN THE LIGHT</span></div>
<div class="foot"><span>DIMMED IS NOT DELETED — 104 REMAIN, HUE INTACT</span><span>NARROWING NEVER FEELS LIKE LOSING</span></div>
</div></body></html>'''
out=pathlib.Path(__file__).resolve().parents[1]/"beats"/"beat13.html"
out.write_text(html)
print("wrote",out,"| lit:",len(lit_set),"| dimmed:",128-len(lit_set),"| nursing idx",nursing_i)
