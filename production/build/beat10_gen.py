#!/usr/bin/env python3
"""BEAT 10 — EVERYTHING, DRAWN ONCE. Bright overhead flat-lay of the system's complete true
inventory (every card variant, chip, seal state, keyline, stamp, control the tokens generate),
packed edge to edge like a market stall on warm paper, hard tidy shadows, token column tiny at the
margin. One hairline runs from a single token and lights every instance it touches. The wildcard
tile — the one component that exists exactly once — sits dead centre."""
import pathlib, random
random.seed(10)
CATS=[("Clinical & Care","#20737B","CA","0°"),("Engineering","#2A87F7","BU","60°"),
      ("Design & Media","#E87861","CR","120°"),("Business","#00253E","LE","180°"),
      ("Research","#24C86F","DI","240°"),("Education","#FFCA0B","TE","300°")]
tiles=[]
def T(html,w='auto'): tiles.append(html)

# category chips (6)
for name,col,ini,clk in CATS:
    T(f'<div class="chip" style="border-color:{col};color:{col}"><span class="dot" style="background:{col}"></span>{name}</div>')
# ring seals — open, keyed to clock position (6)
for name,col,ini,clk in CATS:
    T(f'<div class="seal"><div class="ring" style="border-color:{col}"><b>{ini}</b></div><span>{clk}</span></div>')
# filled seals (saved) with second verified ring (6)
for name,col,ini,clk in CATS:
    T(f'<div class="seal"><div class="ring2"><div class="ring" style="border-color:{col};background:{col};color:#fff"><b>{ini}</b></div></div><span>saved</span></div>')
# status chips
for lab,bg,fg in [("SAVED","#20737B","#fff"),("APPLIED","#24C86F","#00253E"),("IN REVIEW","#FFCA0B","#00253E")]:
    T(f'<div class="status" style="background:{bg};color:{fg}">● {lab}</div>')
# save controls: open ring, filled seal+glyph+label
T('<div class="save"><div class="oc"></div><span>Save</span></div>')
T('<div class="save"><div class="fc">✓</div><span>Saved · Tue 9:41</span></div>')
# edge tabs (deadline grows a tab)
T('<div class="tab yel">CLOSES OCT 3</div>')
T('<div class="tab yel">DUE THU</div>')
T('<div class="tab yel">DUE SAT</div>')
# stamps (dated receipt)
T('<div class="stamp">SAVED TO TRACKER · Tue · 9:41 AM</div>')
# category rules (3px keylines, 6)
for name,col,ini,clk in CATS:
    T(f'<div class="rule"><div style="height:3px;background:{col};border-radius:2px"></div><span>rule · 3px</span></div>')
# spots / meta chips
for s in ["12 SPOTS","4 SPOTS","10–20 hrs","within 25 mi","Remote","On campus"]:
    T(f'<div class="meta">{s}</div>')
# mist rule (1px hairline token)
T('<div class="rule"><div style="height:1px;background:#c3ccd4"></div><span>mist · 1px</span></div>')
# card variants — plate / field / compact (small, component-true)
def card(col,ini,title,org,tab,dense):
    rows="".join('<div class="cr"></div>' for _ in range(dense))
    return (f'<div class="pc"><div style="height:3px;background:{col}"></div><div class="pcb">'
      f'<div class="pch"><div class="pcr" style="border-color:{col};color:{col}">{ini}</div>'
      f'<div><div class="pct">{title}</div><div class="pco">{org}</div></div></div>{rows}'
      f'<div class="pcf"><span class="pt" style="background:{col if col!="#FFCA0B" else "#FFCA0B"}">{tab}</span><div class="oc sm"></div></div></div></div>')
T(card("#20737B","AH","Nursing Clinical Rotation","Aspen Health · Denver, CO","CLOSES OCT 3",2))
T(card("#00253E","CB","Community Banking","Copperline Bank · Chicago, IL","FELLOWSHIP",1))
T(card("#2A87F7","HR","Robotics Engineering Co-op","· Austin, TX","4 SPOTS",2))
T(card("#E87861","FM","UX Design Apprenticeship","Fieldnote Media · Remote","DUE SAT",1))
T(card("#FFCA0B","NU","Student Success Mentor","Northgate University","MENTORSHIP",1))

# duplicate the small primitives to fill the stall densely (still all real token outputs)
base=list(tiles)
for _ in range(3):
    for h in base:
        if 'class="chip"' in h or 'class="seal"' in h or 'class="status"' in h or 'class="meta"' in h or 'class="rule"' in h or 'class="tab' in h:
            tiles.append(h)
random.shuffle(tiles)

# wildcard tile — exists exactly once — placed dead centre
wildcard=('<div class="wild"><div class="az">abcdefghijklmnopqrstuvwxyz</div>'
  '<div class="wl">Still exploring? Let the feed surprise you for a week.</div>'
  '<div class="wtag">THE ONE THAT EXISTS ONCE</div></div>')

grid="".join(f'<div class="cell">{t}</div>' for t in tiles)
html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>
.page{{background:#f2ede3}}  /* warm paper */
.deckbar{{position:absolute;left:40px;right:40px;top:22px;display:flex;justify-content:space-between;font:700 12px 'PG Mono';letter-spacing:.22em;color:#a99f8c;z-index:20}}
.foot{{position:absolute;left:40px;right:40px;bottom:18px;display:flex;justify-content:space-between;font:700 11px 'PG Mono';letter-spacing:.22em;color:#b3a892;z-index:20}}
.stall{{position:absolute;left:40px;top:70px;width:1520px;height:760px;column-width:150px;column-gap:10px}}
.cell{{break-inside:avoid;margin-bottom:10px}}
.chip{{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1.5px solid;border-radius:20px;padding:6px 11px;font:700 11px sans-serif;box-shadow:0 2px 5px rgba(60,50,30,.12)}}
.dot{{width:9px;height:9px;border-radius:50%}}
.seal{{background:#fff;border-radius:10px;padding:9px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 6px rgba(60,50,30,.14);font:700 9px 'PG Mono';color:#8a7f6a}}
.ring{{width:30px;height:30px;border-radius:50%;border:2.5px solid;display:flex;align-items:center;justify-content:center;font:800 10px sans-serif}}
.ring2{{position:relative;padding:2px;border:2px solid #cbb; border-radius:50%}}
.status{{border-radius:16px;padding:6px 12px;font:800 9px 'PG Mono';letter-spacing:.08em;box-shadow:0 2px 6px rgba(60,50,30,.14)}}
.save{{background:#fff;border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 6px rgba(60,50,30,.14);font:700 11px sans-serif;color:#0b2840}}
.oc{{width:22px;height:22px;border-radius:50%;border:2.5px solid #20737B}}
.oc.sm{{width:16px;height:16px;border-width:2px}}
.fc{{width:22px;height:22px;border-radius:50%;background:#20737B;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px}}
.tab.yel{{display:inline-block;background:#FFCA0B;color:#00253E;font:800 9px 'PG Mono';letter-spacing:.06em;border-radius:4px;padding:5px 9px;box-shadow:0 2px 6px rgba(60,50,30,.14)}}
.stamp{{background:#fff;border-left:3px solid #20737B;padding:8px 10px;font:700 9px 'PG Mono';color:#20737B;border-radius:4px;box-shadow:0 2px 6px rgba(60,50,30,.14)}}
.rule{{background:#fff;border-radius:8px;padding:9px 10px;box-shadow:0 2px 6px rgba(60,50,30,.14)}}
.rule span{{display:block;font:700 8px 'PG Mono';color:#a99f8c;margin-top:6px}}
.meta{{display:inline-block;background:#eef2f5;border-radius:14px;padding:6px 11px;font:700 10px sans-serif;color:#33424e}}
.pc{{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 16px rgba(60,50,30,.18)}}
.pcb{{padding:9px 10px}}
.pch{{display:flex;gap:8px;align-items:center}}
.pcr{{width:26px;height:26px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font:800 8px sans-serif}}
.pct{{font:800 11px sans-serif;color:#0b2840;line-height:1.05}}
.pco{{font-size:8px;color:#5b6b78;margin-top:2px}}
.cr{{height:5px;background:#e6ebee;border-radius:2px;margin-top:7px}}
.pcf{{display:flex;justify-content:space-between;align-items:center;margin-top:9px}}
.pt{{font:800 8px 'PG Mono';color:#00253E;background:#FFCA0B;border-radius:4px;padding:3px 6px}}
.wild{{position:absolute;left:50%;top:calc(70px + 380px);transform:translate(-50%,-50%);width:300px;background:#00253E;color:#fff;border-radius:16px;padding:18px 18px 16px;box-shadow:0 30px 70px rgba(20,10,0,.4);z-index:15}}
.wild .az{{font-family:'PG Serif Italic';font-style:italic;font-size:22px;letter-spacing:.03em;color:#cfe0ff}}
.wild .wl{{font-size:11px;color:#9fb4c7;margin-top:8px}}
.wild .wtag{{font:800 8px 'PG Mono';letter-spacing:.14em;color:#71FF4E;margin-top:12px}}
/* single-token hairline lighting one constellation */
.thread{{position:absolute;left:150px;top:70px;width:2px;height:600px;background:linear-gradient(180deg,#20737B,transparent);opacity:.5;z-index:12}}
</style></head><body><div class="page">
<div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 10 · EVERYTHING, DRAWN ONCE</span></div>
<div class="stall">{grid}</div>
{wildcard}
<div class="foot"><span>NOTHING IN THIS SYSTEM IS DRAWN TWICE — COLOUR · RADIUS · STATE · CATEGORY ARE VARIABLES</span><span>ONE TOKEN, ONE CONSTELLATION</span></div>
</div></body></html>'''
pathlib.Path("beats/beat10.html").write_text(html); print("wrote beat10, tiles:",len(tiles))
