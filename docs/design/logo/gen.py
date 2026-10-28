# -*- coding: utf-8 -*-
"""LOGO-1 /logo-pipeline run for Flier Studio: LP2 thumbnails, LP3 concepts, LP4 refined marks +
construction + lockups, LP5 stress frames, LP6 motion SVGs. Writes svg/ + jobs.json; render.cjs
renders them; `python gen.py measure` writes stress.json from the PNGs.
Colours are the FLIER_TOKENS values (design-tokens 1.16.0 presets/flier.ts), named in TOK."""
import base64, io, json, math, os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
SVG = os.path.join(HERE, 'svg'); PNG = os.path.join(HERE, 'png')
TOK = {'primary': '#4a423c', 'text': '#2f2925', 'page': '#ebe8e3', 'surface': '#fbfaf8',
       'border': '#8c8279', 'darkBg': '#1c1a17', 'darkSurface': '#25221e', 'brandFill': '#e8dccb',
       'darkText': '#f4efe8'}
JOBS = []

# ---------- type -> paths ----------
_fc = {}
def _font(face, w):
    k = (face, w)
    if k not in _fc:
        _fc[k] = instancer.instantiateVariableFont(TTFont(os.path.join(APP, 'public', 'fonts', f'{face}-latin-wght.woff2')), {'wght': w})
    return _fc[k]

def word(parts, x, y, size, face='fraunces', tracking=0.0):
    """parts [(text, weight)] -> (path d, ink-left offset, advance)."""
    d, cx, first_lsb = '', x, None
    for text, w in parts:
        f = _font(face, w); gs = f.getGlyphSet(); cm = f.getBestCmap(); s = size / f['head'].unitsPerEm
        for ch in text:
            g = cm[ord(ch)]
            if first_lsb is None: first_lsb = f['hmtx'][g][1] * s
            pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y))); d += pen.getCommands()
            cx += f['hmtx'][g][0] * s + tracking * size
    return d, first_lsb, cx - x

def cap_size(face, cap_px):
    f = _font(face, 400); return cap_px / (f['OS/2'].sCapHeight / f['head'].unitsPerEm)

# ---------- geometry helpers ----------
def rot(px, py, cx, cy, deg):
    a = math.radians(deg); dx, dy = px - cx, py - cy
    return cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)

def rectpts(x, y, w, h, deg=0, cx=None, cy=None):
    pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
    return [rot(p[0], p[1], cx, cy, deg) for p in pts] if deg else pts

def poly(pts): return 'M' + ' L'.join(f'{a:.2f} {b:.2f}' for a, b in pts) + ' Z'
def R(x, y, w, h, ex=''): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"{ex}/>'

# ---------- the three refined marks (64-unit grid) ----------
def dealt_f(small=False):
    """R1 'Dealt F': the F is three sheets of the output set, arms dealt off the stem."""
    g = 8 if small else 6; sw = 16 if small else 14; a1, a2 = (-5, -3) if small else (-7, -4)
    stem = rectpts(12, 6, sw, 52)
    ax = 12 + sw + g
    top = rectpts(ax, 6, 54 - ax + 2, 15, a1, ax, 13.5)
    mid = rectpts(ax, 26 + (2 if small else 0), 17, 12, a2, ax, 32)
    parts = [('mark-stem', stem, (20, 58)), ('mark-arm-top', top, (ax, 13.5)), ('mark-arm-mid', mid, (ax, 32))]
    return [(i, poly(p), o) for i, p, o in parts], [q for _, p, _ in parts for q in p]

def fan(small=False):
    """R2 'Fan deck': a printer's swatch fan of paper strips on one rivet."""
    P = (15, 55); angs = [0, 27, 54] if small else [0, 18, 36, 54]; gap = 7 if small else 3.2
    strips = [rectpts(P[0] - 6.5, P[1] - 48, 13, 53, a, P[0], P[1]) for a in angs]
    allpts = [q for s in strips for q in s]
    minx, maxx = min(p[0] for p in allpts), max(p[0] for p in allpts)
    miny, maxy = min(p[1] for p in allpts), max(p[1] for p in allpts)
    dx, dy = 32 - (minx + maxx) / 2, 32 - (miny + maxy) / 2
    strips = [[(a + dx, b + dy) for a, b in s] for s in strips]; piv = (P[0] + dx, P[1] + dy)
    return strips, piv, gap, [q for s in strips for q in s]

def sort_face(small=False):
    """R3 'Sort': a letterpress sort; its face carries the F mirrored, as metal type does."""
    if small:
        face = (10, 6, 44, 36); F = dict(l=16, r=47, t=11, sw=9, mt=28, mh=7, ml=25); foot = (10, 50, 44, 8)
    else:
        face = (12, 8, 40, 36); F = dict(l=19, r=43, t=13, sw=7, mt=24, mh=6, ml=25); foot = (12, 48, 40, 7)
    x, y, w, h = face; l, r, t, s = F['l'], F['r'], F['t'], F['sw']; b = t + 26 if not small else t + 28
    fpts = [(r, t), (r, b), (r - s, b), (r - s, F['mt'] + F['mh']), (F['ml'], F['mt'] + F['mh']), (F['ml'], F['mt']),
            (r - s, F['mt']), (r - s, t + s), (l, t + s), (l, t)]
    face_d = poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)]) + ' ' + poly(fpts[::-1])
    fx, fy, fw, fh = foot
    if small:
        foot_d = poly([(fx, fy), (fx + fw, fy), (fx + fw, fy + fh), (fx, fy + fh)])
    else:
        c = fx + fw / 2
        foot_d = f'M{fx} {fy} L{c-3.5} {fy} A3.5 3.5 0 0 0 {c+3.5} {fy} L{fx+fw} {fy} L{fx+fw} {fy+fh} L{fx} {fy+fh} Z'
    return face_d, foot_d, [(x, y), (x + w, fy + fh)]

FLY = ('M14 56 C15 42 19 26 23 9 L51 5 C47 19 43 31 41 41 L33 50 Z', 'M44.5 44 L36.5 53 C42 54 46.5 51.5 49 47 Z')
FLY_SMALL = ('M13 57 C14 42 18 26 22 8 L52 4 C48 18 44 29 41 38 L30 50 Z', 'M45 42 L34 55 C41 56 47 53 51 46.5 Z')


def bbox(pts):
    return min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)

def mark_svg(key, color, small=False, bg=None, motion=None):
    """Inner SVG (64 grid) with named layers; motion = 'intro'|'micro'|None adds the CSS beats."""
    out = []
    if bg: out.append(R(0, 0, 64, 64, f' fill="{bg}"'))
    css = ''
    if key == 'r1':
        parts, _ = dealt_f(small)
        for i, d, o in parts:
            out.append(f'<g id="{i}" style="transform-origin:{o[0]:.1f}px {o[1]:.1f}px"><path d="{d}" fill="{color}"/></g>')
        if motion == 'intro':
            css = ('#mark-stem{animation:st 300ms cubic-bezier(0,0,0,1) both}'
                   '@keyframes st{from{transform:translateY(10px);opacity:0}}'
                   '#mark-arm-top{animation:at 300ms cubic-bezier(0,0,0,1) 280ms both}'
                   '@keyframes at{from{transform:translateX(-12px) rotate(-14deg);opacity:0}}'
                   '#mark-arm-mid{animation:am 200ms cubic-bezier(0,0,0,1) 560ms both}'
                   '@keyframes am{from{transform:translateX(-10px) rotate(-10deg);opacity:0}}')
        elif motion == 'micro':
            css = ('#mark-arm-top{animation:mt 280ms cubic-bezier(0.2,0,0,1) both}'
                   '@keyframes mt{50%{transform:rotate(-5deg)}}'
                   '#mark-arm-mid{animation:mm 280ms cubic-bezier(0.2,0,0,1) both}'
                   '@keyframes mm{50%{transform:rotate(-4deg)}}')
    elif key == 'r2':
        strips, piv, gap, _ = fan(small)
        uid = f'fan{"s" if small else ""}'
        hole = '' if small else f'<circle cx="{piv[0]:.2f}" cy="{piv[1]:.2f}" r="2.6" fill="#000"/>'
        if not bg:
            out.append('<defs>' + ''.join(
                f'<mask id="{uid}{n}" maskUnits="userSpaceOnUse" x="-10" y="-10" width="84" height="84">'
                f'<rect x="-10" y="-10" width="84" height="84" fill="#fff"/>'
                + ''.join(f'<path d="{poly(f)}" fill="#000" stroke="#000" stroke-width="{gap*2}"/>' for f in strips[n+1:])
                + hole + '</mask>' for n in range(len(strips))) + '</defs>')
        for n, s in enumerate(strips):
            stroke = f' stroke="{bg}" stroke-width="{gap*2}" paint-order="stroke"' if bg else f' mask="url(#{uid}{n})"'
            out.append(f'<g id="mark-strip-{n+1}" style="transform-origin:{piv[0]:.1f}px {piv[1]:.1f}px">'
                       f'<path d="{poly(s)}" fill="{color}"{stroke}/></g>')
        if not small and bg:
            out.append(f'<circle id="mark-rivet" cx="{piv[0]:.2f}" cy="{piv[1]:.2f}" r="2.6" fill="{bg}"/>')
        if motion == 'intro':
            for n in range(1, len(strips)):
                ang = [0, 18, 36, 54][n]
                css += (f'#mark-strip-{n+1}{{animation:f{n} 300ms cubic-bezier(0,0,0,1) {140*(n-1)}ms both}}'
                        f'@keyframes f{n}{{from{{transform:rotate(-{ang}deg)}}}}')
            css += '#mark-strip-1{animation:f0 200ms cubic-bezier(0,0,0,1) both}@keyframes f0{from{opacity:0}}'
        elif motion == 'micro':
            for n in range(1, len(strips)):
                css += (f'#mark-strip-{n+1}{{animation:m{n} 280ms cubic-bezier(0.2,0,0,1) both}}'
                        f'@keyframes m{n}{{50%{{transform:rotate(-{4*n}deg)}}}}')
    elif key == 'r3':
        body, curl = FLY_SMALL if small else FLY
        out.append(f'<g id="mark-sheet" style="transform-origin:14px 56px"><path d="{body}" fill="{color}"/></g>')
        out.append(f'<g id="mark-curl" style="transform-origin:40px 48px"><path d="{curl}" fill="{color}"/></g>')
        if motion == 'intro':
            css = ('#mark-sheet{animation:sh 300ms cubic-bezier(0,0,0,1) both}'
                   '@keyframes sh{from{transform:translate(-10px,10px) rotate(12deg);opacity:0}}'
                   '#mark-curl{animation:cu 300ms cubic-bezier(0,0,0,1) 280ms both}'
                   '@keyframes cu{from{transform:rotate(28deg) scale(.6);opacity:0}}')
        elif motion == 'micro':
            css = ('#mark-curl{animation:mc 280ms cubic-bezier(0.2,0,0,1) both}'
                   '@keyframes mc{50%{transform:rotate(-10deg)}}'
                   '#mark-sheet{animation:ms 280ms cubic-bezier(0.2,0,0,1) both}'
                   '@keyframes ms{50%{transform:translateY(-1.5px)}}')
    if css:
        css += '@media (prefers-reduced-motion: reduce){*{animation:none!important}}'
        out.insert(0, f'<style>{css}</style>')
    return ''.join(out)

def mark_bbox(key, small=False):
    if key == 'r1': return bbox(dealt_f(small)[1])
    if key == 'r2': return bbox(fan(small)[3])
    return (13, 4, 52, 57) if small else (14, 5, 51, 56)

def svgdoc(inner, w, h, vb=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{vb or f"0 0 {w} {h}"}">{inner}</svg>'

def save(rel, doc, w=None, h=None, **job):
    p = os.path.join(SVG, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8').write(doc)
    if w: JOBS.append(dict(svg=rel, png=rel.replace('.svg', '.png'), w=w, h=h, **job))

# ---------- lockups ----------
def lockup(key, mh, color, kind='h'):
    """Mark at height mh + outlined wordmark. Returns (inner, width, height, edges)."""
    x0, y0, x1, y1 = mark_bbox(key); s = mh / (y1 - y0)
    g = f'<g transform="translate({-x0*s:.2f},{-y0*s:.2f}) scale({s:.4f})">{mark_svg(key, color)}</g>'
    mw = (x1 - x0) * s
    if kind == 'h':
        cap = mh * 0.46; size = cap_size('fraunces', cap)
        wx = mw + mh * 0.30
        d, lsb, adv = word([('Flier ', 560), ('Studio', 380)], wx, mh, size)
        inner = g + f'<path d="{d}" fill="{color}"/>'
        return inner, wx + adv, mh, {'baseline_vs_mark_bottom_px': 0.0}
    cap = mh * 0.30; size = cap_size('fraunces', cap)
    d, lsb, adv = word([('Flier ', 560), ('Studio', 380)], 0, 0, size)
    by = mh + mh * 0.22 + cap
    d, lsb, adv = word([('Flier ', 560), ('Studio', 380)], -lsb, by, size)
    inner = g + f'<path d="{d}" fill="{color}"/>'
    return inner, max(mw, adv), by + mh * 0.06, {'left_edge_delta_px': 0.0}

def outlined_ui(text, x, y, size, color, w=500):
    d, _, adv = word([(text, w)], x, y, size, face='jost'); return f'<path d="{d}" fill="{color}"/>', adv

# ---------- thumbnails (LP2) ----------
def thumbs():
    K = 'fill="#000"'
    def st(d, w=5): return f'<path d="{d}" fill="none" stroke="#000" stroke-width="{w}"/>'
    def fanT(n, rivet):
        P = (14, 56); out = ''
        for i, a in enumerate([0, 18, 36, 54][:n] if n == 4 else [0, 27, 54]):
            out += f'<path d="{poly(rectpts(P[0]-6, P[1]-46, 12, 50, a, *P))}" {K} stroke="#fff" stroke-width="5" paint-order="stroke"/>'
        return out + (f'<circle cx="{P[0]}" cy="{P[1]}" r="2.5" fill="#fff"/>' if rivet else '')
    r1 = ''.join(f'<path d="{d}" {K}/>' for _, d, _ in dealt_f()[0])
    r1u = R(12, 6, 14, 52, ' ' + K) + R(32, 6, 24, 15, ' ' + K) + R(32, 26, 17, 12, ' ' + K)
    fd, ft, _ = sort_face()
    T = [
        ('letterform', 'Dealt F: three sheets, arms dealt', r1),
        ('letterform', 'Imposed F: three sheets, upright', r1u),
        ('letterform', 'Crop-corner F + fold tick', st('M14 58 V20') + st('M20 14 H52') + st('M20 34 H40')),
        ('letterform', 'Stencil F with bridges', R(14, 8, 10, 22, ' ' + K) + R(14, 34, 10, 22, ' ' + K) + R(28, 8, 24, 9, ' ' + K) + R(28, 27, 16, 8, ' ' + K)),
        ('letterform', 'Lowercase f as a curling strip', st('M24 58 V26 C24 10 42 8 48 16', 8) + st('M12 32 H40', 7)),
        ('object', 'Swatch fan, 4 strips', fanT(4, False)),
        ('object', 'Swatch fan, 3 strips + rivet', fanT(3, True)),
        ('object', 'Letterpress sort, mirrored F', f'<path d="{fd}" {K} fill-rule="evenodd"/>'),
        ('object', 'Sort with foot + nick', f'<path d="{fd}" {K} fill-rule="evenodd"/><path d="{ft}" {K}/>'),
        ('object', 'Registration target, quartered', '<circle cx="32" cy="32" r="17" fill="none" stroke="#000" stroke-width="4"/>' + st('M32 4 V60 M4 32 H60', 4) + '<path d="M32 32 V15 A17 17 0 0 1 49 32 Z M32 32 V49 A17 17 0 0 1 15 32 Z" fill="#000"/>'),
        ('object', 'Paper stack, 3 sheets', ''.join(R(10 + 6*i, 6 + 6*i, 34, 44, ' fill="#000" stroke="#fff" stroke-width="3"') for i in range(3))),
        ('object', 'Brayer (ink roller)', R(10, 12, 44, 14, ' ' + K) + st('M32 26 V38 L44 50 V58', 5)),
        ('object', 'Colour bar patches', ''.join(R(6 + 11*i, 24, 9, 16, f' fill="#000" fill-opacity="{1 - i*0.18:.2f}"') for i in range(5))),
        ('object', 'Guillotine blade over sheet', R(12, 30, 40, 28, ' ' + K) + '<path d="M6 8 H58 L58 18 L6 26 Z" fill="#000"/>'),
        ('object', 'Composing stick, row of sorts', R(6, 42, 52, 8, ' ' + K) + ''.join(R(10 + 12*i, 24, 9, 15, ' ' + K) for i in range(4))),
        ('action', 'Trim: offcut drops off the sheet', '<path d="M12 6 H40 L52 18 V58 H12 Z" fill="#000"/><path d="M45 4 L56 15 L58 4 Z" fill="#000"/>'),
        ('action', 'Fold: corner turned back', '<path d="M12 6 H40 L52 18 V58 H12 Z" fill="#000"/><path d="M40 6 V18 H52" fill="none" stroke="#fff" stroke-width="3"/>'),
        ('action', 'Deal: sheet slides from under', R(8, 14, 32, 42, ' ' + K) + R(22, 8, 32, 42, ' fill="#000" stroke="#fff" stroke-width="4"')),
        ('action', 'Press: platen over sheet', R(8, 8, 48, 14, ' ' + K) + R(14, 30, 36, 26, ' ' + K)),
        ('action', 'Impose: one sheet, four fliers', ''.join(R(14 + 19*(i % 2), 10 + 23*(i // 2), 16, 20, ' ' + K) for i in range(4)) + st('M14 4 V7 M30 4 V7 M33 4 V7 M49 4 V7', 2)),
        ('name', 'Flier in flight: curved sheet', '<path d="M8 40 C20 20 34 10 56 8 L50 34 C36 38 24 46 16 58 Z" fill="#000"/>'),
        ('name', 'Wing of two sheets', '<path d="M6 20 L34 30 L28 52 L4 42 Z" fill="#000"/><path d="M36 30 L60 12 L58 36 L32 50 Z" fill="#000"/>'),
        ('name', 'Kite: sheet on its corner', '<path d="M32 4 L56 30 L32 56 L8 30 Z" fill="#000"/>' + st('M32 56 C30 60 36 62 34 64', 3)),
        ('negative', 'Crop corners around an empty sheet', st('M10 18 V10 H18 M46 10 H54 V18 M54 46 V54 H46 M18 54 H10 V46', 5)),
        ('negative', 'Sheet with an F cut out', f'<path d="M10 6 H54 V58 H10 Z M22 14 V50 H30 V36 H42 V29 H30 V21 H46 V14 Z" fill="#000" fill-rule="evenodd"/>'),
        ('negative', 'Gutter cross between four sheets', ''.join(R(8 + 26*(i % 2), 8 + 26*(i // 2), 22, 22, ' ' + K) for i in range(4))),
        ('shape family', 'Four crop corners + square flier', st('M8 16 V8 H16 M48 8 H56 V16 M56 48 V56 H48 M16 56 H8 V48', 4) + R(18, 18, 28, 28, ' ' + K)),
        ('shape family', 'Card r12 holding a r0 flier', '<rect x="6" y="6" width="52" height="52" rx="12" fill="none" stroke="#000" stroke-width="5"/>' + R(20, 16, 24, 32, ' ' + K)),
        ('shape family', 'Crop marks, sheet off-register', st('M8 16 V8 H16 M48 8 H56 V16 M56 48 V56 H48 M16 56 H8 V48', 4) + R(22, 14, 28, 34, ' ' + K)),
        ('data rhythm', 'Three form lines become three sheets', st('M6 18 H22 M6 32 H22 M6 46 H22', 5) + R(30, 10, 10, 16, ' ' + K) + R(44, 10, 12, 44, ' ' + K) + R(30, 30, 10, 24, ' ' + K)),
        ('data rhythm', 'Halftone F', ''.join(f'<circle cx="{16+9*c}" cy="{10+9*r}" r="{4.2 - 0.35*r}" fill="#000"/>' for r in range(6) for c in range(5) if c == 0 or r == 0 and c < 5 or r == 2 and c < 4)),
        ('data rhythm', 'Misregistered plates', ''.join(R(10 + 5*i, 8 + 5*i, 34, 42, ' fill="none" stroke="#000" stroke-width="4"') for i in range(3))),
        ('data rhythm', 'Flier + wallpaper ratios side by side', R(6, 12, 30, 42, ' ' + K) + R(40, 6, 18, 52, ' ' + K)),
        ('object', 'Sort and its impression', f'<g transform="translate(0 8) scale(.5)"><path d="{fd}" {K} fill-rule="evenodd"/></g>' + '<path d="M44 12 V44 H51 V31 H59 V25 H51 V19 H61 V12 Z" fill="#000"/>'),
    ]
    cells = []
    for n, (src, label, inner) in enumerate(T, 1):
        save(f'thumbs/T{n:02d}.svg', svgdoc(f'<rect width="64" height="64" fill="#fff"/>{inner}', 64, 64))
        cells.append((n, src, label, inner))
    cols, cw, ch = 6, 150, 110
    rows = math.ceil(len(cells) / cols); sheet = [f'<rect width="{cols*cw}" height="{rows*ch}" fill="#fff"/>']
    for i, (n, src, label, inner) in enumerate(cells):
        x, y = (i % cols) * cw, (i // cols) * ch
        lab, _ = outlined_ui(f'T{n:02d} {src}', x + 8, y + 100, 11, '#444')
        sheet.append(f'<g transform="translate({x+43} {y+12})"><rect width="64" height="64" fill="#fff" stroke="#ddd"/>{inner}</g>{lab}')
    save('thumbs-sheet.svg', svgdoc(''.join(sheet), cols*cw, rows*ch), cols*cw, rows*ch)
    return T

# ---------- construction sheets (LP4) ----------
NOTES = {
    'r1': ['grid 64, unit 1; gutter 6 (8 in the 16 px glyph = 2 px)', 'stem 14 x 52; top arm 24 x 15 rotated -7 deg about its left middle; mid arm 17 x 12 at -4 deg',
           'arms rotated so the gutter opens 4 -> 6 toward the cut edge: the eye reads one gutter width', 'mid arm 3 units shorter than optical half of top arm so the F does not read as E',
           'small glyph: stem 16, arms -5/-3 deg, gutter 8'],
    'r2': ['grid 64; strips 13 x 53 (flier ratio 1:4 cut down from A-series strip)', 'pivot 5 units above strip foot; strips at 0/18/36/54 deg, 3.2 gap knocked out, rivet r 2.6',
           'composition centred on its bounding box, not the pivot, so the fan sits optically centred', 'small glyph: 3 strips at 0/27/54, gap 7 (1.75 px at 16), no rivet'],
    'r3': ['grid 64; sheet = straight top + bottom edges, curved long edges (cubic, same tension both sides)', 'top edge rises 5 units over 30: the sheet is moving up and right, not falling',
           'curl facet 3-unit gap from the sheet; its back edge is a curve so it reads as paper, not a dog-ear triangle', 'left edge overshoots the bottom by 1 unit so the foot does not look clipped',
           'small glyph: same parts, curl enlarged 20%, gap 4 (1.1 px at 16)'],
}

def construction(key):
    W, H = 640, 400; s = 5; inner = [R(0, 0, W, H, ' fill="#fff"')]
    grid = ''.join(f'<path d="M{20+i*s*4} 20 V{20+64*s} M20 {20+i*s*4} H{20+64*s}" stroke="#e4e0da" stroke-width="1"/>' for i in range(17))
    x0, y0, x1, y1 = mark_bbox(key)
    inner.append(f'<g transform="translate(20 20)">{grid.replace("translate","")}</g>' if False else grid)
    inner.append(f'<g transform="translate(20 20) scale({s})">{mark_svg(key, "#4a423c")}'
                 f'<rect x="{x0:.2f}" y="{y0:.2f}" width="{x1-x0:.2f}" height="{y1-y0:.2f}" fill="none" stroke="#c0392b" stroke-width=".25" stroke-dasharray="1 1"/></g>')
    for i, line in enumerate(NOTES[key]):
        p, _ = outlined_ui(line, 360, 40 + i * 40, 10.5, '#2f2925', 400); inner.append(p)
    save(f'construction-{key}.svg', svgdoc(''.join(inner), W, H), W, H)

# ---------- surfaces (LP5 frames + LP8 page) ----------
def logo_png_uri():
    return 'data:image/png;base64,' + base64.b64encode(open(os.path.join(APP, 'public', 'img', 'logo.png'), 'rb').read()).decode()

def mark_at(key, size, color, x=0, y=0, small=False, frac=1.0):
    x0, y0, x1, y1 = mark_bbox(key, small); span = max(x1 - x0, y1 - y0)
    s = 0.4 * size * 0.96 / math.hypot((x1 - x0) / 2, (y1 - y0) / 2) if frac == 'circle' else size * frac / span
    ox = x + (size - (x1 - x0) * s) / 2 - x0 * s; oy = y + (size - (y1 - y0) * s) / 2 - y0 * s
    return f'<g transform="translate({ox:.2f} {oy:.2f}) scale({s:.4f})">{mark_svg(key, color, small)}</g>'

def before_at(size, x=0, y=0): return f'<image href="{logo_png_uri()}" x="{x}" y="{y}" width="{size}" height="{size}"/>'

def surfaces(key):
    pre = f'surf/{key}-'; isb = key == 'before'
    fav = (lambda sz, x, y: before_at(sz, x, y)) if isb else (lambda sz, x, y: mark_at(key, sz, TOK['primary'], x, y, small=sz <= 24, frac=0.86))
    # tab
    t, _ = outlined_ui('Flier Studio', 34, 25, 12, '#2f2925', 400)
    save(pre + 'tab.svg', svgdoc(R(0, 0, 220, 40, ' fill="#dedbd6"') + '<path d="M6 40 V10 Q6 4 12 4 H200 Q206 4 206 10 V40 Z" fill="#fbfaf8"/>' + fav(16, 12, 13) + t, 220, 40), 220, 40)
    # icon 512 maskable: primary field, brandFill mark at 55% width
    icon = R(0, 0, 512, 512, f' fill="{TOK["primary"]}"') + (before_at(512) if isb else mark_at(key, 512, TOK['brandFill'], frac='circle'))
    save(pre + 'icon512.svg', svgdoc(icon, 512, 512), 512, 512)
    save(pre + 'icon512-safe.svg', svgdoc(icon + '<circle cx="256" cy="256" r="204.8" fill="none" stroke="#e9b47f" stroke-width="3" stroke-dasharray="10 8"/>', 512, 512), 512, 512)
    save(pre + 'home.svg', svgdoc(f'<defs><clipPath id="c"><circle cx="48" cy="48" r="48"/></clipPath></defs><g clip-path="url(#c)"><g transform="scale(.1875)">{icon}</g></g>', 96, 96), 96, 96)
    # headers
    for W, Hh, lh, pad in [(360, 56, 26, 16), (1280, 64, 30, 120)]:
        if isb:
            lk = before_at(lh + 8, pad, (Hh - lh - 8) / 2) + outlined_ui('Flier Studio', pad + lh + 18, Hh / 2 + 6, 17, TOK['text'], 600)[0]
        else:
            inner, lw, lhh, _ = lockup(key, lh, TOK['text'])
            lk = f'<g transform="translate({pad} {(Hh-lh)/2:.1f})">{inner}</g>'
        save(pre + f'header{W}.svg', svgdoc(R(0, 0, W, Hh, f' fill="{TOK["surface"]}"') + R(0, Hh - 1, W, 1, f' fill="{TOK["border"]}"') + lk, W, Hh), W, Hh)
    # OG 1200x630
    if isb:
        og = R(0, 0, 1200, 630, f' fill="{TOK["page"]}"') + before_at(300, 96, 120) + outlined_ui('Flier Studio', 96, 500, 64, TOK['text'], 600)[0]
    else:
        inner, lw, lhh, _ = lockup(key, 220, TOK['text'], 'v')
        tag, _ = outlined_ui('Event fliers and wallpapers from one form', 96, 560, 30, '#6f655c', 400)
        og = R(0, 0, 1200, 630, f' fill="{TOK["page"]}"') + f'<g transform="translate(96 70)">{inner}</g>' + tag
    save(pre + 'og.svg', svgdoc(og, 1200, 630), 1200, 630)

STANDINS = {  # one-colour silhouettes drawn from memory, NOT the real marks (NOT COVERED)
    'Canva (stand-in)': '<circle cx="32" cy="32" r="28" fill="#000"/><path d="M42 22 A13 13 0 1 0 42 42" fill="none" stroke="#fff" stroke-width="6"/>',
    'Adobe Express (stand-in)': '<rect x="4" y="4" width="56" height="56" rx="12" fill="#000"/><path d="M20 48 L32 16 L44 48 M25 38 H39" fill="none" stroke="#fff" stroke-width="6"/>',
    'PosterMyWall (stand-in)': '<rect x="4" y="4" width="56" height="56" rx="6" fill="#000"/><path d="M22 50 V14 H36 A10 10 0 0 1 36 34 H22" fill="none" stroke="#fff" stroke-width="6"/>',
    'Flipboard (stand-in)': '<rect x="4" y="4" width="56" height="56" fill="#000"/><path d="M16 16 H48 V26 H26 V36 H38 V46 H26 V50 H16 Z" fill="#fff"/>',
}
STOCK = {  # closest stock icons, redrawn from memory as 2 px outline approximations
    'r1': {'Lucide layout-dashboard': 'M8 8 H28 V36 H8 Z M36 8 H56 V22 H36 Z M36 30 H56 V56 H36 Z M8 44 H28 V56 H8 Z',
           'Lucide panels-left-bottom': 'M8 8 H56 V56 H8 Z M24 8 V56 M24 40 H56', 'Material view_quilt': 'M8 12 H24 V52 H8 Z M28 12 H56 V30 H28 Z M28 34 H40 V52 H28 Z M44 34 H56 V52 H44 Z'},
    'r2': {'Material swatchbook': 'M10 50 L10 10 H24 V50 Z M24 40 L44 14 L54 22 L30 52 Z M30 52 H54 V40 H34', 'Lucide palette': 'M32 8 A24 24 0 1 0 32 56 C38 56 36 46 42 46 H48 A10 10 0 0 0 56 36 C56 20 44 8 32 8 Z',
           'Lucide fan (stand-in)': 'M32 54 L10 20 A30 30 0 0 1 54 20 Z'},
    'r3': {'Lucide feather': 'M48 10 C30 10 16 26 16 48 L10 54 M16 48 H38 M48 10 L22 40', 'Lucide sticky-note': 'M10 10 H54 V38 L38 54 H10 Z M38 54 V38 H54',
           'Lucide send': 'M8 30 L56 8 L40 56 L32 36 Z M32 36 L56 8'},
}

def stress(key):
    pre = f'stress/{key}-'
    for sz in (16, 32):
        for nm, bg, fg in (('light', TOK['surface'], TOK['primary']), ('dark', TOK['darkBg'], TOK['brandFill'])):
            save(pre + f'{sz}-{nm}.svg', svgdoc(R(0, 0, sz, sz, f' fill="{bg}"') + mark_at(key, sz, fg, small=sz <= 24, frac=0.86), sz, sz), sz, sz)
    save(pre + '16-full-light.svg', svgdoc(R(0, 0, 16, 16, f' fill="{TOK["surface"]}"') + mark_at(key, 16, TOK['primary'], frac=0.86), 16, 16), 16, 16)
    save(pre + 'onecolour.svg', svgdoc(R(0, 0, 256, 256, ' fill="#fff"') + mark_at(key, 256, '#000', frac=0.8), 256, 256), 256, 256)
    save(pre + 'reversed.svg', svgdoc(R(0, 0, 256, 256, f' fill="{TOK["darkBg"]}"') + mark_at(key, 256, '#fff', frac=0.8), 256, 256), 256, 256)
    row = [R(0, 0, 5 * 56 + 8, 64, ' fill="#fff"')]
    items = list(STANDINS.values()) + [None]
    for i, it in enumerate(items):
        x = 8 + i * 56
        row.append(f'<g transform="translate({x} 16) scale(.5)">{it}</g>' if it else mark_at(key, 32, '#000', x, 16, small=False))
    save(pre + 'lineup32.svg', svgdoc(''.join(row), 5 * 56 + 8, 64), 5 * 56 + 8, 64)
    row = [R(0, 0, 4 * 44 + 8, 40, ' fill="#fff"')]
    for i, d in enumerate(STOCK[key].values()):
        row.append(f'<g transform="translate({8+i*44} 8) scale(.375)"><path d="{d}" fill="none" stroke="#000" stroke-width="5.3" stroke-linejoin="round"/></g>')
    row.append(mark_at(key, 24, '#000', 8 + 3 * 44, 8, small=True))
    save(pre + 'stock24.svg', svgdoc(''.join(row), 4 * 44 + 8, 40), 4 * 44 + 8, 40)

def motion(key):
    for kind in ('intro', 'micro'):
        x0, y0, x1, y1 = 0, 0, 64, 64
        doc = svgdoc(mark_svg(key, TOK['primary'], bg=TOK['surface'], motion=kind), 192, 192, '0 0 64 64')
        times = [0, 140, 280, 420, 560, 700, 860, 1200] if kind == 'intro' else [0, 70, 140, 210, 280]
        save(f'motion/{key}-{kind}.svg', doc, 192, 192, times=times)
    save(f'motion/{key}-still.svg', svgdoc(mark_svg(key, TOK['primary'], bg=TOK['surface']), 192, 192, '0 0 64 64'), 192, 192, reduced=True)

def gen():
    T = thumbs()
    for k in ('r1', 'r2', 'r3'):
        for small in (False, True):
            nm = f'refined/{k}{"-16" if small else ""}.svg'
            save(nm, svgdoc(mark_svg(k, TOK['primary'], small), 256, 256, '0 0 64 64'), 256, 256)
        construction(k); stress(k); motion(k); surfaces(k)
        for kind in ('h', 'v'):
            inner, w, h, edges = lockup(k, 64, TOK['text'], kind)
            save(f'refined/{k}-lockup-{kind}.svg', svgdoc(inner, math.ceil(w) + 2, math.ceil(h) + 2), math.ceil(w) + 2, math.ceil(h) + 2)
    surfaces('before')
    conc = {'c1': 0, 'c2': 5, 'c3': 8, 'c4': 15, 'c5': 25, 'c6': 31}
    for c, i in conc.items():
        save(f'concepts/{c}.svg', svgdoc(f'<rect width="64" height="64" fill="#fff"/>{T[i][2]}', 256, 256, '0 0 64 64'), 256, 256)
        save(f'concepts/{c}-32.svg', svgdoc(f'<rect width="64" height="64" fill="#fff"/>{T[i][2]}', 32, 32, '0 0 64 64'), 32, 32)
    json.dump(JOBS, open(os.path.join(SVG, 'jobs.json'), 'w'), indent=0)
    print('svgs', len(JOBS))

# ---------- LP5 measurement ----------
def measure():
    from PIL import Image
    def ink(p, bg):
        im = Image.open(os.path.join(PNG, p)).convert('L'); px = list(im.getdata()); b = int(bg)
        rng = max(abs(v - b) for v in px) or 1
        return sum(abs(v - b) for v in px) / rng / len(px)
    def span(p):
        im = Image.open(os.path.join(PNG, p)).convert('RGB'); W, H = im.size; bg = im.getpixel((2, 2))
        xs, ys, out = [], [], 0
        for y in range(0, H, 2):
            for x in range(0, W, 2):
                c = im.getpixel((x, y))
                if sum(abs(c[i] - bg[i]) for i in range(3)) > 90:
                    xs.append(x); ys.append(y)
                    if (x - W / 2) ** 2 + (y - H / 2) ** 2 > (0.4 * W) ** 2: out += 1
        return (max(xs) - min(xs)) / W, out
    res = {}
    for k in ('r1', 'r2', 'r3'):
        sw, outside = span(f'surf/{k}-icon512.png')
        svgtext = ''.join(open(os.path.join(SVG, f), encoding='utf-8').read() for f in
                          [f'refined/{k}-lockup-h.svg', f'refined/{k}-lockup-v.svg', f'surf/{k}-header360.svg', f'surf/{k}-og.svg'])
        res[k] = {
            'S1_ink16_light_glyph': round(ink(f'stress/{k}-16-light.png', 249), 3),
            'S1_ink16_full_mark': round(ink(f'stress/{k}-16-full-light.png', 249), 3),
            'S1_ink32_light': round(ink(f'stress/{k}-32-light.png', 249), 3),
            'S3_ink16_dark_glyph': round(ink(f'stress/{k}-16-dark.png', 27), 3),
            'S2_onecolour_ink': round(ink(f'stress/{k}-onecolour.png', 255), 3),
            'S3_reversed_ink': round(ink(f'stress/{k}-reversed.png', 27), 3),
            'S8_icon_span_frac': round(sw, 3), 'S8_px_outside_safe_circle': outside,
            'S9_live_text_elements': svgtext.count('<text'),
            'S9_edges': {'horizontal': 'wordmark baseline = mark bottom (0 px, by construction)', 'stacked': 'wordmark ink left = mark left (0 px, lsb compensated)'},
        }
    for c in ('c1', 'c2', 'c3', 'c4', 'c5', 'c6'):
        res[c] = {'S1_ink32': round(ink(f'concepts/{c}-32.png', 255), 3)}
    json.dump(res, open(os.path.join(HERE, 'stress.json'), 'w'), indent=1)
    print(json.dumps(res))

if __name__ == '__main__':
    measure() if sys.argv[1:] == ['measure'] else gen()
