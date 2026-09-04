#!/usr/bin/env python3
"""BEAT 06 — ONE UNBROKEN STRIP. The seven RECOVERED build screens joined edge to edge into one
continuous ribbon; the Nursing card crosses every seam (identical -> persistence), with the open
ring on one side of the Save seam and the filled seal on the other. Path line as the baseline with
true station counts; Interests as a literal side-flap folding off the main line. No nodes/arrows."""
import pathlib
S=250   # screen width in ribbon
SH=int(2430*S/1150)   # ~528
screens=["dashboard","search","filter","detail","save","tracker"]
stations=[("Dashboard","IN VIEW · 128"),("Search","DISCOVER"),("Filter","NARROW · 24"),
          ("Detail","EVALUATE"),("Save","SAVED · 3"),("Tracker","APPLIED · 2 · REVIEW · 1")]
ribbon_w=S*6  # 1500
left=(1600-ribbon_w)//2  # centre
top=150

imgs="".join(
 f'<img src="../sources/screens_canon/{n}.png" style="width:{S}px;height:{SH}px;display:block">'
 for n in screens)

# straddling Nursing card centred on each of the 5 seams; save-seam (index 3, between detail|save) flips ring
def nurse_card(cx, flip=False):
    w=196; x=cx-w//2; y=top+SH//2-70
    ring=('<div style="display:flex"><div style="width:22px;height:22px;border-radius:50%;border:2.5px solid #20737B"></div>'
          '<div style="width:22px;height:22px;border-radius:50%;border:2.5px solid #20737B;background:#20737B;'
          'margin-left:-8px;color:#fff;font-size:12px;display:flex;align-items:center;justify-content:center">✓</div></div>'
          ) if flip else ('<div style="width:22px;height:22px;border-radius:50%;border:2.5px solid #20737B"></div>')
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;background:#fff;border-radius:12px;'
      f'box-shadow:0 18px 40px rgba(4,20,36,.5);overflow:hidden;font-family:-apple-system,Arial,sans-serif;z-index:40">'
      f'<div style="height:3px;background:#20737B"></div>'
      f'<div style="padding:10px 11px 11px">'
      f'<div style="display:flex;justify-content:space-between;align-items:flex-start">'
      f'<div><div style="font:700 6.5px \'PG Mono\';letter-spacing:.1em;color:#20737B">CLINICAL &amp; CARE</div>'
      f'<div style="font-weight:800;font-size:12px;color:#0b2840;margin-top:3px;line-height:1.05">Nursing Clinical<br>Rotation</div>'
      f'<div style="font-size:8.5px;color:#5b6b78;margin-top:3px">Aspen Health · Denver, CO</div></div>'
      f'<div style="width:26px;height:26px;border-radius:50%;border:2px solid #20737B;flex:none;display:flex;'
      f'align-items:center;justify-content:center;font:800 8px sans-serif;color:#20737B">AH</div></div>'
      f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:9px">'
      f'<span style="font:800 7px \'PG Mono\';color:#00253E;background:#FFCA0B;border-radius:4px;padding:3px 6px">CLOSES OCT 3</span>'
      f'{ring}</div></div></div>')

seams=[left+S*k for k in range(1,6)]  # 5 seams
cards="".join(nurse_card(cx, flip=(i==3)) for i,cx in enumerate(seams))  # save seam between Detail(4)|Save(5)

# path baseline with stations
def station(i,name,sub):
    cx=left+S*i+S//2
    done = i<5
    dot=('#24C86F' if done else '#06263e')
    return (f'<div style="position:absolute;left:{cx-70}px;top:{top+SH+30}px;width:140px;text-align:center">'
      f'<div style="width:14px;height:14px;border-radius:50%;margin:0 auto;background:{dot};'
      f'{"" if done else "border:2px solid #3f6482"}"></div>'
      f'<div style="font:800 12px sans-serif;color:#0b2840;margin-top:12px">{name}</div>'
      f'<div style="font:700 8px \'PG Mono\';letter-spacing:.1em;color:#6f8496;margin-top:4px">{sub}</div></div>')
baseline=(f'<div style="position:absolute;left:{left+S//2}px;top:{top+SH+36}px;width:{S*5}px;height:3px;background:#cdd8df"></div>'
  +"".join(station(i,n,s) for i,(n,s) in enumerate(stations)))

# Interests side-flap folding off the tracker end
flap=(f'<div style="position:absolute;left:{left+ribbon_w-6}px;top:{top+SH-150}px;width:150px;height:150px;'
  f'background:linear-gradient(135deg,#0c3350,#04213a);border-radius:0 16px 16px 0;transform:perspective(600px) rotateY(38deg);'
  f'transform-origin:left center;box-shadow:18px 20px 40px rgba(0,0,0,.4);overflow:hidden;color:#fff;'
  f'font-family:-apple-system,Arial,sans-serif;padding:16px 14px">'
  f'<div style="font:700 8px \'PG Mono\';letter-spacing:.12em;color:#9fb4c7">INTERESTS — BRANCH</div>'
  f'<div style="font-weight:800;font-size:15px;margin-top:8px">What pulls you?</div>'
  f'<div style="display:flex;gap:6px;margin-top:12px"><span style="font-family:\'PG Serif Italic\';font-style:italic;color:#71c9b0;font-size:14px">Care</span>'
  f'<span style="font-family:\'PG Serif Italic\';font-style:italic;color:#8fbdf7;font-size:14px">Build</span></div></div>')

html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>.page{{background:#eef2f5}}
.deckbar{{position:absolute;left:44px;right:44px;top:26px;display:flex;justify-content:space-between;font:700 12px 'PG Mono';letter-spacing:.22em;color:#8fa0ad;z-index:99}}
.foot{{position:absolute;left:44px;right:44px;bottom:22px;display:flex;justify-content:space-between;font:700 11px 'PG Mono';letter-spacing:.22em;color:#9aa9b4;z-index:99}}
.ribbon{{position:absolute;left:{left}px;top:{top}px;display:flex;box-shadow:0 30px 70px rgba(4,20,36,.30);border-radius:10px;overflow:hidden}}</style></head>
<body><div class="page">
<div class="ribbon">{imgs}</div>
{baseline}
{cards}
{flap}
<div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 06 · ONE UNBROKEN STRIP · SEVEN STATES, ONE PATH</span></div>
<div class="foot"><span>THE CARD PERSISTS ACROSS EVERY LAYOUT — SAVE FLIPS RING → SEAL AT THE JOIN</span><span>NOTHING MOVES BACKWARDS · NOTHING DEAD-ENDS</span></div>
</div></body></html>'''
out=pathlib.Path(__file__).resolve().parents[1]/"beats"/"beat06.html"
out.write_text(html); print("wrote",out)
