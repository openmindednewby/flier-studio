# -*- coding: utf-8 -*-
"""Builds page 1 of the Flier Studio visual-foundation approval (VISUAL-1). Run from this folder."""
import base64, io, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
AUD = os.path.join(HERE, 'audit')
INK, INK2, BORDER = '#2f2925', '#6f655c', '#8c8279'
PRIMARY, ACCENT = '#4a423c', '#e9b47f'


def thumb(name, h=150):
    im = Image.open(os.path.join(AUD, name)).convert('RGB')
    im = im.resize((int(im.width * h / im.height), h))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=72)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def poster(x, y, w, h, r=0, sel='none', n=1):
    """A flier: the customer's content, the loud thing. Generic, no preset art."""
    hues = ['#1d3b4f', '#5b2a2a', '#2c4a2e', '#4a3a1d']
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{hues[n % 4]}"/>'
    s += f'<rect x="{x+w*.12}" y="{y+h*.1}" width="{w*.7}" height="{h*.1}" fill="#f2e6cf"/>'
    s += f'<rect x="{x+w*.12}" y="{y+h*.24}" width="{w*.45}" height="{h*.05}" fill="#e9b47f"/>'
    s += f'<circle cx="{x+w*.62}" cy="{y+h*.66}" r="{w*.22}" fill="#f2e6cf" opacity=".85"/>'
    if sel == 'ring':
        s += f'<rect x="{x-3}" y="{y-3}" width="{w+6}" height="{h+6}" rx="{r+2}" fill="none" stroke="{PRIMARY}" stroke-width="2.5"/>'
    if sel == 'crop':
        L = 7
        for cx, cy, dx, dy in [(x-3, y-3, 1, 1), (x+w+3, y-3, -1, 1), (x-3, y+h+3, 1, -1), (x+w+3, y+h+3, -1, -1)]:
            s += f'<path d="M{cx} {cy+dy*L}V{cy}H{cx+dx*L}" fill="none" stroke="{INK}" stroke-width="2"/>'
    return s


def artefact(kind, x, y, w, h):
    if kind == 'crop':
        o = ''
        for cx, cy, dx, dy in [(x, y, -1, -1), (x+w, y, 1, -1), (x, y+h, -1, 1), (x+w, y+h, 1, 1)]:
            o += f'<path d="M{cx} {cy+dy*3}v{dy*9}M{cx+dx*3} {cy}h{dx*9}" stroke="{INK}" stroke-width="1.4"/>'
        return o
    if kind == 'tape':
        return f'<rect x="{x+w/2-18}" y="{y-5}" width="44" height="13" fill="#d9c7a8" stroke="#b8a483" stroke-width=".6" transform="rotate(-4 {x+w/2} {y})"/>'
    if kind == 'frame':
        return f'<text x="{x+w-6}" y="{y+11}" font-size="9" font-weight="700" text-anchor="end" fill="#b3261e" font-family="ui-monospace,monospace">01A</text><ellipse cx="25" cy="330" rx="20" ry="25" fill="none" stroke="#b3261e" stroke-width="1.6" transform="rotate(-8 25 330)"/>'
    return ''


def phone(p, body):
    return (f'<svg viewBox="0 0 200 356" role="img" aria-label="{p.get("label", "Flier Studio at 360 px")}">'
            f'<rect width="200" height="356" fill="{p["page"]}"/>{body}</svg>')


def form_screen(p):
    pg, cd, rc, rk = p['page'], p['card'], p.get('rc', 7), p.get('rk', 4)
    art, hd = p.get('art'), p.get('heading', 'plain')
    b = f'<text x="10" y="22" font-size="13" font-weight="700" fill="{INK}" font-family="{p.get("tf", "system-ui")}">{p.get("title", "Flier Studio")}</text>'
    b += f'<rect x="10" y="30" width="150" height="4" rx="2" fill="{INK2}" opacity=".5"/><rect x="10" y="38" width="110" height="4" rx="2" fill="{INK2}" opacity=".5"/>'
    for (y, h, head) in [(54, 112, 'Generate from prompt'), (178, 110, 'Flier')]:
        b += f'<rect x="8" y="{y}" width="184" height="{h}" rx="{rc}" fill="{cd}" stroke="{p.get("cb", BORDER)}" stroke-width="{p.get("cbw", 1)}"/>'
        b += artefact(art, 8, y, 184, h)
        b += f'<text x="18" y="{y+18}" font-size="8.5" font-weight="700" fill="{INK}" font-family="system-ui">{head}</text>'
        if hd == 'accent':
            b += f'<rect x="18" y="{y+21}" width="{len(head)*4.4}" height="2" fill="{ACCENT}"/>'
    b += f'<text x="18" y="88" font-size="6.5" fill="{INK2}" font-family="system-ui">Describe the flier</text>'
    b += f'<rect x="18" y="93" width="164" height="36" rx="{rk}" fill="#ffffff" stroke="{BORDER}"/>'
    b += f'<rect x="18" y="137" width="164" height="20" rx="{rk}" fill="{p.get("btn", PRIMARY)}"/><text x="100" y="150" font-size="7.5" font-weight="700" fill="{p.get("btnInk", "#ffffff")}" text-anchor="middle" font-family="system-ui">Generate</text>'
    b += f'<text x="18" y="212" font-size="6.5" fill="{INK2}" font-family="system-ui">Editing flier 1 of 4</text>'
    b += f'<rect x="18" y="220" width="164" height="20" rx="{rk}" fill="#ffffff" stroke="{BORDER}"/><text x="24" y="233" font-size="6.5" fill="{INK}" font-family="system-ui">This flier only</text>'
    b += f'<rect x="0" y="304" width="200" height="52" fill="{p.get("bar", "#ffffff")}" stroke="{BORDER}" stroke-width=".6"/>'
    b += poster(10, 310, 30, 40, p.get('rt', 2), n=1)
    b += f'<text x="48" y="326" font-size="7.5" font-weight="700" fill="{INK}" font-family="system-ui">Flier 1 of 4</text><text x="48" y="337" font-size="6.5" fill="{INK2}" font-family="system-ui">Live preview</text>'
    b += f'<rect x="140" y="318" width="50" height="22" rx="{rk}" fill="#ffffff" stroke="{BORDER}"/><text x="165" y="332" font-size="6.5" fill="{INK}" text-anchor="middle" font-family="system-ui">See all 4</text>'
    return phone(p, b)


def preview_screen(p):
    rk, rt = p.get('rk', 4), p.get('rt', 4)
    b = f'<text x="10" y="20" font-size="9" font-weight="700" fill="{INK}" font-family="system-ui">Previews</text>'
    b += f'<rect x="120" y="8" width="72" height="18" rx="{rk}" fill="{PRIMARY}"/><text x="156" y="20" font-size="6" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui">Download all PNGs</text>'
    for i, (x, y) in enumerate([(14, 40), (108, 40), (14, 196), (108, 196)]):
        b += poster(x, y, 78, 112, rt, p['sel'] if i == 0 else 'none', n=i)
        if y == 40:
            b += f'<rect x="{x}" y="{y+120}" width="78" height="16" rx="{rk}" fill="#fff" stroke="{BORDER}"/><text x="{x+39}" y="{y+131}" font-size="6" fill="{INK}" text-anchor="middle" font-family="system-ui">Edit flier {i+1}</text>'
            b += f'<rect x="{x}" y="{y+140}" width="78" height="14" rx="{rk}" fill="#fff" stroke="{BORDER}"/>'
            if i == 1:
                b += f'<rect x="{x-3}" y="{y+117}" width="84" height="22" rx="{rk+2}" fill="none" stroke="{PRIMARY}" stroke-width="2.5"/>'
    return phone(p, b)


def surfaces(kind):
    """Four owned brand surfaces: tab icon, home-screen icon, share card, dloizides.com card."""
    slot = lambda x, y, s: (f'<rect x="{x}" y="{y}" width="{s}" height="{s}" rx="{s*.2}" fill="#f5f4f2" stroke="{INK2}" stroke-dasharray="3 2"/>'
                            f'<text x="{x+s/2}" y="{y+s/2+2}" font-size="{max(5, s/6)}" fill="{INK2}" text-anchor="middle" font-family="system-ui">mark</text>')
    b = '<rect width="420" height="160" fill="#ebe8e3"/>'
    b += slot(14, 40, 24) + '<text x="26" y="80" font-size="7" fill="#2f2925" text-anchor="middle" font-family="system-ui">tab</text>'
    b += slot(56, 28, 56) + '<text x="84" y="100" font-size="7" fill="#2f2925" text-anchor="middle" font-family="system-ui">home screen</text>'
    b += '<rect x="130" y="24" width="140" height="74" fill="#fbfaf8" stroke="#8c8279"/>' + slot(140, 34, 26)
    b += '<text x="172" y="52" font-size="9" font-weight="700" fill="#2f2925" font-family="system-ui">Flier Studio</text>'
    b += poster(222, 32, 30, 44, 0, n=0) + '<text x="200" y="112" font-size="7" fill="#2f2925" text-anchor="middle" font-family="system-ui">share card</text>'
    b += '<rect x="284" y="24" width="122" height="74" fill="#fbfaf8" stroke="#8c8279"/>' + slot(292, 32, 20)
    b += '<text x="318" y="45" font-size="8" font-weight="700" fill="#2f2925" font-family="system-ui">Flier Studio</text>'
    b += poster(330, 52, 22, 32, 0, n=2) + poster(358, 52, 22, 32, 0, n=3)
    b += '<text x="345" y="112" font-size="7" fill="#2f2925" text-anchor="middle" font-family="system-ui">dloizides.com card</text>'
    b += '<text x="210" y="140" font-size="8" fill="#6f655c" text-anchor="middle" font-family="system-ui">same mark on all four · sample fliers are generic, never a customer\'s</text>'
    return f'<svg viewBox="0 0 420 160" role="img" aria-label="Four brand surfaces, one mark slot">{b}</svg>'


CUR = None
OPTS = {}
ITEMS = {
    'form': ['title', 'lead', 'prompt-heading', 'describe-label', 'prompt-textarea', 'generate', 'flier-heading', 'editing-count', 'mini-thumb', 'mini-label', 'see-all'],
    'previews': ['previews-heading', 'download-all', 'flier-frames', 'edit-buttons', 'download-buttons', 'selected-state'],
    'marks': ['tab-icon', 'home-icon', 'share-card', 'landing-card'],
}
SCREEN = {'form': ('/', 'form top, light, first load', 'title'), 'previews': ('/', 'previews, light, flier 1 selected', 'previews-heading'), 'marks': ('owned brand surfaces', 'as served', 'none')}


def opt(oid, inv, after_svg, cap, before=None, screen='form'):
    n = len(ITEMS[screen]); inv = f'{n}/{n}'; OPTS[oid] = screen
    before = before or f'<img src="{CUR}" alt="Flier Studio today, 360 px">'
    return (f'<div class="opt" data-option="{oid}" data-inventory="{inv}" data-aligned="pass" data-result="result.json">'
            f'<figure data-visual="before"><span class="tag">Today</span>{before}</figure>'
            f'<figure data-visual="after"><span class="tag">{cap}</span>{after_svg}</figure></div>')


def block(qid, num, question, options, escapes=True):
    lis = ''.join(f'<li data-letter="{l}"><span class="lt">{l}</span><span>{t}</span></li>' for l, t in options)
    if escapes:
        lis += '<li data-letter="X"><span class="lt">X</span><span>Changes needed (note)</span></li><li data-letter="R"><span class="lt">R</span><span>None, redraw</span></li>'
    return (f'<div class="q" data-qid="{qid}"><p class="qn"><span class="qi">{num}</span>{question}</p>'
            f'<ul class="opts">{lis}</ul><p class="why"></p></div>')


def main():
    global CUR
    CUR = thumb('form-top-360-light.png', 300)
    base = dict(page='#f5f4f2', card='#fbfaf8')
    calm = dict(base, page='#ebe8e3', card='#ffffff')
    sections = []
    # 1 references: category-authentic language (no marks yet)
    refs = [('crop', 'A · Print shop: crop marks', {}), ('tape', 'B · Poster wall: tape', {'tf': 'Impact,Oswald,sans-serif'}), ('frame', 'C · Proof sheet: frame numbers', {'tf': 'ui-monospace,monospace'})]
    pics = ''.join(opt(f'REF-{k}', '11/11', form_screen(dict(calm, art=k, label=c, **extra)), c) for k, c, extra in refs)
    sections.append(('Which flier-making world should Flier Studio borrow its small details from?', pics,
                     [('A', 'Print shop: crop and registration marks'), ('B', 'Poster wall: paste-up tape, condensed type'), ('C', 'Proof sheet: frame numbers, grease-pencil circle')]))
    # 2 mood
    moodA = form_screen(dict(calm, label='Calm tool'))
    moodB = form_screen(dict(base, page='#e6d5bb', card='#f3e7d3', heading='accent', bar='#f3e7d3', label='Warm studio'))
    sections.append(('Which mood for the tool screens?', opt('MOOD-A', '11/11', moodA, 'A · Calm tool: the flier is the loud thing') + opt('MOOD-B', '11/11', moodB, 'B · Warm studio: tinted chrome'),
                     [('A', 'Calm tool (fleet default; recommended)'), ('B', 'Warm studio')]))
    # 3 shape families
    dont = preview_screen(dict(base, sel='ring', rt=4, label='Today: selected flier and focused button share one ring'))
    do = preview_screen(dict(calm, sel='crop', rt=0, label='Rule: square paper fliers, crop-mark selection, ring only for focus'))
    sections.append(('R6 shapes: cards round 12, controls round 8, fliers square paper; selection = crop marks, the ring means focus only. Approve?',
                     opt('R6', '6/6', do, 'Do: fliers square, selected by crop marks', before=dont, screen='previews'), [('A', 'Approve')]))
    # 4 value steps
    dont = form_screen(dict(base, label='Today: page and card 2 L* apart'))
    do = form_screen(dict(calm, label='Rule: page 8 L* below the card'))
    sections.append(('R1 values: page sits 8 L* below the cards (today 2), cards keep the 3.6:1 border. Approve?',
                     opt('R1', '11/11', do, 'Do: page L* 92, card 100', before=dont), [('A', 'Approve')]))
    # 5 accent as decoration
    dont = form_screen(dict(base, heading='accent', label='Today: accent underline on every section heading'))
    do = form_screen(dict(calm, label='Rule: accent only on the one main action'))
    sections.append(('Mood rule: the accent colour appears only on the one main action, never on headings. Approve?',
                     opt('ACCENT', '11/11', do, 'Do: headings in ink, no accent bars', before=dont), [('A', 'Approve')]))
    # 6 marks
    cur_marks = ''.join(f'<img class="mk" src="{thumb(n, 110)}" alt="{a}">' for n, a in [
        ('brand-favicon-logo.png', 'Tab icon today: Bailemos logo'), ('brand-icon-512.png', 'Home-screen icon today: Bailemos logo'),
        ('brand-og-dancers.png', 'Share card today: Kizomba preset dancers'), ('brand-landing-card.png', 'dloizides.com card today: a Kizomba flier')])
    sections.append(('R11 marks: one Flier Studio mark on all four owned surfaces; customer art never stands in for the brand. Approve? (The mark itself is drawn on page 2.)',
                     opt('R11', '4/4', surfaces('do'), 'Do: one mark slot, generic sample fliers', before=f'<div class="mks">{cur_marks}</div>', screen='marks'), [('A', 'Approve')]))
    html = HEAD
    for i, (qtext, pics, options) in enumerate(sections, 1):
        html += f'<section class="blk"><div class="pics">{pics}</div>{block(f"q{i}", f"Q{i}", qtext, options)}</section>'
    html += '<p class="foot">Values, audit figures and sources: <code>apps/flier-studio/docs/visual-language.md</code></p></main>'
    import json
    frames, options = [], {}
    for oid, sc in OPTS.items():
        route, state, anchor = SCREEN[sc]; items = ITEMS[sc]
        options[oid] = {'inventory': f'{len(items)}/{len(items)}', 'items': {'before': items, 'after': items}}
        pair = {'route': route, 'state': state, 'fixture': 'Kizomba preset, 4 fliers (default)', 'viewport': '360x640' if sc != 'marks' else 'native asset sizes', 'scrollAnchor': anchor, 'crop': 'first screen' if sc != 'marks' else 'whole asset'}
        for side, build in (('before', 'live flier-studio 95d91d2 capture'), ('after', 'schematic mockup of the proposed rule')):
            frames.append({'option': oid, 'shot': sc, 'side': side, 'build': build, 'pair': pair, 'visibleItems': {'before': items, 'after': items}})
    res = {'task': 'FLIER-2 "Flier Studio follow-ups" VISUAL-1 page 1', 'pairMethod': 'same-steps', 'countMethod': 'visible-in-frame', 'rowsMethod': 'none: no side-by-side form rows in any frame (single-column 360 mockups and asset files); not tool-discovered', 'note': 'after frames are schematic mockups of the same route, state and crop; rule approval page, no redesign', 'options': options, 'frames': frames}
    io.open(os.path.join(HERE, 'result.json'), 'w', encoding='utf-8').write(json.dumps(res, indent=1))
    io.open(os.path.join(HERE, 'index.html'), 'wb').write(html.encode('utf-8'))
    print('ok', len(html))


HEAD = '''<title>Flier Studio Visual Rules</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* layout: one column of blocks, each = pictures then its question */
:root{--bg:#f3f1ee;--panel:#ffffff;--ink:#2a2622;--ink2:#6b6259;--line:#d8d2ca;--act:#4a423c;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1c1a17;--panel:#25221e;--ink:#f1ece5;--ink2:#a59a8c;--line:#3d3832;--act:#e8dccb;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#1c1a17;--panel:#25221e;--ink:#f1ece5;--ink2:#a59a8c;--line:#3d3832;--act:#e8dccb;color-scheme:dark}
body{background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1080px;margin:0 auto;padding-block:20px 40px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font-size:1.25rem;margin:0 0 4px}.intro{color:var(--ink2);margin:0 0 20px}
.blk{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;margin:0 0 20px}
.pics{display:flex;flex-wrap:wrap;gap:16px}
.opt{display:flex;gap:8px;flex:1 1 300px;min-width:0}
.opt figure{margin:0;flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px}
.opt figure svg,.opt figure img{width:100%;max-width:220px;height:auto;border:1px solid var(--line);border-radius:6px;display:block}
.opt .mks{display:grid;grid-template-columns:1fr 1fr;gap:4px}.opt .mks img.mk{max-width:100%;border-radius:4px}
.blk:last-of-type .opt figure svg{max-width:420px}
.tag{font-size:.75rem;font-weight:600;color:var(--ink2);letter-spacing:.02em}
figure[data-visual="after"] .tag{color:var(--ink)}
.q{margin-top:12px}.qn{font-weight:600;margin:0 0 8px}.qi{display:inline-block;margin-right:8px;color:var(--ink2)}
.opts{list-style:none;margin:0;padding:0;display:grid;gap:6px}.opts li{display:flex;gap:8px;align-items:baseline}
.lt{font-weight:700;min-width:1.2em}.why:empty{display:none}
.foot{color:var(--ink2);font-size:.85rem}code{font-size:.85em}
</style>
<main><h1>Flier Studio visual rules, page 1 of 2</h1><p class="intro">Each block: today on the left, the proposed rule on the right, one question.</p>
'''

if __name__ == '__main__':
    main()
