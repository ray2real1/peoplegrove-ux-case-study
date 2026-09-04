#!/usr/bin/env python3
"""BEAT 18 — WHAT COMES NEXT. The saved Detail screen pushes into the hero field's teal until pixel
becomes air: cold January fog, no place. The product's held facts stand as UI-true typographic panes
at their real temporal distances; brightness = proximity (Upload immunization records · THU nearest &
brightest; starting Jan 12 beyond; twelve weeks dissolving into fog). Maya small, from behind, mid-
step, phone lowered dark; dated receipt at her feet. Proof 0/25/50/75/100, 50% = standalone hero.
No destination/employer/outcome. Saved != accepted. Lineage internal, never in-frame."""
import pathlib

# held facts as standing panes: (label, value, depth 0=near..1=far, tag)
PANES=[
 ("UPLOAD IMMUNIZATION RECORDS","THU",0.02),
 ("INTERVIEW PREP · CAREER OFFICE","FRI",0.16),
 ("ADD TWO FRAMES TO PORTFOLIO","SAT",0.30),
 ("ROTATION BEGINS","starting Jan 12",0.52),
 ("TWELVE WEEKS","· · ·",0.78),
]
def panes_html(t):
    # t = morph 0..1 (0 flat screen, 1 full standing panes in fog)
    out=[]
    for lab,val,depth in PANES:
        near=1-depth
        bright=0.35+0.65*near          # brightness = proximity
        scale=(0.5+0.5*near)
        y=18+depth*46                  # further = higher/back
        x=8+depth*10
        op=(0.15+0.85*near)*min(1,t*1.4)
        blur=depth*2.2*(1-t*0.3)
        out.append(
         f'<div class="pane" style="left:{x}%;top:{y}%;width:{70-depth*22}%;opacity:{op:.2f};'
         f'transform:scale({scale:.2f});filter:blur({blur:.1f}px)">'
         f'<div class="pl" style="color:rgba(255,255,255,{bright:.2f})">{lab}</div>'
         f'<div class="mist"></div>'
         f'<div class="pv" style="color:rgba(255,255,255,{min(1,bright+.1):.2f})">{val}</div></div>')
    return "".join(out)

def frame(t, big=False):
    figure = (f'<div class="fig" style="opacity:{max(0,(t-0.5))*2:.2f}"></div>'
              f'<div class="feet" style="opacity:{max(0,(t-0.6))*2.5:.2f}">SAVED · Tue 9:41 AM</div>') if t>0.5 else ''
    # flat screen fades out as t rises; fog rises
    screen_op=max(0,1-t*1.5); fog_op=min(1,t*1.2)
    return f'''<div class="fr {'hero' if big else ''}">
      <div class="teal"></div>
      <div class="screen" style="opacity:{screen_op:.2f}">
        <div class="sr"><span>RUNS</span><b>12 weeks · Jan 12</b></div>
        <div class="sr"><span>WEEKLY</span><b>16–20 hrs</b></div>
        <div class="sr"><span>NEXT</span><b>Upload immunization records · THU</b></div>
      </div>
      <div class="fog" style="opacity:{fog_op:.2f}"></div>
      <div class="panes">{panes_html(t)}</div>
      {figure}
      {'' if big else f'<div class="pct">{int(t*100)}%</div>'}
    </div>'''

hero=frame(0.5, big=True)
strip="".join(frame(t) for t in [0,0.25,0.5,0.75,1.0])
html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>
.page{{background:#0a1f24;color:#fff;font-family:'PG Mono',monospace;overflow:hidden}}
.deckbar{{position:absolute;left:44px;right:44px;top:22px;display:flex;justify-content:space-between;font:700 12px 'PG Mono';letter-spacing:.22em;color:#5f8b8f;z-index:30}}
.foot{{position:absolute;left:44px;right:44px;bottom:18px;display:flex;justify-content:space-between;font:700 11px 'PG Mono';letter-spacing:.22em;color:#4d7276;z-index:30}}
.fr{{position:relative;overflow:hidden;border-radius:12px}}
.fr .teal{{position:absolute;inset:0;background:linear-gradient(180deg,#12707a 0%,#155f68 40%,#0c3b43 100%)}}
.fr .screen{{position:absolute;left:9%;right:9%;top:40%;font-size:2.4vmin}}
.hero .screen{{top:64%;font-size:15px}}
.sr{{display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.3);padding:3% 0;color:#cfeae9}}
.sr b{{color:#fff}}
.fr .fog{{position:absolute;inset:0;background:linear-gradient(180deg, #eef4f3 0%, #cfe0df 34%, rgba(180,205,203,.5) 60%, transparent 100%)}}
.panes{{position:absolute;inset:0}}
.pane{{position:absolute}}
.pl{{font:700 1.5vmin 'PG Mono';letter-spacing:.12em}}
.hero .pl{{font-size:12px}}
.mist{{height:1px;background:rgba(255,255,255,.55);margin:5px 0}}
.pv{{font-family:'PG Serif Italic';font-style:italic;font-size:2.6vmin;text-align:right}}
.hero .pv{{font-size:22px}}
.fig{{position:absolute;left:46%;bottom:6%;width:44px;height:120px;border-radius:40% 40% 20% 20%/60% 60% 12% 12%;
  background:linear-gradient(180deg,#0c2a2e,#061a1d);box-shadow:0 20px 40px rgba(0,0,0,.4)}}
.hero .fig{{width:70px;height:190px}}
.feet{{position:absolute;left:44%;bottom:3%;font:700 1.2vmin 'PG Mono';letter-spacing:.06em;color:#20737B;
  background:rgba(255,255,255,.85);padding:3px 7px;border-radius:3px}}
.hero .feet{{font-size:9px}}
.pct{{position:absolute;left:8px;bottom:6px;font:800 11px 'PG Mono';color:#0a1f24;text-shadow:0 1px 2px #fff}}
/* layout */
.hero{{position:absolute;left:70px;top:110px;width:760px;height:600px}}
.right{{position:absolute;right:64px;top:150px;width:640px}}
.right h2{{font-family:'PG Display';font-size:46px;line-height:.96;color:#eaf4f3}}
.right p{{font:600 12px/1.7 'PG Mono';color:#8fb4b3;margin-top:16px}}
.right .law{{margin-top:22px;font:800 11px 'PG Mono';letter-spacing:.1em;color:#5f8b8f;line-height:2}}
.proof{{position:absolute;right:64px;bottom:96px;width:640px}}
.proof .h{{font:700 10px 'PG Mono';letter-spacing:.16em;color:#5f8b8f;margin-bottom:10px}}
.strip{{display:flex;gap:10px}}
.strip .fr{{width:120px;height:150px}}
</style></head><body><div class="page">
<div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 18 · WHAT COMES NEXT</span></div>
{hero}
<div class="right">
  <h2>Not what<br>happened —<br>what she<br>can see.</h2>
  <p>The interface becomes the legibility it promised: the held facts stand ahead of her, ordered, dated, nearest-first. Brightness is proximity; fog is the unknown.</p>
  <div class="law">SAVED ≠ ACCEPTED<br>TRACKED ≠ ACHIEVED<br>NO DESTINATION · NO OUTCOME</div>
</div>
<div class="proof"><div class="h">RENDER PROOF · 0 / 25 / 50 / 75 / 100 — 50% IS THE STANDALONE HERO</div>
  <div class="strip">{strip}</div></div>
<div class="foot"><span>HALF PIXEL, HALF WINTER AIR — THE 1PX MIST RULE, NOW THE LONGEST LINE IN THE FRAME</span><span>MAYA FIGURE (PHOTOGRAPHIC) · RAYMOND REVIEW · LINEAGE STAYS INTERNAL</span></div>
</div></body></html>'''
pathlib.Path("beats/beat18.html").write_text(html); print("wrote beat18")
