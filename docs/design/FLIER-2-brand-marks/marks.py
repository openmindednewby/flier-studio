# -*- coding: utf-8 -*-
"""Flier Studio mark + wordmark candidates (VISUAL-1 page 3, R11). `python marks.py svg` then `node render.cjs` then `python marks.py page`."""
import base64, io, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'visual-foundation'))
import build_page1 as p1  # noqa: E402

INK, INK2, PAPER, PAGE, BORDER = '#2f2925', '#6f655c', '#fbfaf8', '#ebe8e3', '#8c8279'
DARK_BG, DARK_CARD, BRAND_D, DARK_INK = '#1c1a17', '#25221e', '#e8dccb', '#f4efe8'
VF = os.path.join(HERE, '..', '..', '..', '..', '..', '.claude', 'skills', 'visual-foundation', 'scripts', 'vf_measure.py')
TAG1, TAG2 = 'Event fliers and phone wallpapers from one form.', 'Everything stays in your browser.'


def mark_a(c, bg):
    """Trim: a flier sheet with the four pairs of crop marks a print shop cuts to."""
    s = f'<rect x="18" y="14" width="28" height="36" fill="{c}"/>'
    for x in (18, 46):
        s += f'<path d="M{x} 0v9M{x} 55v9" stroke="{c}" stroke-width="3.5"/>'
    for y in (14, 50):
        s += f'<path d="M0 {y}h13M51 {y}h13" stroke="{c}" stroke-width="3.5"/>'
    return s


def mark_a16(c, bg):
    s = f'<rect x="5" y="4" width="6" height="8" fill="{c}"/>'
    return s + f'<path d="M5 0h1v2h-1zM10 0h1v2h-1zM5 14h1v2h-1zM10 14h1v2h-1zM1 4h2v1h-2zM13 4h2v1h-2zM1 11h2v1h-2zM13 11h2v1h-2z" fill="{c}"/>'


def mark_b(c, bg):
    """Crop F: the top-left crop corner is the F; the opposite corner closes the sheet."""
    return (f'<path d="M14 12h30v7H21v10h15v6H21v17h-7z" fill="{c}"/>'
            f'<path d="M43 34h7v18H30v-7h13z" fill="{c}"/>')


def mark_b16(c, bg):
    return f'<path d="M3 2h9v2H5v3h5v2H5v5H3zM12 8h2v6H8v-2h4z" fill="{c}"/>'


def mark_c(c, bg):
    """Register: a flier sheet with a registration target on its corner."""
    return (f'<rect x="10" y="18" width="30" height="40" fill="{c}"/>'
            f'<circle cx="40" cy="18" r="14" fill="{bg}"/>'
            f'<circle cx="40" cy="18" r="8.5" fill="none" stroke="{c}" stroke-width="3.5"/>'
            f'<path d="M40 2v32M24 18h32" stroke="{c}" stroke-width="3"/>')


def mark_c16(c, bg):
    return (f'<rect x="2" y="5" width="8" height="10" fill="{c}"/><circle cx="10.5" cy="5.5" r="4.5" fill="{bg}"/>'
            f'<circle cx="10.5" cy="5.5" r="2.6" fill="none" stroke="{c}" stroke-width="1.1"/><path d="M10.5 1v9M6 5.5h9" stroke="{c}" stroke-width="1"/>')


def word_a(x, y, size, c):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}" font-family="Segoe UI,system-ui,sans-serif"><tspan font-weight="700">Flier</tspan><tspan font-weight="400"> Studio</tspan></text>'


def word_b(x, y, size, c):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="800" letter-spacing="{-0.02*size:.2f}" fill="{c}" font-family="Segoe UI,system-ui,sans-serif">flier studio</text>'


def word_c(x, y, size, c):
    return f'<text x="{x}" y="{y}" font-size="{size*.82:.1f}" font-weight="600" letter-spacing="{0.14*size:.2f}" fill="{c}" font-family="Consolas,ui-monospace,monospace">FLIER STUDIO</text>'


CANDS = {
    'A': dict(name='Trim', big=mark_a, small=mark_a16, word=word_a, why='the sheet a print shop trims, inside its four pairs of crop marks; wordmark weight-led, sentence case', sample=(246, 250, 20, 20)),
    'B': dict(name='Crop F', big=mark_b, small=mark_b16, word=word_b, why='the top-left crop corner drawn as the letter F, the opposite corner closing the sheet; wordmark heavy lowercase', sample=(186, 240, 20, 20)),
    'C': dict(name='Register', big=mark_c, small=mark_c16, word=word_c, why='a flier sheet with a registration target on its corner; wordmark a printer\'s job-slug in monospace', sample=(200, 300, 20, 20)),
}
ASSETS = [('fav16', 16, 16), ('fav32', 32, 32), ('pwa192', 192, 192), ('pwa512', 512, 512), ('og', 1200, 630), ('landing', 1280, 800), ('header360', 360, 56), ('header1280dark', 1280, 64)]


def place(markfn, x, y, size, c, bg):
    return f'<g transform="translate({x} {y}) scale({size/64})">{markfn(c, bg)}</g>'


def sample_fliers(x, y, w, h, gap, n, crop_first):
    s = ''
    for i in range(n):
        s += p1.poster(x + i * (w + gap), y, w, h, 0, sel='crop' if (crop_first and i == 0) else 'none', n=i)
    return s.replace('stroke-width="2"', f'stroke-width="{max(2, w/40):.1f}"')


def asset(k, cand, w, h):
    m, sm, wd = cand['big'], cand['small'], cand['word']
    if k in ('fav16', 'fav32'):
        b = f'<rect width="16" height="16" rx="3" fill="{PAPER}"/>{sm(INK, PAPER)}'
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 16 16" shape-rendering="crispEdges">{b}</svg>'
    if k.startswith('pwa'):
        b = f'<rect width="64" height="64" fill="{PAPER}"/><g transform="translate(16 16) scale(.5)">{m(INK, PAPER)}</g>'
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 64 64">{b}</svg>'
    if k == 'og':
        b = f'<rect width="{w}" height="{h}" fill="{PAGE}"/>' + place(m, 90, 120, 150, INK, PAGE) + wd(90, 360, 76, INK)
        b += f'<text x="90" y="430" font-size="30" fill="{INK2}" font-family="Segoe UI,system-ui,sans-serif">{TAG1}</text><text x="90" y="472" font-size="30" fill="{INK2}" font-family="Segoe UI,system-ui,sans-serif">{TAG2}</text>'
        b += sample_fliers(860, 110, 140, 200, 30, 2, True) + sample_fliers(860, 340, 140, 200, 30, 2, False)
    elif k == 'landing':
        b = f'<rect width="{w}" height="{h}" fill="{PAPER}"/>' + place(m, 96, 96, 112, INK, PAPER) + wd(240, 172, 64, INK)
        b += f'<text x="96" y="268" font-size="28" fill="{INK2}" font-family="Segoe UI,system-ui,sans-serif">{TAG1} {TAG2}</text>'
        b += sample_fliers(96, 340, 230, 330, 52, 4, True)
    elif k == 'header360':
        b = f'<rect width="{w}" height="{h}" fill="{PAPER}"/><rect y="{h-1}" width="{w}" height="1" fill="{BORDER}"/>' + place(m, 16, 14, 28, INK, PAPER) + wd(54, 35, 18, INK)
    else:
        b = f'<rect width="{w}" height="{h}" fill="{DARK_CARD}"/><rect y="{h-1}" width="{w}" height="1" fill="#80766a"/>' + place(m, 24, 16, 32, BRAND_D, DARK_CARD) + wd(68, 40, 20, DARK_INK)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{b}</svg>'


def do_svg():
    os.makedirs(os.path.join(HERE, 'svg'), exist_ok=True)
    jobs = []
    for cid, c in CANDS.items():
        for k, w, h in ASSETS:
            n = f'{cid}-{k}'
            io.open(os.path.join(HERE, 'svg', n + '.svg'), 'w', encoding='utf-8').write(asset(k, c, w, h))
            jobs.append({'name': n, 'w': w, 'h': h})
    io.open(os.path.join(HERE, 'svg', 'jobs.json'), 'w').write(json.dumps(jobs))
    print('svg', len(jobs))


def vf(*a):
    return subprocess.run([sys.executable, VF, *a], capture_output=True, text=True).stdout.strip()


def measure():
    from PIL import Image
    out = {}
    for cid, c in CANDS.items():
        png = lambda k: os.path.join(HERE, 'png', f'{cid}-{k}.png')
        vdir = os.path.join(HERE, 'vf', cid)
        os.makedirs(vdir, exist_ok=True)
        vf('views', png('pwa512'), '--out', vdir)
        x, y, w, h = c['sample']
        layers = {}
        for f in sorted(os.listdir(vdir)):
            if f.endswith('.png'):
                layers[f] = vf('layers', os.path.join(vdir, f), '--sample', f'mark={x},{y},{w},{h}', '--sample', 'paper=8,8,40,40')
        im = Image.open(png('fav16')).convert('L')
        px = list(im.getdata())
        ink = sum(1 for v in px if v < 128)
        grid = [''.join('#' if im.getpixel((i, j)) < 128 else ('+' if im.getpixel((i, j)) < 200 else '.') for i in range(16)) for j in range(16)]
        out[cid] = {'stats_fav16': vf('stats', png('fav16')), 'stats_og': vf('stats', png('og')), 'layers_pwa512_views': layers,
                    'fav16_ink_pct': round(100 * ink / 256, 1), 'fav16_grid': grid, 'swatch_light': vf('swatch', INK, PAPER), 'swatch_dark': vf('swatch', BRAND_D, DARK_CARD)}
    io.open(os.path.join(HERE, 'measurements.json'), 'w', encoding='utf-8').write(json.dumps(out, indent=1))
    return out


def uri(path, width=None, fmt='PNG'):
    fmt = 'JPEG' if (width and width >= 300) else fmt
    from PIL import Image
    im = Image.open(path).convert('RGB')
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, fmt, **({'quality': 80} if fmt == 'JPEG' else {'optimize': True}))
    return f'data:image/{fmt.lower()};base64,' + base64.b64encode(b.getvalue()).decode()


ITEMS = ['favicon-16', 'favicon-32', 'pwa-192', 'pwa-512-maskable', 'og-card', 'landing-card', 'app-header']


def before_html():
    aud = os.path.join(HERE, '..', 'visual-foundation', 'audit')
    from PIL import Image
    hdr = Image.open(os.path.join(aud, 'form-top-360-light.png')).convert('RGB')
    hdr = hdr.crop((0, 0, hdr.width, round(hdr.width * 56 / 360)))
    b = io.BytesIO(); hdr.save(b, 'PNG'); hd = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
    t = lambda n, w: uri(os.path.join(aud, n), w)
    return (f'<div class="sf"><div class="ic"><img class="px" src="{t("brand-favicon-logo.png", 32)}" width="32" height="32" alt="Tab icon today: Bailemos logo"><span>tab</span></div>'
            f'<div class="ic"><img src="{t("brand-icon-512.png", 192)}" width="96" height="96" alt="Home-screen icon today: Bailemos logo"><span>home screen</span></div></div>'
            f'<img class="wide tall" src="{t("brand-og-dancers.png", 300)}" alt="Share card today: Kizomba dancers, 576x1069"><span class="cap">share card (576x1069)</span>'
            f'<img class="wide" src="{t("brand-landing-card.png", 600)}" alt="dloizides.com card today: a Kizomba flier"><span class="cap">dloizides.com card</span>'
            f'<img class="wide" src="{hd}" alt="App header today: system-font title, no mark"><span class="cap">app header 360</span>')


def after_html(cid, c):
    P = lambda k: os.path.join(HERE, 'png', f'{cid}-{k}.png')
    return (f'<div class="sf"><div class="ic"><img class="px" src="{uri(P("fav16"))}" width="16" height="16" alt="Favicon 16"><span>16</span></div>'
            f'<div class="ic"><img class="px" src="{uri(P("fav16"))}" width="64" height="64" alt="Favicon 16 at 4x"><span>16 at 4x</span></div>'
            f'<div class="ic"><img class="px" src="{uri(P("fav32"))}" width="32" height="32" alt="Favicon 32"><span>32</span></div>'
            f'<div class="ic"><img src="{uri(P("pwa192"))}" width="64" height="64" style="border-radius:50%" alt="PWA 192, circle mask"><span>192 circle</span></div>'
            f'<div class="ic"><img src="{uri(P("pwa512"), 192)}" width="96" height="96" style="border-radius:22%" alt="PWA 512 maskable, squircle mask"><span>512 maskable</span></div></div>'
            f'<img class="wide" src="{uri(P("og"), 600)}" alt="Share card 1200x630, candidate {c["name"]}"><span class="cap">share card 1200x630</span>'
            f'<img class="wide" src="{uri(P("landing"), 600)}" alt="dloizides.com card 1280x800, candidate {c["name"]}"><span class="cap">dloizides.com card 1280x800</span>'
            f'<img class="wide" src="{uri(P("header360"))}" alt="App header 360, light"><span class="cap">app header 360, light</span>'
            f'<img class="wide" src="{uri(P("header1280dark"), 640)}" alt="App header 1280, dark"><span class="cap">app header 1280, dark (mark in brandFill)</span>')


def do_page():
    ms = measure()
    blocks, frames, options = [], [], {}
    bef = before_html()
    for i, (cid, c) in enumerate(CANDS.items(), 1):
        m = ms[cid]
        oid = f'MARK-{cid}'
        fig = (f'<div class="opt" data-option="{oid}" data-inventory="7/7" data-aligned="pass" data-result="result.json">'
               f'<figure data-visual="before"><span class="tag">Today: customer art on every owned surface</span>{bef}</figure>'
               f'<figure data-visual="after"><span class="tag">{cid} · {c["name"]}: {c["why"]}</span>{after_html(cid, c)}'
               f'<p class="meas">16 px ink cover {m["fav16_ink_pct"]}% · checks: <code>docs/design/FLIER-2-brand-marks/measurements.json</code></p></figure></div>')
        q = p1.block(f'q{i}', f'Q{i}', f'Candidate {cid} "{c["name"]}": keep it in the running?', [('A', 'Keep'), ('B', 'Drop')])
        blocks.append(f'<section class="blk"><div class="pics">{fig}</div>{q}</section>')
        options[oid] = {'inventory': '7/7', 'items': {'before': ITEMS, 'after': ITEMS}}
        for side, build in (('before', 'live assets 95d91d2 (audit captures)'), ('after', f'rendered candidate {cid} (Playwright, native sizes)')):
            frames.append({'option': oid, 'shot': 'owned brand surfaces', 'side': side, 'build': build,
                           'pair': {'route': 'owned brand surfaces', 'state': 'as served', 'fixture': 'none (no customer data)', 'viewport': 'native asset sizes', 'scrollAnchor': 'none', 'crop': 'whole asset'},
                           'visibleItems': {'before': ITEMS, 'after': ITEMS}})
    q = p1.block('q4', 'Q4', 'Which candidate becomes the Flier Studio mark (icons, share card, dloizides.com card, app header; never on posters)?', [('A', 'A "Trim"'), ('B', 'B "Crop F"'), ('C', 'C "Register"')])
    strip = ''.join(f'<div class="ic"><img class="px" src="{uri(os.path.join(HERE, "png", f"{k}-fav32.png"))}" width="64" height="64" alt="Candidate {k} at 32"><span>{k}</span></div>' for k in CANDS)
    blocks.append(f'<section class="blk"><div class="sf">{strip}</div>{q}</section>')
    html = p1.HEAD.replace('Visual Rules</title>', 'Visual Rules 3</title>').replace('page 1 of 2', 'page 3: the Flier Studio mark')
    html = html.replace('</style>', CSS + '</style>')
    html = html.replace('<p class="intro">', '<div class="hold" role="note"><b>Do not pick yet.</b> design-critic has not reviewed these candidates; answers are held until it passes.</div><p class="intro">')
    html = html.replace('Each block: today on the left, the proposed rule on the right, one question.', 'Three marks from the print shop (page 1 Q1), calm ink on paper-white, R6 shapes: the sheet is square paper, tiles round 12/64. Each is shown on every surface Flier Studio owns. Posters keep their own content logo.')
    html += ''.join(blocks) + '<p class="foot">Generator <code>apps/flier-studio/docs/design/FLIER-2-brand-marks/marks.py</code>, renders <code>png/</code>, checks <code>measurements.json</code>.</p></main>'
    res = {'task': 'FLIER-2 "Flier Studio follow-ups" VISUAL-1 page 3 (R11 mark)', 'pairMethod': 'same-steps', 'countMethod': 'visible-in-frame',
           'rowsMethod': 'none: brand assets, no form rows; not tool-discovered', 'note': 'noloss: allow new screen -- brand mark/wordmark are new assets', 'options': options, 'frames': frames}
    io.open(os.path.join(HERE, 'result.json'), 'w', encoding='utf-8').write(json.dumps(res, indent=1))
    io.open(os.path.join(HERE, 'index.html'), 'wb').write(html.encode('utf-8'))
    for cid in CANDS:
        print(cid, ms[cid]['fav16_ink_pct'], '\n'.join(ms[cid]['fav16_grid']))
    print('ok', len(html))


CSS = ('.hold{border:2px solid var(--ink);border-radius:8px;padding:10px 14px;margin:0 0 14px;font-weight:500}'
       '.opt{flex-direction:column}figure[data-visual="before"] img.wide{max-width:300px!important}figure[data-visual="before"] img.wide.tall{max-width:110px!important}.opt figure img.wide{width:100%;max-width:600px;height:auto;border:1px solid var(--line);border-radius:6px;display:block}'
       '.sf{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}.ic{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:.72rem;color:var(--ink2)}'
       '.ic img,.opt figure .ic img{border:1px solid var(--line);width:auto;max-width:none}img.px{image-rendering:pixelated}.cap{font-size:.72rem;color:var(--ink2);margin-bottom:6px}.meas{font-size:.8rem;color:var(--ink2);margin:6px 0 0}')

if __name__ == '__main__':
    do_svg() if sys.argv[1:] == ['svg'] else do_page()
