#!/usr/bin/env python3
"""BEAT 12 — STANDING TOO CLOSE. 128 partial record skeletons from universal primitives.
Populations obey verified counts exactly (31·24·18·27·12·16=128). Four canon records legible.
Origin Search screen (count 128) in the calm top-left. Density crushes toward bottom-right gutter.
No readable filler on anonymous units (veiled zones only) -> passes the print-scale veil proof."""
import random, pathlib, math
random.seed(1284)  # deterministic

CATS=[  # name, rule colour, population
 ("clinical","#20737B",31),("engineering","#2A87F7",24),("design","#E87861",18),
 ("business","#00253E",27),("research","#24C86F",12),("education","#FFCA0B",16)]
assert sum(c[2] for c in CATS)==128

# Build the population list (category per unit), shuffled
units=[]
for name,col,n in CATS: units+= [(name,col)]*n
random.shuffle(units)

W,H=1600,900
# origin screen occupies calm top-left; keep skeleton mass out of that box
ORIGIN=(70,150,300,470)  # x,y,w,h reserved

def in_origin(x,y,w,h):
    ox,oy,ow,oh=ORIGIN
    return not (x> ox+ow+30 or x+w< ox-10 or y> oy+oh+20 or y+h< oy-10)

skel=[]
placed=0
for (name,col) in units:
    # density gradient: bias toward bottom-right; scale varies wildly
    for _try in range(40):
        # weight positions toward bottom-right gutter
        gx=random.random()**0.62   # skew high
        gy=random.random()**0.62
        x=120+gx*(W-120-150)
        y=110+gy*(H-110-140)
        # scale smaller near the crush (bottom-right), larger & sparser top-left
        crush=(gx+gy)/2
        scale=random.uniform(0.55,1.5)*(1.0-0.35*crush)
        w=int(150*scale); h=int((70+22*random.randint(0,3))*scale)
        if x+w>W-30: x=W-30-w
        if in_origin(x,y,w,h) and y<ORIGIN[1]+ORIGIN[3]: continue
        rows=random.choice([1,1,2,2,3,4])   # variable veiled terms rows
        rot=random.uniform(-3,3)
        skel.append((x,y,w,h,col,rows,rot,crush)); placed+=1; break
# sort so denser/crushed ones paint later (overlap toward gutter)
skel.sort(key=lambda s:s[7])

def veil_unit(x,y,w,h,col,rows,rot):
    inner=w-14
    title_w=int(inner*random.uniform(.55,.9))
    org_w=int(inner*random.uniform(.35,.6))
    termrows="".join(
        f'<div style="height:{max(3,int(h*0.05))}px;width:{int(inner*random.uniform(.4,.95))}px;'
        f'background:#c3ccd4;border-radius:2px;margin-top:{max(3,int(h*0.05))}px"></div>'
        for _ in range(rows))
    return (f'<div style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;width:{w}px;height:{h}px;'
      f'background:#fff;border:1px solid #d5dde3;border-radius:8px;box-shadow:0 6px 14px rgba(11,40,64,.07);'
      f'transform:rotate({rot:.1f}deg);overflow:hidden">'
      f'<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:{col}"></div>'
      f'<div style="padding:{int(h*0.13)}px 8px 8px 12px">'
      f'<div style="height:{max(6,int(h*0.14))}px;width:{title_w}px;background:#8a99a6;border-radius:3px"></div>'
      f'<div style="height:{max(4,int(h*0.08))}px;width:{org_w}px;background:#aab6c0;border-radius:2px;margin-top:6px"></div>'
      f'{termrows}</div></div>')

# four canon LEGIBLE records
def legible(x,y,scale,col,cat,ctype,title,org,terms,tab,saved):
    tab_html=(f'<span style="font:800 9px \'PG Mono\';letter-spacing:.08em;color:#00253E;'
              f'background:#FFCA0B;border-radius:5px;padding:4px 7px">{tab}</span>') if tab else '<span></span>'
    saved_html=(f'<span style="font:700 9px \'PG Mono\';letter-spacing:.05em;color:#20737B">{saved}</span>') if saved else '<span></span>'
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{int(300*scale)}px;'
      f'background:#fff;border:1px solid #cfd8de;border-radius:14px;box-shadow:0 18px 40px rgba(11,40,64,.18);'
      f'transform:scale({scale});transform-origin:top left;overflow:hidden;font-family:-apple-system,Arial,sans-serif">'
      f'<div style="height:4px;background:{col}"></div>'
      f'<div style="padding:13px 15px 15px">'
      f'<div style="font:700 8px/1 \'PG Mono\',monospace;letter-spacing:.14em;color:{col}">{cat} · {ctype}</div>'
      f'<div style="font-weight:800;font-size:17px;color:#0b2840;margin-top:7px">{title}</div>'
      f'<div style="font-size:11px;color:#5b6b78;margin-top:3px">{org}</div>'
      f'<div style="font-size:11px;color:#33424e;margin-top:9px">{terms}</div>'
      f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;min-height:22px">'
      f'{tab_html}{saved_html}</div>'
      f'</div></div>')

legibles=[
 legible(430,150,1.18,"#20737B","CLINICAL & CARE","CLINICAL PLACEMENT","Nursing Clinical Rotation",
   "Aspen Health · Denver, CO","16–20 hrs/wk · 12 wks · starts Jan 12 · 12 spots","CLOSES OCT 3","SAVED TUE · 9:41 AM"),
 legible(880,470,1.0,"#E87861","DESIGN & MEDIA","APPRENTICESHIP","UX Design Apprenticeship",
   "Fieldnote Media · Remote","Add two frames to portfolio","DUE SAT","SAVED MON · 8:15 AM"),
 legible(1230,250,0.9,"#00253E","BUSINESS","FELLOWSHIP","Community Banking",
   "Copperline Bank · Chicago, IL","Fellowship","CLOSES OCT 3",""),
 legible(560,560,0.86,"#FFCA0B","EDUCATION","MENTORSHIP","Student Success Mentor",
   "Northgate University · On campus","Read mentor handbook","","SAVED SUN · 6:52 PM"),
]

# origin Search screen (calm, true, count 128)
ox,oy,ow,oh=ORIGIN
origin=(f'<div style="position:absolute;left:{ox}px;top:{oy}px;width:{ow}px;height:{oh}px;'
  f'background:#00253E;border-radius:26px;box-shadow:0 30px 70px rgba(0,0,0,.4);overflow:hidden;'
  f'font-family:-apple-system,Arial,sans-serif;color:#fff">'
  f'<div style="padding:16px 18px 0;font:600 12px sans-serif;display:flex;justify-content:space-between"><span>9:41</span><span>peoplegrove</span></div>'
  f'<div style="padding:26px 20px 0"><div style="font:800 30px sans-serif;letter-spacing:-.02em">Find what\'s<br>next.</div></div>'
  f'<div style="margin:20px 18px 0;background:#0c3350;border:1px solid #1c4a68;border-radius:12px;padding:11px 14px;color:#7f9cb4;font-size:12px">Role, keyword, organization…</div>'
  f'<div style="padding:22px 20px 0"><div style="font:800 64px \'PG Display\';line-height:.9;color:#71FF4E">128</div>'
  f'<div style="font:700 11px \'PG Mono\';letter-spacing:.14em;color:#9fb4c7;margin-top:6px">OPPORTUNITIES OPEN NEAR YOU</div>'
  f'<div style="font:700 9px \'PG Mono\';letter-spacing:.14em;color:#5b7c99;margin-top:4px">UPDATED 9:41 AM</div></div>'
  f'</div>')

html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>.page{{background:#e9eef2}}
.deckbar{{position:absolute;left:40px;right:40px;top:24px;display:flex;justify-content:space-between;font:700 12px 'PG Mono';letter-spacing:.22em;color:#8fa0ad;z-index:99}}
.foot{{position:absolute;left:40px;right:40px;bottom:22px;display:flex;justify-content:space-between;font:700 11px 'PG Mono';letter-spacing:.22em;color:#9aa9b4;z-index:99}}
.gutter{{position:absolute;right:0;bottom:0;width:60%;height:70%;background:radial-gradient(120% 120% at 100% 100%, rgba(11,40,64,.10), transparent 60%);pointer-events:none}}</style></head>
<body><div class="page">
<div class="gutter"></div>
{''.join(veil_unit(x,y,w,h,col,rows,rot) for (x,y,w,h,col,rows,rot,cr) in skel)}
{''.join(legibles)}
{origin}
<div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 12 · STANDING TOO CLOSE · 128 IN VIEW</span></div>
<div class="foot"><span>ABUNDANCE IS NOT THE PROBLEM — ARRANGEMENT IS</span><span>31 · 24 · 18 · 27 · 12 · 16 = 128 · COUNTABLE</span></div>
</div></body></html>'''
out=pathlib.Path(__file__).resolve().parents[1]/"beats"/"beat12.html"
out.write_text(html)
print("wrote", out, "| skeletons placed:", placed, "| legibles:", len(legibles))
