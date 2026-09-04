#!/usr/bin/env python3
"""BEAT 15 — STILL HERE. Interface long exposure: the discovery stream pours as vertical
motion-blurred ghost trails (Beat 12's fragment language); inside it the three true tracker
entries stand pin-sharp with their saved dates and dues; the yellow '3 need you this week'
strip sharp at top. Blur = the feed; sharpness = the kept. No props, no kanban/calendar."""
import random, pathlib
random.seed(615)
CATCOL=["#20737B","#2A87F7","#E87861","#00253E","#24C86F","#FFCA0B"]
W,H=1600,900

# ghost stream: vertical motion-blurred skeleton fragments (the moving feed)
streaks=[]
for _ in range(70):
    x=random.uniform(40,W-80); w=random.uniform(70,150)
    top=random.uniform(-40,120); length=random.uniform(340,760)
    col=random.choice(CATCOL); op=random.uniform(.05,.16); blur=random.uniform(6,16)
    # keep the sharp central column relatively clear so kept cards read
    if 560<x<1040 and random.random()<0.6: continue
    streaks.append((x,w,top,length,col,op,blur))
def streak(x,w,top,length,col,op,blur):
    return (f'<div style="position:absolute;left:{x:.0f}px;top:{top:.0f}px;width:{w:.0f}px;height:{length:.0f}px;'
      f'border-radius:10px;opacity:{op:.2f};filter:blur({blur:.0f}px);'
      f'background:linear-gradient(180deg,transparent,{col} 22%,{col} 78%,transparent);'
      f'box-shadow:inset 0 0 0 1px {col}">'
      # faint internal rule lines to echo record structure, smeared by blur
      f'<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:{col}"></div></div>')

# the three true tracker entries — pin sharp
def entry(col,badge,org_ini,title,org,action,due,saved,due_col="#FFCA0B"):
    due_html=(f'<span style="font:800 10px \'PG Mono\';letter-spacing:.08em;color:#00253E;'
              f'background:{due_col};border-radius:6px;padding:5px 9px">{due}</span>') if due else '<span></span>'
    return (f'<div style="background:#fff;border-radius:16px;box-shadow:0 22px 50px rgba(0,0,0,.35);'
      f'overflow:hidden;font-family:-apple-system,Arial,sans-serif;margin-bottom:18px">'
      f'<div style="height:4px;background:{col}"></div>'
      f'<div style="padding:15px 18px 16px;display:flex;gap:13px">'
      f'<div style="width:40px;height:40px;border-radius:50%;border:2px solid {col};flex:none;'
      f'display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:{col}">{org_ini}</div>'
      f'<div style="flex:1">'
      f'<div style="font-weight:800;font-size:16px;color:#0b2840">{title}</div>'
      f'<div style="font-size:11px;color:#5b6b78;margin-top:2px">{org}</div>'
      f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:11px;padding-top:11px;border-top:1px solid #e6ebee">'
      f'<span style="font-size:12px;color:#33424e">{action}</span>{due_html}</div>'
      f'<div style="font:700 9px \'PG Mono\';letter-spacing:.06em;color:{col};margin-top:8px">{saved}</div>'
      f'</div></div></div>')

entries=(
 entry("#20737B","AH","AH","Nursing Clinical Rotation","Aspen Health · Denver, CO",
   "Upload immunization records","DUE THU","SAVED TUE · 9:41 AM")+
 entry("#E87861","FM","FM","UX Design Apprenticeship","Fieldnote Media · Remote",
   "Add two frames to portfolio","DUE SAT","SAVED MON · 8:15 AM")+
 entry("#FFCA0B","NU","NU","Student Success Mentor","Northgate University · On campus",
   "Read mentor handbook","","SAVED SUN · 6:52 PM"))

week=('<div style="background:#FFCA0B;color:#00253E;border-radius:14px;padding:14px 18px;margin-bottom:20px;'
  'font-family:-apple-system,Arial,sans-serif;box-shadow:0 18px 40px rgba(255,202,11,.28)">'
  '<div style="font:800 11px \'PG Mono\';letter-spacing:.16em">3 NEED YOU THIS WEEK</div>'
  '<div style="font-size:12.5px;font-weight:600;margin-top:7px;line-height:1.5">'
  'Interview prep with career office — <b>FRI</b> · Upload immunization records — <b>THU</b> · Add two frames to portfolio — <b>SAT</b></div></div>')

html=f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../build/fonts.css"><link rel="stylesheet" href="../build/tokens.css">
<style>.page{{background:radial-gradient(130% 100% at 50% -10%, #0d3252 0%, #05233c 55%, #021829 100%)}}
.deckbar{{position:absolute;left:44px;right:44px;top:24px;display:flex;justify-content:space-between;font:700 12px 'PG Mono';letter-spacing:.22em;color:#5f83a1;z-index:99}}
.foot{{position:absolute;left:44px;right:44px;bottom:22px;display:flex;justify-content:space-between;font:700 11px 'PG Mono';letter-spacing:.22em;color:#4f7391;z-index:99}}
.foot{{color:#4f7391}}
.kept{{position:absolute;left:50%;top:118px;transform:translateX(-50%);width:520px;z-index:30}}
.kh{{font:800 13px 'PG Mono';letter-spacing:.2em;color:#9fd8cf;margin-bottom:16px;text-align:center}}</style></head>
<body><div class="page">
{''.join(streak(*s) for s in streaks)}
<div class="deckbar"><span>PEOPLEGROVE V2 — OPPORTUNITY HUB</span><span>BEAT 15 · STILL HERE</span></div>
<div class="kept"><div class="kh">THE SPINE IS THE RECORD</div>{week}{entries}</div>
<div class="foot"><span>BLUR IS THE FEED · SHARPNESS IS THE KEPT</span><span>SAVED ROLES DO NOT SINK UNDER NEW MATCHES</span></div>
</div></body></html>'''
out=pathlib.Path(__file__).resolve().parents[1]/"beats"/"beat15.html"
out.write_text(html)
print("wrote",out,"| streaks:",len(streaks))
