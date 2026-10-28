# -*- coding: utf-8 -*-
"""Writes all/index.html + result.json: LOGO-1 D3 gallery of all nine Flier Studio marks with one in-page pick."""
import base64, io, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.dirname(HERE)
DESIGN = os.path.dirname(LOGO)
F2 = os.path.join(DESIGN, 'FLIER-2-brand-marks')
R2 = os.path.join(LOGO, 'r2')
PKG = os.path.normpath(os.path.join(DESIGN, *(['..'] * 4), 'NpmPackages', 'packages'))
INK_L, INK_D, SHEET_D = '#2f2925', '#f4efe8', '#25221e'


def rd(p, mode='r'):
    return io.open(p, 'rb').read() if mode == 'b' else io.open(p, encoding='utf-8').read()


def uri(p):
    kind = 'image/svg+xml' if p.endswith('.svg') else 'image/png'
    return f'data:{kind};base64,' + base64.b64encode(rd(p, 'b')).decode('ascii')


def svg_uri(s):
    return 'data:image/svg+xml;base64,' + base64.b64encode(s.encode('utf-8')).decode('ascii')


def f2_lockup(k):
    s = rd(os.path.join(F2, 'svg', f'{k}-header360.svg'))
    s = s.replace('<rect width="360" height="56" fill="#fbfaf8"/>', '').replace('<rect y="55" width="360" height="1" fill="#8c8279"/>', '')
    nums = [float(n) for d in re.findall(r' d="([^"]+)"', s) for n in re.findall(r'-?\d+(?:\.\d+)?', d)]
    w = max(n for n in nums if n < 360) + 4 - 6
    return re.sub(r'width="360" height="56" viewBox="0 0 360 56"', f'width="{w:.0f}" height="32" viewBox="6 12 {w:.1f} 32"', s, count=1)


def lockups(raw):
    return svg_uri(raw), svg_uri(raw.replace(INK_L, INK_D).replace('#fbfaf8', SHEET_D))


def still_layers(path, name):
    s = rd(path)
    s = re.sub(r'<g id="mark-([a-z0-9-]+)"', r'<g id="mark-\1" data-motion-layer="\1"', s)
    return s.replace('<svg ', f'<svg tabindex="0" role="img" aria-label="{name} mark, animated; hover or focus for the micro" ', 1)


def fade(fr, to, dur, delay):
    return {'layer': None, 'keyframes': [dict(fr, opacity=0), dict(to, opacity=1)], 'duration': dur, 'easing': 'decelerate', 'delay': delay}


def wobble(layer, mid):
    return {'layer': layer, 'keyframes': [{'transform': mid[0]}, {'transform': mid[1]}, {'transform': mid[0]}], 'duration': 280, 'easing': 'standard', 'delay': 0}


def beat(layer, b):
    b = dict(b); b['layer'] = layer; return b


R1_TL = {
    'r1': {'intro': [beat('stem', fade({'transform': 'translateY(10px)'}, {'transform': 'translateY(0px)'}, 'slow', 0)),
                     beat('arm-top', fade({'transform': 'translateX(-12px) rotate(-14deg)'}, {'transform': 'translateX(0px) rotate(0deg)'}, 'slow', 280)),
                     beat('arm-mid', fade({'transform': 'translateX(-10px) rotate(-10deg)'}, {'transform': 'translateX(0px) rotate(0deg)'}, 'base', 560))],
           'micro': [wobble('arm-top', ('rotate(0deg)', 'rotate(-5deg)')), wobble('arm-mid', ('rotate(0deg)', 'rotate(-4deg)'))]},
    'r2': {'intro': [{'layer': 'strip-1', 'keyframes': [{'opacity': 0}, {'opacity': 1}], 'duration': 'base', 'easing': 'decelerate', 'delay': 0}]
                    + [{'layer': f'strip-{i}', 'keyframes': [{'transform': f'rotate({a}deg)'}, {'transform': 'rotate(0deg)'}], 'duration': 'slow', 'easing': 'decelerate', 'delay': d}
                       for i, a, d in ((2, -18, 0), (3, -36, 140), (4, -54, 280))],
           'micro': [wobble(f'strip-{i}', ('rotate(0deg)', f'rotate({a}deg)')) for i, a in ((2, -4), (3, -8), (4, -12))]},
    'r3': {'intro': [beat('sheet', fade({'transform': 'translate(-10px, 10px) rotate(12deg)'}, {'transform': 'translate(0px, 0px) rotate(0deg)'}, 'slow', 0)),
                     beat('curl', fade({'transform': 'rotate(28deg) scale(0.6)'}, {'transform': 'rotate(0deg) scale(1)'}, 'slow', 280))],
           'micro': [wobble('curl', ('rotate(0deg)', 'rotate(-10deg)')), wobble('sheet', ('translateY(0px)', 'translateY(-1.5px)'))]},
}

# letter, key, name, source line, verdict, mean, reason
MARKS = [
    ('A', 'f2a', 'Trim', 'FLIER-2 page 3, mark A (critic round 2)', 'REDO', '3.9', 'Reads as a generic crop-tool frame; the 16 px ticks are 1 px and the 512 mark fills only about 40% of the tile.'),
    ('B', 'f2b', 'Crop F', 'FLIER-2 page 3, mark B (critic round 2)', 'PASS', '4.3', 'Strongest silhouette at every size, 2 px strokes hold at 16 px; an F monogram is still a common shape.'),
    ('C', 'f2c', 'Register', 'FLIER-2 page 3, mark C (critic round 2)', 'REDO', '3.5', 'Ring and cross merge into a blob at 16 and 32 px; the paper bite plus the target is two ideas in one mark.'),
    ('D', 'r1', 'Dealt F', 'LOGO-1 round 1, R1', 'REDO', '3.2', 'Too close to the Flipboard F at a glance (distinctiveness 2).'),
    ('E', 'r2', 'Fan deck', 'LOGO-1 round 1, R2', 'REDO', '3.4', 'Reads as the stock swatch-book icon (distinctiveness 2); its fan-open motion scored 5, the best of all nine.'),
    ('F', 'r3', 'In flight', 'LOGO-1 round 1, R3', 'REDO', '3.0', 'The curl reads as a broken-off wedge or a "J."; the intro only fades in.'),
    ('G', 'c2a', 'Peel', 'LOGO-1 round 2, C2a', 'REDO', '3.3', 'At 24 px it is the stock folded-corner file icon; the curl gap is 1.1 px; intro overshoots.'),
    ('H', 'c2b', 'Lift', 'LOGO-1 round 2, C2b', 'REDO', '3.1', '36% ink at 16 px; the curl is larger than its cut, so the back reads as a broken corner; intro overshoots.'),
    ('I', 'c2c', 'Pair', 'LOGO-1 round 2, C2c', 'REDO', '3.1', 'The only idea that is the product (a set of fliers), but the back sheet smears to 1-2 px; intro overshoots.'),
]
ITEMS = ['icon-512', 'favicon-32', 'favicon-16', 'header-light', 'header-dark', 'motion']


def assets(key, name):
    if key.startswith('f2'):
        k = key[-1].upper()
        return dict(icon=uri(os.path.join(F2, 'svg', f'{k}-pwa512.svg')), p32=uri(os.path.join(F2, 'png', f'{k}-fav32.png')),
                    p16=uri(os.path.join(F2, 'png', f'{k}-fav16.png')), lock=lockups(f2_lockup(k)), lh=36, motion=None)
    base = LOGO if key.startswith('r') else R2
    tl = R1_TL[key] if key.startswith('r') else {x: json.loads(rd(os.path.join(R2, 'motion', f'{key}.motion.json')))[x] for x in ('intro', 'micro')}
    layers = (still_layers(os.path.join(LOGO, 'svg', 'motion', f'{key}-still.svg'), name) if key.startswith('r') else
              rd(os.path.join(R2, 'motion', f'{key}.layers.svg')).replace('<svg ', f'<svg tabindex="0" role="img" aria-label="{name} mark, animated; hover or focus for the micro" ', 1))
    layers = layers.replace('<svg ', f'<svg data-logo="{key}" ', 1)
    return dict(icon=uri(os.path.join(base, 'svg', 'surf', f'{key}-icon512.svg')), p32=uri(os.path.join(base, 'png', 'stress', f'{key}-32-light.png')),
                p16=uri(os.path.join(base, 'png', 'stress', f'{key}-16-light.png')), lock=lockups(rd(os.path.join(base, 'svg', 'refined', f'{key}-lockup-h.svg'))),
                lh=28, motion=(layers, tl))


BEFORE = uri(os.path.join(LOGO, 'png', 'surf', 'before-home.png'))
TIMELINES = {}


def card(m):
    L, key, name, src, verdict, mean, why = m
    a = assets(key, name)
    if a['motion']:
        TIMELINES[key] = a['motion'][1]
        mo = f'''<div class="mo"><div class="stage" data-key="{key}">{a['motion'][0]}</div>
      <span class="btns"><button type="button" class="act" data-play="intro" data-key="{key}" aria-label="Replay the {name} intro">Replay intro</button><button type="button" class="act" data-play="micro" data-key="{key}" aria-label="Play the {name} micro">Play micro</button></span></div>'''
    else:
        mo = '<p class="none">No motion drawn. FLIER-2 drew this mark as stills only.</p>'
    lo_l, lo_d = a['lock']
    return f'''<article class="card" data-option="MARK-{key.upper()}" data-inventory="6/6" data-aligned="pass" data-result="result.json">
  <header class="ch"><h3><span class="lt">{L}</span> {name}</h3><span class="vd vd-{verdict.lower()}">{verdict} · mean {mean}</span></header>
  <p class="src">{src}</p>
  <p class="why">{why}</p>
  <figure data-visual="before" class="bf"><img src="{BEFORE}" width="40" height="40" alt="Today's Flier Studio icon"><figcaption>Today's icon, for comparison</figcaption></figure>
  <figure data-visual="after" class="af">
    <div class="sizes">
      <div class="sz"><img class="i512" src="{a['icon']}" width="112" height="112" alt="{name} 512 px app icon, shown at 112"><span>512 icon</span></div>
      <div class="sz"><span class="pair"><img class="px" src="{a['p32']}" width="32" height="32" alt="{name} at 32 px, actual size"><img class="px" src="{a['p32']}" width="96" height="96" alt="{name} at 32 px, enlarged 3x"></span><span>32 px, 1x and 3x</span></div>
      <div class="sz"><span class="pair"><img class="px" src="{a['p16']}" width="16" height="16" alt="{name} at 16 px, actual size"><img class="px" src="{a['p16']}" width="64" height="64" alt="{name} at 16 px, enlarged 4x"></span><span>16 px, 1x and 4x</span></div>
    </div>
    <div class="bar bar-l"><img src="{lo_l}" style="height:{a['lh']}px" alt="{name} header lockup on the light header"></div>
    <div class="bar bar-d"><img src="{lo_d}" style="height:{a['lh']}px" alt="{name} header lockup on the dark header"></div>
    {mo}
  </figure>
</article>'''


CARDS = ''.join(card(m) for m in MARKS)
DM = json.dumps(json.loads(rd(os.path.join(R2, 'motion', 'default-motion.json'))))
MODULE = ('/* @dloizides/ui-motion@1.3.0 dist/logo/index.mjs, inlined; its one import (design-tokens DEFAULT_MOTION) inlined below */\n'
          + rd(os.path.join(PKG, 'ui-motion', 'dist', 'logo', 'index.mjs'))
          .replace("import { DEFAULT_MOTION } from '@dloizides/design-tokens';", 'const DEFAULT_MOTION = ' + DM + ';')
          .replace('\nexport {', '\nconst __logo = {'))
GLUE = 'var TIMELINES = ' + json.dumps(TIMELINES) + ''';
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
document.querySelectorAll('.stage').forEach(function (s) { ob.observe(s); });'''

OPTS = ''.join(f'<li><span class="lt">{m[0]}</span><span>{m[2]} ({m[4]} {m[5]})</span></li>' for m in MARKS)
page = f'''<title>Flier Studio Marks</title>
<meta name="description" content="All nine Flier Studio marks drawn so far, with critic scores, live motion and one pick.">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Jost:wght@400;500&display=swap">
<style>
:root{{--paper:#ebe8e3;--sheet:#fbfaf8;--ink:#2f2925;--ink-2:#6f655c;--rule:#8c8279;--pass:#2f2925;
  --tile:#fbfaf8;--tile-ink:#4a423c;--bar-l:#fbfaf8;--bar-d:#25221e;--bar-rule:#8c8279;
  --display:"Fraunces",Georgia,serif;--body:"Jost",system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--paper:#1c1a17;--sheet:#25221e;--ink:#f4efe8;--ink-2:#a59a8c;--rule:#80766a;--pass:#f4efe8;--bar-d:#14120f;color-scheme:dark}}}}
:root[data-theme="dark"]{{--paper:#1c1a17;--sheet:#25221e;--ink:#f4efe8;--ink-2:#a59a8c;--rule:#80766a;--pass:#f4efe8;--bar-d:#14120f;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{background:var(--paper);color:var(--ink);font:16px/1.5 var(--body);margin:0;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:24px 64px}}
main{{max-width:1200px;margin:0 auto;display:grid;gap:28px}}
h1,h2,h3{{font-family:var(--display);font-weight:600;text-wrap:balance;margin:0}}
h1{{font-size:2rem}} h2{{font-size:1.35rem}} h3{{font-size:1.2rem;display:flex;gap:10px;align-items:center}}
.lede{{margin:0;max-width:68ch;color:var(--ink-2)}}
.grid{{display:grid;gap:20px;grid-template-columns:1fr}}
@media (min-width:760px){{.grid{{grid-template-columns:1fr 1fr}}}}
@media (min-width:1120px){{.grid{{grid-template-columns:repeat(3,1fr)}}}}
.card{{background:var(--sheet);border:1px solid var(--rule);padding:16px;display:grid;gap:10px;min-width:0;align-content:start}}
.ch{{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}}
.lt{{font-family:var(--body);font-size:.8rem;letter-spacing:.08em;border:1px solid var(--ink);padding:0 7px}}
.vd{{font-size:.85rem;font-variant-numeric:tabular-nums;padding:2px 8px;border:1px solid var(--rule);color:var(--ink-2);white-space:nowrap}}
.vd-pass{{border:2px solid var(--pass);color:var(--ink);font-weight:500}}
.src,.why,figcaption,.sz>span:last-child,.none,label{{margin:0;font-size:.9rem;color:var(--ink-2)}}
.why{{color:var(--ink)}}
figure{{margin:0;min-width:0}}
.bf{{display:flex;gap:10px;align-items:center}} .bf img{{border:1px solid var(--rule)}}
.af{{display:grid;gap:10px}}
.sizes{{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end}}
.sz{{display:grid;gap:4px;justify-items:start}} .pair{{display:flex;gap:8px;align-items:flex-end}}
.i512{{border:1px solid var(--rule)}} .px{{image-rendering:pixelated}}
.bar{{height:56px;display:flex;align-items:center;padding:0 12px;border-bottom:1px solid var(--bar-rule);overflow:hidden}}
.bar img{{max-width:100%;width:auto;display:block}}
.bar-l{{background:var(--bar-l)}} .bar-d{{background:var(--bar-d)}}
.mo{{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}}
.stage{{width:112px;height:112px;color:var(--tile-ink);--mark-bg:var(--tile);background:var(--tile);border:1px dashed var(--rule)}}
.stage svg{{width:112px;height:112px;display:block;overflow:visible}}
.stage svg:focus-visible,.act:focus-visible,input:focus-visible{{outline:3px solid var(--ink);outline-offset:2px}}
.btns{{display:flex;gap:8px;flex-wrap:wrap}}
.act{{font:inherit;font-size:.85rem;background:transparent;color:var(--ink);border:1px solid var(--rule);padding:8px 12px;min-height:44px;cursor:pointer}}
.none{{border:1px dashed var(--rule);padding:10px 12px}}
.rm{{display:flex;gap:10px;align-items:center;min-height:44px}} .rm input{{width:22px;height:22px}}
.blk{{background:var(--sheet);border:1px solid var(--rule);padding:20px;display:grid;gap:12px}}
</style>
<main>
<header style="display:grid;gap:10px"><h1>Flier Studio mark: all nine</h1>
<p class="lede">Every mark drawn across FLIER-2 and LOGO-1, with the critic's last verdict. The bar is a mean of 4 with no criterion under 3; only B Crop F reached it. The kill rule fired after two rounds; you pick (owner decision D3).</p>
<label class="rm"><input type="checkbox" id="rm"> Preview with reduced motion (shows the still, plays nothing)</label></header>
<section class="grid">{CARDS}</section>
<section class="blk"><h2>Your pick</h2>
<div class="q"><p class="qn"><span class="qi">Q1</span> Which mark becomes the Flier Studio mark (tab icon, home-screen icon, app header, share card, dloizides.com card)?</p>
<ul class="opts">{OPTS}<li><span class="lt">X</span><span>None: hire a human identity designer with the handoff brief</span></li></ul>
<p class="why">Scores from design-critic LP7 and FLIER-2 round 2, 2026-10-28. A pick below the bar goes to brand-sheet polish (LP8) with the critic's fixes.</p></div>
</section>
</main>
<script type="module">
{MODULE}
{GLUE}
</script>
'''
io.open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(page)

pair = {'route': 'docs/design/logo/all', 'state': 'static gallery card', 'fixture': 'flier-studio brand marks 2026-10-28',
        'viewport': '1280x800', 'scrollAnchor': 'card', 'crop': 'card'}
res = {'task': 'LOGO-1 "A logo pipeline that makes beautiful, animatable marks" D3 all-marks gallery',
       'pairMethod': 'same-steps', 'countMethod': 'visible-in-frame', 'rowsMethod': 'auto',
       'note': 'noloss: allow new screen -- brand marks are new assets; no form rows on the page (0 side-by-side rows found)',
       'options': {}, 'frames': []}
for m in MARKS:
    oid = f'MARK-{m[1].upper()}'
    res['options'][oid] = {'inventory': '6/6', 'items': {'before': ['icon-512'], 'after': ITEMS}}
    for side in ('before', 'after'):
        res['frames'].append({'option': oid, 'shot': 'card', 'side': side, 'pair': pair, 'build': ('flier-studio today (0da0f9d)' if side == 'before' else m[3]),
                              'visibleItems': {'before': ['icon-512'], 'after': ITEMS}})
io.open(os.path.join(HERE, 'result.json'), 'w', encoding='utf-8').write(json.dumps(res, indent=1))
print('ok', len(page), sorted(TIMELINES))
