# -*- coding: utf-8 -*-
"""LOGO-1 LP9 for Flier Studio: exports for R3 "In flight" as picked (D5).
Reuses ../gen.py geometry and the outlined Fraunces wordmark. Writes exports/*.svg + jobs.json;
render_brand.cjs renders PNGs; `python gen_brand.py ico` packs favicon.ico and removes scratch SVGs."""
import io, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(HERE))
import gen
from gen import TOK, R, svgdoc, lockup, outlined_ui, FLY, FLY_SMALL
EX = os.path.join(HERE, 'exports'); JOBS = []
TAG = 'Event fliers and wallpapers from one form'


def save(name, doc, w=None, h=None, png=None, **kw):
    os.makedirs(EX, exist_ok=True)
    io.open(os.path.join(EX, name), 'w', encoding='utf-8').write(doc)
    if w: JOBS.append(dict(svg=name, png=png or name.replace('.svg', '.png'), w=w, h=h, **kw))


def mark_layers(color, small=False, attrs=True):
    body, curl = FLY_SMALL if small else FLY
    a = (lambda n: f' data-motion-layer="{n}"') if attrs else (lambda n: '')
    return (f'<g id="mark-sheet"{a("sheet")} style="transform-origin:14px 56px"><path d="{body}" fill="{color}"/></g>'
            f'<g id="mark-curl"{a("curl")} style="transform-origin:40px 48px"><path d="{curl}" fill="{color}"/></g>')


def fit(size, color, small, frac, x=0, y=0):
    x0, y0, x1, y1 = gen.mark_bbox('r3', small)
    s = 0.4 * size * 0.96 / math.hypot((x1 - x0) / 2, (y1 - y0) / 2) if frac == 'circle' else size * frac / max(x1 - x0, y1 - y0)
    ox = x + (size - (x1 - x0) * s) / 2 - x0 * s; oy = y + (size - (y1 - y0) * s) / 2 - y0 * s
    return f'<g transform="translate({ox:.2f} {oy:.2f}) scale({s:.4f})">{mark_layers(color, small, False)}</g>'


INTRO = [
    dict(layer='sheet', keyframes=[{'transform': 'translate(-10px, 10px) rotate(12deg)', 'opacity': 0}, {'transform': 'none', 'opacity': 1}],
         duration='slow', easing='decelerate', delay=0),
    dict(layer='curl', keyframes=[{'transform': 'rotate(28deg) scale(0.6)', 'opacity': 0}, {'transform': 'none', 'opacity': 1}],
         duration='slow', easing='decelerate', delay=280),
]
MICRO = [
    dict(layer='curl', keyframes=[{'transform': 'none'}, {'transform': 'rotate(-10deg)', 'offset': 0.5}, {'transform': 'none'}],
         duration=280, easing='standard', delay=0),
    dict(layer='sheet', keyframes=[{'transform': 'none'}, {'transform': 'translateY(-1.5px)', 'offset': 0.5}, {'transform': 'none'}],
         duration=280, easing='standard', delay=0),
]
CSS_INTRO = ('[data-motion-layer=sheet]{animation:sh 300ms cubic-bezier(0,0,0,1) both}'
             '@keyframes sh{from{transform:translate(-10px,10px) rotate(12deg);opacity:0}}'
             '[data-motion-layer=curl]{animation:cu 300ms cubic-bezier(0,0,0,1) 280ms both}'
             '@keyframes cu{from{transform:rotate(28deg) scale(.6);opacity:0}}'
             '@media (prefers-reduced-motion: reduce){*{animation:none!important}}')


def exports():
    p, bf, surf = TOK['primary'], TOK['brandFill'], TOK['surface']
    fav = (f'<style>path{{fill:{p}}}@media (prefers-color-scheme: dark){{path{{fill:{bf}}}}}</style>'
           + mark_layers(p, True, False).replace(f' fill="{p}"', ''))
    save('favicon.svg', svgdoc(fav, 64, 64, '0 0 64 64'))
    for s in (16, 32, 48):
        save(f'_fav{s}.svg', svgdoc(fit(s, p, s <= 24, 0.86), s, s), s, s, png=f'favicon-{s}.png', transparent=True)
    for name, s, frac in [('icon-192', 192, 0.62), ('icon-512', 512, 0.62), ('icon-512-maskable', 512, 'circle'), ('apple-touch-icon', 180, 0.62)]:
        save(f'_{name}.svg', svgdoc(R(0, 0, s, s, f' fill="{p}"') + fit(s, bf, False, frac), s, s), s, s, png=f'{name}.png')
    for mode, col, bg in [('light', TOK['text'], surf), ('dark', bf, TOK['darkBg'])]:
        inner, w, h, _ = lockup('r3', 48, col)
        W, H = math.ceil(w), h + 2
        save(f'lockup-header-{mode}.svg', svgdoc(inner, W, H), W, H, png=f'_check-header-{mode}.png', bg=bg)
        inner, w, h, _ = lockup('r3', 96, col, 'v')
        save(f'lockup-stacked-{mode}.svg', svgdoc(inner, math.ceil(w), math.ceil(h) + 2))
    save('mark.svg', svgdoc(mark_layers(p), 64, 64, '0 0 64 64'))
    save('mark-mono.svg', svgdoc(mark_layers('#000000', False, False), 64, 64, '0 0 64 64'))
    save('mark-reversed.svg', svgdoc(R(0, 0, 64, 64, f' fill="{p}"') + mark_layers(bf, False, False), 64, 64, '0 0 64 64'))
    save('mark-animated.svg', svgdoc(f'<style>{CSS_INTRO}</style>' + mark_layers(p), 192, 192, '0 0 64 64'))
    json.dump({'mark': 'Flier Studio R3 "In flight"', 'player': '@dloizides/ui-motion/logo playLogo (intro) + bindMicro (micro)',
               'svg': 'mark.svg (groups carry data-motion-layer)',
               'layers': {'sheet': 'mark-sheet, transform-origin 14px 56px (bottom-left corner)',
                          'curl': 'mark-curl, transform-origin 40px 48px (the fold)'},
               'intro': INTRO, 'micro': {'triggers': ['hover', 'focus', 'loading'], 'beats': MICRO},
               'durationsFrom': 'design-tokens DEFAULT_MOTION: fast 140, base 200, slow 300 ms; micro 280 = 2 x fast',
               'reducedMotion': 'no animation; the static mark at once', 'overshoot': 'none (visual-foundation R10)',
               'introEndsMs': 580, 'microMs': 280}, io.open(os.path.join(EX, 'motion.json'), 'w', encoding='utf-8'), indent=2)
    inner, w, h, _ = lockup('r3', 220, TOK['text'], 'v'); tag, _ = outlined_ui(TAG, 96, 560, 30, '#6f655c', 400)
    save('_og.svg', svgdoc(R(0, 0, 1200, 630, f' fill="{TOK["page"]}"') + f'<g transform="translate(96 70)">{inner}</g>' + tag, 1200, 630),
         1200, 630, png='og-image.png')
    inner, w, h, _ = lockup('r3', 260, TOK['text'], 'v')
    tag, _ = outlined_ui(TAG, 120, 660, 40, '#6f655c', 400)
    card = (R(0, 0, 1280, 800, f' fill="{TOK["page"]}"') + f'<g transform="translate(120 150)">{inner}</g>' + tag)
    save('_landing-card.svg', svgdoc(card, 1280, 800), 1280, 800, png='landing-card-1280x800.png')
    json.dump(JOBS, io.open(os.path.join(HERE, 'jobs.json'), 'w'), indent=1)


def ico():
    from PIL import Image
    ims = [Image.open(os.path.join(EX, f'favicon-{s}.png')).convert('RGBA') for s in (16, 32, 48)]
    ims[2].save(os.path.join(EX, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)], append_images=ims[:2])
    os.remove(os.path.join(EX, 'favicon-48.png'))
    for f in os.listdir(EX):
        if f.startswith('_'): os.remove(os.path.join(EX, f))


if __name__ == '__main__':
    {'ico': ico}.get(sys.argv[1] if len(sys.argv) > 1 else '', exports)()
