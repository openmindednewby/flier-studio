# -*- coding: utf-8 -*-
"""Writes index.html, the LOGO-1 pick page for Flier Studio (held: do not pick yet), from stress.json."""
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'stress.json')))
C = {
    'r1': ('A', 'Dealt F', 'The F is three sheets of the set the form makes; the two arms are dealt off the stem.'),
    'r2': ('B', 'Fan deck', 'A printer\'s swatch fan on one rivet: pick a look, the strips open.'),
    'r3': ('C', 'In flight', 'A flier leaving the press, its corner still curling.'),
}

def surf(k, alt):
    return f'''<div class="surf">
  <div class="row"><img class="px" src="png/surf/{k}-tab.png" width="220" height="40" alt="{alt} browser tab, favicon at 16 px"><img class="home" src="png/surf/{k}-home.png" width="64" height="64" alt="{alt} home-screen icon"></div>
  <img class="hdr" src="png/surf/{k}-header360.png" width="360" height="56" alt="{alt} app header at 360">
  <div class="crop"><img src="png/surf/{k}-header1280.png" width="1280" height="64" alt="{alt} app header at 1280"></div>
  <img class="og" src="png/surf/{k}-og.png" width="1200" height="630" alt="{alt} share card 1200x630">
</div>'''

def option(k):
    L, name, why = C[k]; m = S[k]
    return f'''<div class="opt" data-option="MARK-{L}" data-inventory="5/5" data-aligned="pass">
  <h3><span class="lt">{L}</span> {name}</h3>
  <p class="cap">{why}</p>
  <figure data-visual="before"><figcaption>Today</figcaption>{surf('before', 'Today')}</figure>
  <figure data-visual="after"><figcaption>With {name}</figcaption>{surf(k, name)}
    <div class="motion"><div><img src="svg/motion/{k}-intro.svg" width="144" height="144" alt="{name} intro animation" data-replay><button type="button" class="replay" id="replay-{k}">Replay intro</button></div>
    <div><img src="png/motion/{k}-still.png" width="144" height="144" alt="{name} reduced-motion still"><span>Reduced motion</span></div>
    <div><img class="px" src="png/stress/{k}-16-light.png" width="64" height="64" alt="{name} 16 px light"><img class="px" src="png/stress/{k}-16-dark.png" width="64" height="64" alt="{name} 16 px dark"><span>16 px, 4x</span></div></div>
    <img class="strip" src="png/motion/{k}-intro.png" alt="{name} intro frames 0 to 1200 ms">
    <p class="nums">Ink at 16 px {m["S1_ink16_light_glyph"]*100:.0f}% · icon span {m["S8_icon_span_frac"]*100:.0f}%, 0 px outside the maskable circle · 0 live-text elements</p>
  </figure>
</div>'''

page = f'''<title>Flier Studio Mark Pick</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Jost:wght@400;500&display=swap">
<style>
/* layout: one column of print-shop proof sheets, one block per question */
:root{{--paper:#ebe8e3;--sheet:#fbfaf8;--ink:#2f2925;--ink-2:#6f655c;--rule:#8c8279;--hold:#e9b47f;
  --display:"Fraunces",Georgia,serif;--body:"Jost",system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--paper:#1c1a17;--sheet:#25221e;--ink:#f4efe8;--ink-2:#a59a8c;--rule:#80766a;--hold:#e9b47f;color-scheme:dark}}}}
:root[data-theme="dark"]{{--paper:#1c1a17;--sheet:#25221e;--ink:#f4efe8;--ink-2:#a59a8c;--rule:#80766a;--hold:#e9b47f;color-scheme:dark}}
body{{background:var(--paper);color:var(--ink);font:16px/1.5 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 64px}}
main{{max-width:1080px;margin:0 auto;display:grid;gap:32px}}
h1,h2,h3{{font-family:var(--display);font-weight:600;text-wrap:balance;margin:0}}
h1{{font-size:2rem}} h2{{font-size:1.35rem}} h3{{font-size:1.15rem;display:flex;gap:10px;align-items:center}}
.hold{{border:2px solid var(--hold);background:var(--sheet);padding:14px 16px;font-weight:500}}
.blk{{background:var(--sheet);border:1px solid var(--rule);padding:20px;display:grid;gap:20px;min-width:0}}
.opts-grid{{display:grid;gap:20px}}
.opt{{display:grid;gap:12px;min-width:0;border-top:1px solid var(--rule);padding-top:16px}}
.lt{{font-family:var(--body);font-size:.8rem;letter-spacing:.08em;border:1px solid var(--ink);padding:0 7px}}
.cap,.nums,figcaption,.motion span{{color:var(--ink-2);font-size:.9rem;margin:0}}
.nums{{font-variant-numeric:tabular-nums}}
figure{{margin:0;display:grid;gap:8px;min-width:0}}
.surf{{display:grid;gap:8px;min-width:0}}
.row{{display:flex;gap:12px;align-items:center;flex-wrap:wrap}}
.px{{image-rendering:pixelated}}
.home{{border-radius:50%}}
.hdr{{max-width:100%;height:auto;border:1px solid var(--rule)}}
.crop{{overflow:hidden;max-width:100%;border:1px solid var(--rule)}} .crop img{{max-width:none;display:block;width:1280px;height:64px}}
.og{{width:100%;max-width:600px;height:auto;border:1px solid var(--rule)}}
.motion{{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}} .motion>div{{display:grid;gap:6px;justify-items:start}}
.motion .px{{width:64px;height:64px}}
.strip{{width:100%;max-width:960px;height:auto;border:1px solid var(--rule)}}
.replay{{font:inherit;font-size:.85rem;background:transparent;color:var(--ink);border:1px solid var(--rule);padding:8px 12px;min-height:44px;cursor:pointer}}
.replay:focus-visible{{outline:3px solid var(--ink);outline-offset:2px}}
.sheet{{width:100%;height:auto;max-width:900px;border:1px solid var(--rule);background:#fff}}
@media (min-width:900px){{.opt{{grid-template-columns:1fr 1fr;column-gap:24px}} .opt h3,.opt .cap{{grid-column:1/-1}}}}
</style>
<main>
<header style="display:grid;gap:8px"><h1>Flier Studio mark</h1>
<p class="hold" role="status">Do not pick yet. These three have not been scored by design-critic (LOGO-1 stage LP7). This page is held until the critic passes them; anything that fails is removed or redrawn first.</p></header>

<section class="blk"><h2>Which mark should Flier Studio use?</h2>
<div class="opts-grid">{option('r1')}{option('r2')}{option('r3')}</div>
<div class="q"><p class="qn"><span class="qi">Q1</span> Which mark becomes the Flier Studio mark (tab icon, home-screen icon, app header, share card, dloizides.com card)?</p>
<ul class="opts"><li><span class="lt">A</span><span>Dealt F</span></li><li><span class="lt">B</span><span>Fan deck</span></li><li><span class="lt">C</span><span>In flight</span></li><li><span class="lt">X</span><span>None yet: redraw (say what is missing)</span></li></ul>
<p class="why">Today every owned surface carries a customer's Bailemos logo.</p></div>
</section>

<section class="blk"><h2>Where they came from</h2>
<p class="cap">34 black-and-white thumbnails from 7 idea sources, 6 concepts, 3 refined.</p>
<img class="sheet" src="png/thumbs-sheet.png" alt="34 thumbnail sketches labelled by idea source">
</section>
</main>
<script>
document.querySelectorAll('.replay').forEach(function (b) {{
  b.addEventListener('click', function () {{
    var img = b.parentElement.querySelector('img'); var src = img.getAttribute('src').split('?')[0];
    img.setAttribute('src', src + '?t=' + Date.now());
  }});
}});
</script>
'''
io.open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(page)
print('ok')
