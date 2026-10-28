# -*- coding: utf-8 -*-
"""LOGO-1 LP9: writes brand-sheet.html from exports/ (inlined SVG) + measure.json."""
import io, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); EX = os.path.join(HERE, 'exports')
M = json.load(io.open(os.path.join(HERE, 'measure.json')))
def svg(n): return io.open(os.path.join(EX, n), encoding='utf-8').read()
def strip(s): return s.split('>', 1)[1].rsplit('</svg>', 1)[0]
MARK = strip(svg('mark.svg'))
INTRO = strip(svg('mark-animated.svg')).replace('[data-motion-layer=', '#intro [data-motion-layer=')
import sys; sys.path.insert(0, os.path.dirname(HERE)); import gen
NOTES = ''.join(f'<li>{n}</li>' for n in gen.NOTES['r3'])
def tile(inner, label, bg='var(--surface)', vb='0 0 64 64', extra=''):
    return (f'<figure class="dont"><div class="dt" style="background:{bg}"><svg viewBox="{vb}" width="96" height="96" aria-hidden="true"{extra}>{inner}</svg></div>'
            f'<figcaption>{label}</figcaption></figure>')
DONTS = ''.join([
    tile(f'<g transform="translate(-14 0) scale(1.45 1)">{MARK}</g>', 'Stretch or squash'),
    tile(MARK.replace('#4a423c', '#e9b47f'), 'Recolour with the accent (accent never sits in the mark)'),
    tile(MARK.replace('fill="#4a423c"', 'fill="none" stroke="#4a423c" stroke-width="1.6"'), 'Outline it'),
    tile(f'<defs><filter id="ds"><feDropShadow dx="2" dy="3" stdDeviation="1.5" flood-opacity=".5"/></filter></defs><g filter="url(#ds)">{MARK}</g>', 'Add shadows, glows or bevels'),
    tile(f'<g transform="translate(16 0) rotate(-24 32 32)">{MARK}</g>', 'Rotate or rearrange the parts'),
    tile(MARK, 'Primary mark on the dark surface (1.61:1); use brandFill', 'var(--dk-surface-fixed)'),
    tile(MARK, 'Place it on a busy image', 'repeating-linear-gradient(45deg,#c9b9a3 0 6px,#6f655c 6px 12px)'),
])
ROWS = [('primary (light mark)', '#4a423c', 'surface #fbfaf8', M['#4a423c/#fbfaf8']),
        ('text (lockup, light)', '#2f2925', 'surface #fbfaf8', M['#2f2925/#fbfaf8']),
        ('text on page (OG, card)', '#2f2925', 'page #ebe8e3', M['#2f2925/#ebe8e3']),
        ('dark.brandFill (dark mark + lockup)', '#e8dccb', 'dark.background #1c1a17', M['#e8dccb/#1c1a17']),
        ('dark.brandFill on dark.surface', '#e8dccb', 'dark.surface #25221e', M['#e8dccb/#25221e']),
        ('dark.brandFill on primary (app icon)', '#e8dccb', 'primary #4a423c', M['#e8dccb/#4a423c'])]
CROWS = ''.join(f'<tr><td>{r}</td><td><span class="sw" style="background:{h}"></span><code>{h}</code></td><td>{b}</td><td class="num">{c:.2f}:1</td></tr>' for r, h, b, c in ROWS)
EXP = [('favicon.svg', 'vector, small glyph, colour swaps under prefers-color-scheme'), ('favicon.ico', '16 + 32 + 48'),
       ('favicon-16.png / favicon-32.png', f'transparent; ink {M["ink16"]*100:.1f}% / {M["ink32"]*100:.1f}% (band 20-35%)'),
       ('apple-touch-icon.png', '180x180, opaque'), ('icon-192.png / icon-512.png', 'PWA purpose any'),
       ('icon-512-maskable.png', f'PWA maskable, mark spans {M["maskable_span_h"]*100:.0f}% tall, {M["maskable_px_outside_safe"]} px outside the 80% circle'),
       ('og-image.png', '1200x630, stacked lockup + tagline on one left edge'), ('landing-card-1280x800.png', 'dloizides.com app card'),
       ('lockup-header-light.svg / -dark.svg', 'horizontal, outlined, 0 live text'), ('lockup-stacked-light.svg / -dark.svg', 'stacked, outlined'),
       ('mark.svg', 'named layers with data-motion-layer'), ('mark-mono.svg / mark-reversed.svg', 'one colour / reversed'),
       ('mark-animated.svg', 'intro as CSS keyframes, reduced-motion query inside'), ('motion.json', 'intro + micro beats for @dloizides/ui-motion/logo')]
EROWS = ''.join(f'<tr><td><code>{a}</code></td><td>{b}</td></tr>' for a, b in EXP)
HTML = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Flier Studio Brand</title><meta name="description" content="Flier Studio mark In flight: lockups, clear space, sizes, colour, motion and exports.">
<meta name="robots" content="noindex">
<style>
:root{{--page:#ebe8e3;--surface:#fbfaf8;--text:#2f2925;--text2:#6f655c;--border:#8c8279;--divider:#e6e2dc;--mark:#4a423c;--dk-surface-fixed:#25221e;--focus:#4a423c}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--page:#1c1a17;--surface:#25221e;--text:#f4efe8;--text2:#a59a8c;--border:#80766a;--divider:#3a352f;--mark:#e8dccb;--focus:#e8dccb}}}}
:root[data-theme="dark"]{{--page:#1c1a17;--surface:#25221e;--text:#f4efe8;--text2:#a59a8c;--border:#80766a;--divider:#3a352f;--mark:#e8dccb;--focus:#e8dccb}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--page);color:var(--text);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}}
main{{max-width:1040px;margin:0 auto;padding:32px 16px 64px}}h1{{font-size:28px;margin:0 0 4px;letter-spacing:-.01em}}h2{{font-size:19px;margin:40px 0 12px;padding-top:16px;border-top:1px solid var(--divider)}}
p.lede{{color:var(--text2);margin:0 0 24px;max-width:65ch}}.grid{{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}}
.card{{background:var(--surface);border:1px solid var(--divider);border-radius:8px;padding:16px}}.card h3{{font-size:14px;margin:0 0 8px;color:var(--text2);font-weight:600}}
.stage{{display:flex;align-items:center;justify-content:center;min-height:150px;border-radius:6px}}.light{{background:#fbfaf8}}.dark{{background:#1c1a17}}.page{{background:#ebe8e3}}
img{{max-width:100%;height:auto;display:block}}table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{text-align:left;padding:8px;border-bottom:1px solid var(--divider);vertical-align:top}}
.num{{font-variant-numeric:tabular-nums;text-align:right}}.sw{{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid var(--border);vertical-align:-2px;margin-right:6px}}
.scroll{{overflow-x:auto}}.dont{{margin:0}}.dt{{display:flex;justify-content:center;align-items:center;height:128px;border-radius:6px;position:relative;border:1px solid var(--divider)}}
.dt::after{{content:"";position:absolute;inset:10px;border-top:2px solid #b3261e;transform:rotate(-12deg) translateY(50%);transform-origin:center;opacity:.8}}
.dont figcaption{{font-size:13px;color:var(--text2);margin-top:6px}}.clear{{position:relative;display:inline-block;padding:20%;outline:1px dashed var(--border)}}
button{{font:inherit;min-height:44px;padding:8px 16px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer}}
button:focus-visible,.micro:focus-visible{{outline:3px solid var(--focus);outline-offset:3px}}
.micro{{display:inline-flex;border-radius:8px}}.micro:hover [data-motion-layer=curl],.micro:focus-visible [data-motion-layer=curl]{{animation:mc 280ms cubic-bezier(.2,0,0,1)}}
.micro:hover [data-motion-layer=sheet],.micro:focus-visible [data-motion-layer=sheet]{{animation:ms 280ms cubic-bezier(.2,0,0,1)}}
@keyframes mc{{50%{{transform:rotate(-10deg)}}}}@keyframes ms{{50%{{transform:translateY(-1.5px)}}}}@media (prefers-reduced-motion:reduce){{*{{animation:none!important}}}}
.px{{image-rendering:pixelated}}code{{font-size:13px}}
</style></head><body><main>
<h1>Flier Studio brand</h1>
<p class="lede">Mark R3 "In flight": a sheet leaving the press, its corner curling as it lifts. Picked by the owner on 2026-10-28 (LOGO-1 decision D5). Two parts, one colour, no live type.</p>

<h2>1. Mark and lockups</h2>
<div class="grid">
<div class="card"><h3>Mark</h3><div class="stage light"><img src="exports/mark.svg" width="128" height="128" alt="Flier Studio mark"></div></div>
<div class="card"><h3>Reversed, on primary</h3><div class="stage dark"><img src="exports/mark-reversed.svg" width="128" height="128" alt="Mark reversed on primary"></div></div>
<div class="card"><h3>Horizontal lockup, light</h3><div class="stage light"><img src="exports/lockup-header-light.svg" width="223" alt="Horizontal lockup light"></div></div>
<div class="card"><h3>Horizontal lockup, dark</h3><div class="stage dark"><img src="exports/lockup-header-dark.svg" width="223" alt="Horizontal lockup dark"></div></div>
<div class="card"><h3>Stacked lockup, light</h3><div class="stage light"><img src="exports/lockup-stacked-light.svg" width="150" alt="Stacked lockup light"></div></div>
<div class="card"><h3>Stacked lockup, dark</h3><div class="stage dark"><img src="exports/lockup-stacked-dark.svg" width="150" alt="Stacked lockup dark"></div></div>
<div class="card"><h3>Small glyph, 16 and 32 px at 1x</h3><div class="stage light" style="gap:16px"><img class="px" src="exports/favicon-16.png" width="16" height="16" alt="16 px"><img class="px" src="exports/favicon-32.png" width="32" height="32" alt="32 px"><img class="px" src="exports/favicon-16.png" width="96" height="96" alt="16 px enlarged"></div></div>
<div class="card"><h3>One colour</h3><div class="stage light"><img src="exports/mark-mono.svg" width="96" height="96" alt="One colour mark"></div></div>
</div>
<p>Lockup rules: the wordmark (Fraunces, "Flier" 560 / "Studio" 380, outlined to paths) sits on the mark's bottom edge in the horizontal lockup and on the mark's left edge in the stacked one. The mark leads; the type never sets in a heavier weight than the mark's ink.</p>

<h2>2. Construction</h2>
<div class="card scroll"><img src="../svg/construction-r3.svg" alt="R3 construction on a 64-unit grid" style="min-width:640px"><ul>{NOTES}</ul></div>

<h2>3. Clear space and minimum sizes</h2>
<div class="grid">
<div class="card"><h3>Clear space = 1 c on every side</h3><div class="stage light"><span class="clear"><img src="exports/mark.svg" width="96" height="96" alt=""></span></div>
<p>c = the curl's height = 20% of the mark's height. The same 1 c applies around both lockups.</p></div>
<div class="card scroll"><h3>Minimum sizes</h3><table><tr><th>Use</th><th>Screen</th><th>Print</th></tr>
<tr><td>Mark</td><td class="num">16 px (small glyph at 24 px and below)</td><td class="num">6 mm</td></tr>
<tr><td>Horizontal lockup</td><td class="num">mark 24 px tall</td><td class="num">30 mm wide</td></tr>
<tr><td>Stacked lockup</td><td class="num">mark 64 px tall</td><td class="num">20 mm wide</td></tr></table></div>
</div>

<h2>4. Colour</h2>
<p>Values come from <code>@dloizides/design-tokens</code> preset <code>flier</code> (FLIER_TOKENS). The mark adds no new colour, so no token change.</p>
<div class="card scroll"><table><tr><th>Role</th><th>Token value</th><th>On</th><th class="num">Contrast</th></tr>{CROWS}</table></div>

<h2>5. Do not</h2>
<div class="grid">{DONTS}</div>

<h2>6. Motion</h2>
<div class="grid">
<div class="card"><h3>Intro, once per session (ends 580 ms)</h3><div class="stage light" id="intro"><svg viewBox="0 0 64 64" width="160" height="160" role="img" aria-label="Mark assembling">{INTRO}</svg></div>
<p><button type="button" id="replay">Replay intro</button></p></div>
<div class="card"><h3>Micro, hover / focus / loading (280 ms)</h3><div class="stage light"><span class="micro" tabindex="0" aria-label="Mark, hover or focus to play the micro motion"><svg viewBox="0 0 64 64" width="160" height="160" aria-hidden="true">{MARK}</svg></span></div><p>Hover or tab to it.</p></div>
<div class="card"><h3>Reduced motion</h3><div class="stage light"><img src="exports/mark.svg" width="160" height="160" alt="Static mark"></div><p>No animation; the static mark at once.</p></div>
</div>
<div class="card scroll" style="margin-top:16px"><table><tr><th>Beat</th><th>Layer</th><th>Property</th><th>From → to</th><th>Duration</th><th>Easing</th><th class="num">Start</th></tr>
<tr><td>Intro 1</td><td>sheet</td><td>translate, rotate, opacity</td><td>(-10, 10) px, 12°, 0 → rest</td><td>slow 300</td><td>decelerate</td><td class="num">0</td></tr>
<tr><td>Intro 2</td><td>curl</td><td>rotate, scale, opacity</td><td>28°, 0.6, 0 → rest</td><td>slow 300</td><td>decelerate</td><td class="num">280</td></tr>
<tr><td>Micro</td><td>curl / sheet</td><td>rotate / translateY</td><td>-10° / -1.5 px and back</td><td>280 (2 x fast)</td><td>standard</td><td class="num">0</td></tr></table>
<p>No overshoot (visual-foundation R10). Beats as data: <code>exports/motion.json</code>, played by <code>@dloizides/ui-motion/logo</code> <code>playLogo</code> and <code>bindMicro</code> on <code>exports/mark.svg</code>.</p></div>

<h2>7. Export files</h2>
<div class="card scroll"><table><tr><th>File</th><th>What</th></tr>{EROWS}</table>
<p>Each PNG was rendered at its real size and checked at 1x. Manifest and <code>&lt;link rel="icon"&gt;</code> wiring is frontend-dev's change.</p></div>
</main>
<script>document.getElementById('replay').addEventListener('click',function(){{var s=document.getElementById('intro');s.innerHTML=s.innerHTML;}});</script>
</body></html>'''
io.open(os.path.join(HERE, 'brand-sheet.html'), 'w', encoding='utf-8').write(HTML)
print('ok', len(HTML))
