# -*- coding: utf-8 -*-
"""LOGO-1 run 1 round 2 on C "In flight" (owner D2): three variants with the curl as an ATTACHED lifted
corner on one continuous fold line. Reuses gen.py's type, lockup, surface and stress helpers; writes
r2/svg + jobs.json, r2/motion/*.motion.json and the layered motion SVGs used by the pick page."""
import io, json, math, os, sys
from shapely.geometry import Polygon
from shapely import affinity
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import gen as G

G.SVG = os.path.join(HERE, 'svg'); G.PNG = os.path.join(HERE, 'png'); G.JOBS = []
TILT = 14.0
A4 = 1.41421
VAR = {'c2a': 'peel', 'c2b': 'lift', 'c2c': 'pair'}
NAME = {'c2a': 'Peel', 'c2b': 'Lift', 'c2c': 'Pair'}
TOKMS = {'fast': 140, 'base': 200, 'slow': 300}


def bez(p0, c1, c2, p3, n=24):
    return [tuple((1 - t) ** 3 * p0[i] + 3 * (1 - t) ** 2 * t * c1[i] + 3 * (1 - t) * t * t * c2[i] + t ** 3 * p3[i] for i in (0, 1))
            for t in [k / n for k in range(n + 1)]]


def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def halfplane(p1, p2, side, off):
    """Big polygon on one side of line p1-p2 (side=+1 toward the TR corner), its edge shifted off along the normal."""
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]; L = math.hypot(dx, dy); ux, uy = dx / L, dy / L
    nx, ny = uy * side, -ux * side; o = (p1[0] + nx * off, p1[1] + ny * off); B = 400
    a = (o[0] - ux * B, o[1] - uy * B); b = (o[0] + ux * B, o[1] + uy * B)
    return Polygon([a, b, (b[0] + nx * B, b[1] + ny * B), (a[0] + nx * B, a[1] + ny * B)])


def build(var, small=False):
    """Local sheet coords (centre 0,0, upright), then tilt + fit to the 64 grid."""
    W = 30.0; H = W * A4; g = (5.0 if var == 'peel' else 6.5) if small else 2.2; a = 17.5 if small else 15.0
    TL, TR, BR, BL = (-W / 2, -H / 2), (W / 2, -H / 2), (W / 2, H / 2), (-W / 2, H / 2)
    P1, P2 = (W / 2 - a, -H / 2), (W / 2, -H / 2 + a); M = lerp(P1, P2, .5)
    sheet = Polygon([TL, TR, BR, BL])
    inner = sheet.intersection(halfplane(P1, P2, -1, g / 2))
    corner = sheet.intersection(halfplane(P1, P2, +1, g / 2))
    Cp = (2 * M[0] - TR[0], 2 * M[1] - TR[1])
    if var == 'peel':
        edge = bez(P2, lerp(P2, Cp, 1.18), lerp(P1, Cp, .88), P1)
        curl = Polygon([P1, P2] + edge[1:-1])
        body = inner.difference(curl.buffer(g, join_style=2))
    else:
        T = (TR[0] - a * .30, TR[1] - a * .42)
        e1 = bez(P2, (P2[0] + a * .14, P2[1] - a * .40), (T[0] + a * .40, T[1] + a * .02), T)
        e2 = bez(T, (T[0] - a * .30, T[1] + a * .02), (P1[0] + a * .28, P1[1] - a * .16), P1)
        curl = Polygon([P1, P2] + e1[1:] + e2[1:-1]).buffer(0).intersection(halfplane(P1, P2, +1, g / 2))
        body = inner
    L = {'body': body, 'curl': curl, 'corner': corner, 'raw_body': inner}
    if var == 'pair':
        back = affinity.rotate(affinity.scale(sheet, .9, .9, origin=BL), -17, origin=BL)
        L['back'] = back.difference(unary_union([body, curl]).buffer(g, join_style=2)); L['raw_back'] = back
    for k in list(L): L[k] = affinity.rotate(L[k], TILT, origin=(0, 0))
    allg = unary_union([L[k] for k in ('body', 'curl', 'back') if k in L])
    x0, y0, x1, y1 = allg.bounds; s = (50.0 if small else 52.0) / max(x1 - x0, y1 - y0)
    dx, dy = 32 - (x0 + x1) / 2 * s, 32 - (y0 + y1) / 2 * s
    for k in list(L): L[k] = affinity.translate(affinity.scale(L[k], s, s, origin=(0, 0)), dx, dy)

    def Fp(p):
        r = math.radians(TILT); x, y = p[0] * math.cos(r) - p[1] * math.sin(r), p[0] * math.sin(r) + p[1] * math.cos(r)
        return (x * s + dx, y * s + dy)
    P = {'P1': Fp(P1), 'P2': Fp(P2), 'M': Fp(M), 'piv': Fp(BL)}
    P['phi'] = math.degrees(math.atan2(P['P2'][1] - P['P1'][1], P['P2'][0] - P['P1'][0]))
    P['g'] = g * s; P['sheet_h'] = H * s; P['a'] = a * s
    return L, P


def d_of(geom):
    out = ''
    for p in getattr(geom, 'geoms', [geom]):
        if p.is_empty: continue
        for ring in [p.exterior] + list(p.interiors):
            out += 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in list(ring.coords)[:-1]) + ' Z '
    return out.strip()


def mark_static(key, color, small=False, bg=None):
    L, _ = build(VAR[key], small); out = [G.R(0, 0, 64, 64, f' fill="{bg}"')] if bg else []
    if 'back' in L: out.append(f'<g id="mark-back" data-motion-layer="back"><path d="{d_of(L["back"])}" fill="{color}"/></g>')
    out.append(f'<g id="mark-sheet" data-motion-layer="sheet"><path d="{d_of(L["body"])}" fill="{color}"/>'
               f'<g id="mark-curl" data-motion-layer="curl"><path d="{d_of(L["curl"])}" fill="{color}"/></g></g>')
    return ''.join(out)


def mark_motion(key, color, bg):
    """Layered SVG for the live player: the unfolded corner and the curl are separate layers; gaps over
    another layer are drawn with a background stroke (solid surfaces only)."""
    v = VAR[key]; L, P = build(v); g = P['g']; o = lambda p: f'{p[0]:.2f}px {p[1]:.2f}px'
    st = f' stroke="{bg}" stroke-width="{2 * g:.2f}" paint-order="stroke"'
    out = []
    if v == 'pair':
        out.append(f'<g data-motion-layer="back" style="transform-origin:{o(P["piv"])}"><path d="{d_of(L["raw_back"])}" fill="{color}"/></g>')
    out.append(f'<g data-motion-layer="sheet" style="transform-origin:{o(P["piv"])}">'
               f'<path d="{d_of(L["raw_body"])}" fill="{color}"{st if v == "pair" else ""}/>'
               f'<g data-motion-layer="corner" style="transform-origin:{o(P["M"])};opacity:0"><path d="{d_of(L["corner"])}" fill="{color}"/></g>'
               f'<g data-motion-layer="curl" style="transform-origin:{o(P["M"])}"><path d="{d_of(L["curl"])}" fill="{color}"{st if v == "peel" else ""}/></g></g>')
    return ''.join(out)


def timeline(key):
    v = VAR[key]; _, P = build(v); f = P['phi']
    nrm = lambda s_: f'rotate({f:.2f}deg) scaleY({s_}) rotate({-f:.2f}deg)'
    intro = [
        {'layer': 'sheet', 'keyframes': [{'transform': 'translate(-5px, 5px) rotate(-4deg)', 'opacity': 0, 'offset': 0},
                                          {'opacity': 1, 'offset': 0.4},
                                          {'transform': 'translate(0px, 0px) rotate(0deg)', 'opacity': 1, 'offset': 1}],
         'duration': 'slow', 'easing': 'decelerate', 'delay': 0},
        {'layer': 'corner', 'keyframes': [{'transform': nrm(1), 'opacity': 1}, {'transform': nrm(0), 'opacity': 1}],
         'duration': 'fast', 'easing': 'standard', 'delay': 140},
        {'layer': 'curl', 'keyframes': [{'transform': nrm(0), 'offset': 0}, {'transform': nrm(1.08), 'offset': 0.7},
                                         {'transform': nrm(1), 'offset': 1}],
         'duration': 'slow', 'easing': 'decelerate', 'delay': 280},
    ]
    micro = [{'layer': 'curl', 'keyframes': [{'transform': nrm(1)}, {'transform': nrm(0.72)}, {'transform': nrm(1)}],
              'duration': 280, 'easing': 'standard', 'delay': 0},
             {'layer': 'sheet', 'keyframes': [{'transform': 'translate(0px, 0px)'}, {'transform': 'translate(1px, -1.5px)'},
                                               {'transform': 'translate(0px, 0px)'}],
              'duration': 280, 'easing': 'standard', 'delay': 0}]
    if v == 'pair':
        intro.insert(1, {'layer': 'back', 'keyframes': [{'transform': 'rotate(17deg)', 'opacity': 0, 'offset': 0}, {'opacity': 1, 'offset': 0.15},
                                                         {'transform': 'rotate(0deg)', 'opacity': 1, 'offset': 1}],
                         'duration': 'slow', 'easing': 'decelerate', 'delay': 140})
        micro.append({'layer': 'back', 'keyframes': [{'transform': 'rotate(0deg)'}, {'transform': 'rotate(-4deg)'}, {'transform': 'rotate(0deg)'}],
                      'duration': 280, 'easing': 'standard', 'delay': 0})
    ms = lambda d: TOKMS[d] if isinstance(d, str) else d
    end = max(b['delay'] + ms(b['duration']) for b in intro)
    return {'mark': key, 'name': NAME[key], 'tokens': 'design-tokens DEFAULT_MOTION (fast 140, base 200, slow 300 ms)',
            'intro': intro, 'introEndsMs': end, 'micro': micro, 'microTrigger': 'hover, focus, success',
            'reducedMotion': 'no animation; the static mark (corner open) is shown'}


_orig_svg, _orig_bbox = G.mark_svg, G.mark_bbox


def mark_svg(key, color, small=False, bg=None, motion=None):
    return mark_static(key, color, small, bg) if key in VAR else _orig_svg(key, color, small, bg, motion)


def mark_bbox(key, small=False):
    if key not in VAR: return _orig_bbox(key, small)
    L, _ = build(VAR[key], small); return unary_union([L[k] for k in ('body', 'curl', 'back') if k in L]).bounds


G.mark_svg, G.mark_bbox = mark_svg, mark_bbox
for _k in VAR:
    G.STOCK[_k] = {'Lucide file': 'M14 6 H40 L50 16 V58 H14 Z M40 6 V16 H50', 'Lucide sticky-note': G.STOCK['r3']['Lucide sticky-note'],
                   'Lucide send': G.STOCK['r3']['Lucide send']}
G.NOTES.update({
    'c2a': ['sheet 30 x 42.4 (1:1.414), straight edges, tilted 14 deg as a whole', 'fold = one straight line, 15 units on each edge (35% of the height)',
            'corner turned back over the face; free edge rolled (cubic), fold edge shared', 'gap 2.2 units = the back of the paper; 16 px: gap 5, corner 17.5'],
    'c2b': ['same sheet + fold as Peel', 'corner lifts off the page and curls back above the top edge',
            'curl attached along the whole fold, one 2.2-unit gap, no free piece', '16 px glyph: gap 6.5, corner 17.5'],
    'c2c': ['Lift + a second sheet of the set behind it', 'back sheet 90% size, fanned -17 deg about the shared bottom-left corner',
            'back sheet cut by the front sheet + 2.2-unit gap', '16 px glyph: gap 6.5, corner 17.5'],
})


def run():
    os.makedirs(os.path.join(HERE, 'motion'), exist_ok=True)
    for k in VAR:
        for small in (False, True):
            G.save(f'refined/{k}{"-16" if small else ""}.svg', G.svgdoc(mark_svg(k, G.TOK['primary'], small), 256, 256, '0 0 64 64'), 256, 256)
        G.construction(k); G.stress(k); G.surfaces(k)
        for kind in ('h', 'v'):
            inner, w, h, _ = G.lockup(k, 64, G.TOK['text'], kind)
            G.save(f'refined/{k}-lockup-{kind}.svg', G.svgdoc(inner, math.ceil(w) + 2, math.ceil(h) + 2), math.ceil(w) + 2, math.ceil(h) + 2)
        io.open(os.path.join(HERE, 'motion', f'{k}.layers.svg'), 'w', encoding='utf-8').write(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="192" height="192">{mark_motion(k, "currentColor", "var(--mark-bg)")}</svg>')
        json.dump(timeline(k), io.open(os.path.join(HERE, 'motion', f'{k}.motion.json'), 'w', encoding='utf-8'), indent=1)
    json.dump(G.JOBS, open(os.path.join(G.SVG, 'jobs.json'), 'w'), indent=0); print('svgs', len(G.JOBS))


def measure():
    from PIL import Image

    def ink(p, bg):
        im = Image.open(os.path.join(G.PNG, p)).convert('L'); px = list(im.getdata()); rng = max(abs(v - bg) for v in px) or 1
        return sum(abs(v - bg) for v in px) / rng / len(px)

    def span(p):
        im = Image.open(os.path.join(G.PNG, p)).convert('RGB'); W, H = im.size; bg = im.getpixel((2, 2)); xs, out = [], 0
        for y in range(0, H, 2):
            for x in range(0, W, 2):
                c = im.getpixel((x, y))
                if sum(abs(c[i] - bg[i]) for i in range(3)) > 90:
                    xs.append(x); out += (x - W / 2) ** 2 + (y - H / 2) ** 2 > (0.4 * W) ** 2
        return (max(xs) - min(xs)) / W, out
    res = {}
    for k in VAR:
        sw, outside = span(f'surf/{k}-icon512.png'); L, P = build(VAR[k]); Ls, Ps = build(VAR[k], True)
        txt = ''.join(open(os.path.join(G.SVG, f), encoding='utf-8').read() for f in
                      [f'refined/{k}-lockup-h.svg', f'refined/{k}-lockup-v.svg', f'surf/{k}-header360.svg', f'surf/{k}-og.svg'])
        res[k] = {'S1_ink16_light_glyph': round(ink(f'stress/{k}-16-light.png', 249), 3),
                  'S1_ink16_full_mark': round(ink(f'stress/{k}-16-full-light.png', 249), 3),
                  'S1_ink32_light': round(ink(f'stress/{k}-32-light.png', 249), 3),
                  'S3_ink16_dark_glyph': round(ink(f'stress/{k}-16-dark.png', 27), 3),
                  'S2_onecolour_ink': round(ink(f'stress/{k}-onecolour.png', 255), 3),
                  'S3_reversed_ink': round(ink(f'stress/{k}-reversed.png', 27), 3),
                  'S8_icon_span_frac': round(sw, 3), 'S8_px_outside_safe_circle': outside,
                  'S9_live_text_elements': txt.count('<text'),
                  'corner_frac_of_sheet_height_16px': round(Ps['a'] / Ps['sheet_h'], 2),
                  'gap_px_at_16': round(Ps['g'] * 16 * 0.86 / 64, 2),
                  'static_pieces': len(getattr(unary_union([L['body'], L['curl']]), 'geoms', [0])),
                  'introEndsMs': timeline(k)['introEndsMs'], 'microMs': 280}
    json.dump(res, open(os.path.join(HERE, 'stress.json'), 'w'), indent=1); print(json.dumps(res))


if __name__ == '__main__':
    measure() if sys.argv[1:] == ['measure'] else run()
