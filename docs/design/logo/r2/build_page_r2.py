# -*- coding: utf-8 -*-
"""Writes r2/index.html: LOGO-1 run 1 round 2 pick page (held, "Do not pick yet") for C "In flight" variants.
Each variant plays its intro + micro live from motion/<key>.motion.json through a small WAAPI shim."""
import io, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'stress.json')))
C = {
    'c2a': ('A', 'Peel', 'The corner is turned back over the face of the sheet, its edge rolled: a flier just pulled off the press.'),
    'c2b': ('B', 'Lift', 'The corner lifts off the page and curls back into the air: the sheet is on its way somewhere.'),
    'c2c': ('C', 'Pair', 'Lift with a second sheet of the set fanned out behind it: one form, a set of fliers.'),
}
TL = {k: json.load(io.open(os.path.join(HERE, 'motion', f'{k}.motion.json'), encoding='utf-8')) for k in C}
LAYERS = {k: io.open(os.path.join(HERE, 'motion', f'{k}.layers.svg'), encoding='utf-8').read()
          .replace('<svg ', f'<svg tabindex="0" role="img" aria-label="{C[k][1]} mark, animated" data-logo="{k}" ', 1) for k in C}


def surf(pre, alt):
    return f'''<div class="surf">
  <div class="row"><img class="px" src="{pre}-tab.png" width="220" height="40" alt="{alt} browser tab, favicon at 16 px"><img class="home" src="{pre}-home.png" width="64" height="64" alt="{alt} home-screen icon"></div>
  <img class="hdr" src="{pre}-header360.png" width="360" height="56" alt="{alt} app header at 360">
  <div class="crop"><img src="{pre}-header1280.png" width="1280" height="64" alt="{alt} app header at 1280"></div>
  <img class="og" src="{pre}-og.png" width="1200" height="630" alt="{alt} share card 1200x630">
</div>'''


def option(k):
    L, name, why = C[k]; m = S[k]; t = TL[k]
    return f'''<div class="opt" data-option="MARK-C2{L.lower()}" data-inventory="5/5" data-aligned="pass">
  <h3><span class="lt">{L}</span> C2{L.lower()} {name}</h3>
  <p class="cap">{why}</p>
  <figure data-visual="before"><figcaption>Round 1 C "In flight" (critic REDO: corner read as a broken-off wedge, intro only faded)</figcaption>
    <div class="motion"><div><img src="r1/motion/r3-intro.svg" width="144" height="144" alt="Round 1 In flight intro" class="r1i"><button type="button" class="act r1r">Replay round 1 intro</button></div>
    <div><img class="px" src="r1/stress/r3-16-light.png" width="64" height="64" alt="Round 1 In flight 16 px"><span>16 px, 4x</span></div></div>
    {surf('r1/surf/r3', 'Round 1 In flight')}
  </figure>
  <figure data-visual="after"><figcaption>{name}: plays live (hover or focus the mark for the micro)</figcaption>
    <div class="motion">
      <div><div class="stage" data-key="{k}">{LAYERS[k]}</div>
        <span class="btns"><button type="button" class="act" data-play="intro" data-key="{k}">Replay intro</button><button type="button" class="act" data-play="micro" data-key="{k}">Play micro</button></span></div>
      <div><img src="png/refined/{k}.png" width="144" height="144" alt="{name} reduced-motion still"><span>Reduced-motion still</span></div>
      <div><img class="px" src="png/stress/{k}-16-light.png" width="64" height="64" alt="{name} 16 px light"><img class="px" src="png/stress/{k}-16-dark.png" width="64" height="64" alt="{name} 16 px dark"><span>16 px, 4x</span></div>
    </div>
    {surf(f'png/surf/{k}', name)}
    <p class="nums">Intro {t["introEndsMs"]} ms · micro 280 ms · ink at 16 px {m["S1_ink16_light_glyph"]*100:.0f}% · icon span {m["S8_icon_span_frac"]*100:.0f}%, 0 px outside the maskable circle · corner {m["corner_frac_of_sheet_height_16px"]*100:.0f}% of the sheet height · 0 live-text elements</p>
    <details><summary>Construction, lineup, stock check</summary>
      <img class="sheet" src="png/construction-{k}.png" alt="{name} construction grid">
      <img class="px lin" src="png/stress/{k}-lineup32.png" alt="{name} at 32 px beside four competitor stand-ins">
      <img class="px lin" src="png/stress/{k}-stock24.png" alt="{name} at 24 px beside three stock icons"></details>
  </figure>
</div>'''


PKG = os.path.normpath(os.path.join(HERE, *(['..'] * 6), 'NpmPackages', 'packages'))
DM = json.dumps(json.loads(io.open(os.path.join(HERE, 'motion', 'default-motion.json'), encoding='utf-8').read()))
MODULE = ('/* @dloizides/ui-motion@1.3.0 dist/logo/index.mjs, inlined; its one import (design-tokens DEFAULT_MOTION) inlined below */\n'
          + io.open(os.path.join(PKG, 'ui-motion', 'dist', 'logo', 'index.mjs'), encoding='utf-8').read()
          .replace("import { DEFAULT_MOTION } from '@dloizides/design-tokens';", 'const DEFAULT_MOTION = ' + DM + ';')
          .replace('\nexport {', '\nconst __logo = {'))
GLUE = """var TIMELINES = """ + json.dumps({k: {'intro': TL[k]['intro'], 'micro': TL[k]['micro']} for k in C}) + """;
var rm = document.getElementById('rm');
function reduced() { return rm.checked || window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function svgOf(k) { return document.querySelector('svg[data-logo="' + k + '"]'); }
var live = {}, unbind = [];
function play(k, kind) { if (live[k]) live[k].cancel(); live[k] = playLogo(svgOf(k), TIMELINES[k][kind], { reducedMotion: reduced() }); }
function bindAll() {
  unbind.forEach(function (u) { u(); }); unbind = [];
  Object.keys(TIMELINES).forEach(function (k) {
    ['hover', 'focus'].forEach(function (t) { unbind.push(bindMicro(svgOf(k), TIMELINES[k].micro, t, { reducedMotion: reduced() })); });
  });
}
document.querySelectorAll('[data-play]').forEach(function (b) { b.addEventListener('click', function () { play(b.dataset.key, b.dataset.play); }); });
rm.addEventListener('change', function () { Object.keys(live).forEach(function (k) { live[k].cancel(); }); bindAll(); });
bindAll();
var ob = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { play(e.target.dataset.key, 'intro'); ob.unobserve(e.target); } });
}, { threshold: 0.6 });
document.querySelectorAll('.stage').forEach(function (s) { ob.observe(s); });
document.querySelectorAll('.r1r').forEach(function (b) {
  b.addEventListener('click', function () { var img = b.parentElement.querySelector('img'); img.src = img.src.split('?')[0] + '?t=' + Date.now(); });
});"""

page = f'''<title>Flier Studio Mark Round 2</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Jost:wght@400;500&display=swap">
<style>
:root{{--paper:#ebe8e3;--sheet:#fbfaf8;--ink:#2f2925;--ink-2:#6f655c;--rule:#8c8279;--hold:#e9b47f;--mark:#4a423c;
  --display:"Fraunces",Georgia,serif;--body:"Jost",system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--paper:#1c1a17;--sheet:#25221e;--ink:#f4efe8;--ink-2:#a59a8c;--rule:#80766a;--mark:#e8dccb;color-scheme:dark}}}}
:root[data-theme="dark"]{{--paper:#1c1a17;--sheet:#25221e;--ink:#f4efe8;--ink-2:#a59a8c;--rule:#80766a;--mark:#e8dccb;color-scheme:dark}}
body{{background:var(--paper);color:var(--ink);font:16px/1.5 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 64px}}
main{{max-width:1080px;margin:0 auto;display:grid;gap:32px}}
h1,h2,h3{{font-family:var(--display);font-weight:600;text-wrap:balance;margin:0}}
h1{{font-size:2rem}} h2{{font-size:1.35rem}} h3{{font-size:1.15rem;display:flex;gap:10px;align-items:center}}
.hold{{border:2px solid var(--hold);background:var(--sheet);padding:14px 16px;font-weight:500;margin:0}}
.blk{{background:var(--sheet);border:1px solid var(--rule);padding:20px;display:grid;gap:20px;min-width:0}}
.opt{{display:grid;gap:12px;min-width:0;border-top:1px solid var(--rule);padding-top:16px}}
.lt{{font-family:var(--body);font-size:.8rem;letter-spacing:.08em;border:1px solid var(--ink);padding:0 7px}}
.cap,.nums,figcaption,.motion span,summary,label{{color:var(--ink-2);font-size:.9rem;margin:0}}
.nums{{font-variant-numeric:tabular-nums}}
figure{{margin:0;display:grid;gap:10px;min-width:0;align-content:start}}
.surf{{display:grid;gap:8px;min-width:0}} .row{{display:flex;gap:12px;align-items:center;flex-wrap:wrap}}
.px{{image-rendering:pixelated}} .home{{border-radius:50%}}
.hdr{{max-width:100%;height:auto;border:1px solid var(--rule)}}
.crop{{overflow:hidden;max-width:100%;border:1px solid var(--rule)}} .crop img{{max-width:none;display:block;width:1280px;height:64px}}
.og{{width:100%;max-width:600px;height:auto;border:1px solid var(--rule)}}
.motion{{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}} .motion>div{{display:grid;gap:6px;justify-items:start}}
.motion .px{{width:64px;height:64px}}
.stage{{width:144px;height:144px;color:var(--mark);--mark-bg:var(--sheet);background:var(--sheet);border:1px dashed var(--rule)}}
.stage svg{{width:144px;height:144px;display:block;overflow:visible}}
.stage svg:focus-visible,.act:focus-visible,input:focus-visible{{outline:3px solid var(--ink);outline-offset:2px}}
.btns{{display:flex;gap:8px;flex-wrap:wrap}}
.act{{font:inherit;font-size:.85rem;background:transparent;color:var(--ink);border:1px solid var(--rule);padding:8px 12px;min-height:44px;cursor:pointer}}
.sheet{{width:100%;height:auto;max-width:640px;border:1px solid var(--rule);background:#fff;display:block;margin-top:8px}}
.lin{{display:block;margin-top:8px;width:min(100%,432px);height:auto;background:#fff}}
.rm{{display:flex;gap:10px;align-items:center;min-height:44px}} .rm input{{width:22px;height:22px}}
@media (min-width:900px){{.opt{{grid-template-columns:1fr 1fr;column-gap:24px}} .opt h3,.opt .cap{{grid-column:1/-1}}}}
</style>
<main>
<header style="display:grid;gap:10px"><h1>Flier Studio mark, round 2</h1>
<p class="hold" role="status">Do not pick yet. Three redraws of C "In flight" (owner decision D2). design-critic scores them next (LOGO-1 stage LP7); this page stays held until one passes. If none passes, the kill rule applies: a human identity designer gets the brief.</p>
<label class="rm"><input type="checkbox" id="rm"> Preview with reduced motion (shows the still, plays nothing)</label></header>

<section class="blk"><h2>Which C variant should Flier Studio use?</h2>
<div style="display:grid;gap:20px">{''.join(option(k) for k in C)}</div>
<div class="q"><p class="qn"><span class="qi">Q1</span> Which variant becomes the Flier Studio mark (tab icon, home-screen icon, app header, share card, dloizides.com card)?</p>
<ul class="opts"><li><span class="lt">A</span><span>C2a Peel</span></li><li><span class="lt">B</span><span>C2b Lift</span></li><li><span class="lt">C</span><span>C2c Pair</span></li><li><span class="lt">X</span><span>None: apply the kill rule and brief a human identity designer</span></li></ul>
<p class="why">Round 1: all three marks REDO (LP7, 2026-10-28); C was the only idea not borrowed.</p></div>
</section>
</main>
<script type="module">
{MODULE}
{GLUE}
</script>
'''
page = page.replace('{MODULE}', MODULE).replace('{GLUE}', GLUE)
io.open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(page)
print('ok')
