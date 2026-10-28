# -*- coding: utf-8 -*-
"""Builds page 2 of the Flier Studio visual-foundation approval (VISUAL-1): R2 R3 R4 R5 R7 R8 R9 R10."""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'visual-foundation'))
import build_page1 as p1  # noqa: E402

INK, INK2, BORDER, PRIMARY = p1.INK, p1.INK2, p1.BORDER, p1.PRIMARY
CALM = dict(page='#ebe8e3', card='#ffffff')
TODAY = dict(page='#f5f4f2', card='#fbfaf8')
D = dict(bg='#1c1a17', card='#25221e', ink='#f4efe8', ink2='#a59a8c', border='#80766a', brand='#e8dccb', prim='#4a423c')
MOTION = [('fast', 140), ('base', 200), ('slow', 300)]
DECEL = (0, 0, 0, 1)
ACCEL = (0.3, 0, 1, 1)


def bez(p, t):
    """y of a CSS cubic-bezier at time fraction t (binary search on x)."""
    x1, y1, x2, y2 = p
    f = lambda a, b, s: 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3
    lo, hi = 0.0, 1.0
    for _ in range(40):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if f(x1, x2, m) < t else (lo, m)
    return f(y1, y2, (lo + hi) / 2)


def sheet(y, backdrop, shadow=False, btns='one'):
    """A bottom sheet over the form: the floating layer."""
    s = f'<rect width="200" height="356" fill="{backdrop[0]}" opacity="{backdrop[1]}"/>'
    if shadow:
        s += f'<rect x="4" y="{y-2}" width="192" height="200" rx="12" fill="#000" opacity=".10"/>'
    s += f'<rect x="4" y="{y}" width="192" height="200" rx="12" fill="#ffffff" stroke="{BORDER}" stroke-width=".8"/>'
    s += f'<text x="16" y="{y+22}" font-size="8.5" font-weight="700" fill="{INK}" font-family="system-ui">Flier 1 of 4</text>'
    s += p1.poster(16, y + 32, 60, 84, 0, n=1)
    s += f'<rect x="88" y="{y+36}" width="96" height="20" rx="8" fill="#fff" stroke="{BORDER}"/><text x="136" y="{y+49}" font-size="6.5" fill="{INK}" text-anchor="middle" font-family="system-ui">Edit this flier</text>'
    if btns == 'one':
        s += f'<rect x="88" y="{y+62}" width="96" height="20" rx="8" fill="{PRIMARY}"/><text x="136" y="{y+75}" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui">Download PNG</text>'
        s += f'<rect x="88" y="{y+88}" width="96" height="20" rx="8" fill="#fff" stroke="{BORDER}"/><text x="136" y="{y+101}" font-size="6.5" fill="{INK}" text-anchor="middle" font-family="system-ui">See all 4</text>'
    else:
        for i, t in enumerate(['Download PNG', 'See all 4']):
            s += f'<rect x="88" y="{y+62+26*i}" width="96" height="20" rx="4" fill="{PRIMARY}"/><text x="136" y="{y+75+26*i}" font-size="6.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="system-ui">{t}</text>'
    return s


def form_with(p, extra):
    return p1.form_screen(p).replace('</svg>', extra + '</svg>')


def dark_form(fixed):
    btn, btxt = (D['brand'], D['bg']) if fixed else (D['prim'], '#ffffff')
    ring = D['brand'] if fixed else D['prim']
    b = f'<text x="10" y="22" font-size="13" font-weight="700" fill="{D["ink"]}" font-family="system-ui">Flier Studio</text>'
    b += f'<rect x="8" y="40" width="184" height="150" rx="12" fill="{D["card"]}" stroke="{D["border"]}"/>'
    b += f'<text x="18" y="58" font-size="8.5" font-weight="700" fill="{D["ink"]}" font-family="system-ui">Generate from prompt</text>'
    b += f'<rect x="18" y="68" width="164" height="36" rx="8" fill="{D["bg"]}" stroke="{D["border"]}"/>'
    b += f'<rect x="18" y="114" width="164" height="22" rx="8" fill="{btn}"/><text x="100" y="128" font-size="7.5" font-weight="700" fill="{btxt}" text-anchor="middle" font-family="system-ui">Generate</text>'
    b += f'<rect x="15" y="111" width="170" height="28" rx="10" fill="none" stroke="{ring}" stroke-width="2.5"/>'
    lab = 'Rule: dark primary + focus ring in brandFill, status = glyph + word (not drawn)' if fixed else 'Today: dark primary + focus ring 1.61:1'
    return f'<svg viewBox="0 0 200 356" role="img" aria-label="{lab}"><rect width="200" height="356" fill="{D["bg"]}"/>{b}</svg>'


def busy_form():
    """Don't: textured cards, tinted headings, boxed labels (R3 + R4 + R5 broken)."""
    s = p1.form_screen(dict(TODAY, heading='accent', label='Do not: texture, tints and boxes in the chrome'))
    noise = ''.join(f'<rect x="{12+(i*37)%176}" y="{58+(i*53)%220}" width="9" height="3" fill="#c98f5a" opacity=".55"/>' for i in range(28))
    boxes = '<rect x="16" y="81" width="72" height="11" fill="none" stroke="#2f2925"/><rect x="16" y="205" width="80" height="11" fill="none" stroke="#2f2925"/>'
    lines = '<line x1="8" y1="172" x2="192" y2="172" stroke="#2f2925" stroke-width="1.4"/>'
    return s.replace('</svg>', noise + boxes + lines + '</svg>')


def calm_form():
    s = p1.form_screen(dict(CALM, label='Do: flat chrome, hairline divider, outlines only on controls'))
    return s.replace('</svg>', '<line x1="16" y1="172" x2="184" y2="172" stroke="#e6e1da" stroke-width="1"/></svg>')


def filmstrip(reduced=False, today=False):
    """Bottom sheet entering: frames at 0, 75, 150, 225, 300 ms (slow 300, decelerate)."""
    W, H = 420, 120
    s = f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Sheet entering, five frames"><rect width="{W}" height="{H}" fill="#ebe8e3"/>'
    for i, ms in enumerate([0, 75, 150, 225, 300]):
        x = 6 + i * 83
        s += f'<rect x="{x}" y="6" width="76" height="92" fill="#ffffff" stroke="{BORDER}" stroke-width=".6"/>'
        if today or reduced:
            prog = 0 if (today and i == 0) else 1
            op = 1 if today else (0 if i == 0 else 1)
        else:
            prog, op = bez(DECEL, ms / 300), 1
        top = 98 - 56 * prog
        if prog > 0.01:
            s += f'<rect x="{x+3}" y="{top:.1f}" width="70" height="{98-top:.1f}" rx="6" fill="#fbfaf8" stroke="{INK2}" stroke-width=".7" opacity="{op}"/>'
            if 98 - top > 40:
                s += f'<rect x="{x+10}" y="{top+8:.1f}" width="22" height="30" fill="#1d3b4f" opacity="{op}"/>'
        s += f'<text x="{x+38}" y="112" font-size="8" fill="{INK}" text-anchor="middle" font-family="ui-monospace,monospace">{ms} ms</text>'
    return s + '</svg>'


def script_strip(today):
    rows = [('Form', 98, 'measured'), ('Previews', 96, 'measured'), ('Flier sheet open', None, 'after build'), ('Import dialog open', None, 'after build')]
    s = '<svg viewBox="0 0 420 150" role="img" aria-label="Median lightness per tool screen"><rect width="420" height="150" fill="#ffffff"/>'
    s += '<rect x="130" y="10" width="280" height="110" fill="#ebe8e3"/>'
    x0, x1 = 130, 410
    sx = lambda v: x0 + (v - 50) / 50 * (x1 - x0)
    if not today:
        s += f'<rect x="{sx(88):.0f}" y="10" width="{sx(100)-sx(88):.0f}" height="110" fill="#d6cfc4"/><text x="{sx(94):.0f}" y="134" font-size="8" fill="{INK}" text-anchor="middle" font-family="system-ui">band 88-100</text>'
    for i, (n, v, how) in enumerate(rows):
        y = 26 + i * 26
        s += f'<text x="8" y="{y+4}" font-size="9" fill="{INK}" font-family="system-ui">{n}</text>'
        if v is not None:
            s += f'<circle cx="{sx(v):.0f}" cy="{y}" r="5" fill="{INK}"/><text x="{sx(v)-10:.0f}" y="{y+4}" font-size="8" fill="{INK}" text-anchor="end" font-family="ui-monospace,monospace">L* {v}</text>'
        elif today:
            s += f'<text x="140" y="{y+4}" font-size="8" fill="{INK2}" font-family="system-ui">not measured today</text>'
        else:
            s += f'<path d="M{sx(94)-5:.0f} {y}h10" stroke="{INK}" stroke-width="2" stroke-dasharray="2 2"/><text x="{sx(88)-6:.0f}" y="{y+4}" font-size="8" fill="{INK2}" text-anchor="end" font-family="system-ui">must land here ({how})</text>'
    for v in (50, 75, 100):
        s += f'<text x="{sx(v):.0f}" y="146" font-size="7" fill="{INK2}" text-anchor="middle" font-family="ui-monospace,monospace">{v}</text>'
    return s + '</svg>'


MOTION_TABLE = '''<table class="mt"><thead><tr><th>Moment</th><th>Property</th><th>Token</th><th>Curve</th><th>Reduced motion</th></tr></thead><tbody>
<tr><td>Press on any button</td><td>background, 1px inset</td><td>fast 140 ms</td><td>standard 0.2,0,0,1</td><td>instant 0</td></tr>
<tr><td>Sheet / dialog enter</td><td>transform Y + opacity</td><td>slow 300 ms</td><td>decelerate 0,0,0,1</td><td>opacity only, instant 0</td></tr>
<tr><td>Sheet / dialog leave</td><td>transform Y + opacity</td><td>base 200 ms</td><td>accelerate 0.3,0,1,1</td><td>instant 0</td></tr>
<tr><td>Backdrop</td><td>opacity 0 to 72%</td><td>same as its layer</td><td>same as its layer</td><td>instant 0</td></tr>
<tr><td>Flier re-render</td><td>opacity cross-fade</td><td>base 200 ms</td><td>standard</td><td>instant swap</td></tr>
<tr><td>Export done</td><td>one cross-fade of the status line</td><td>base 200 ms</td><td>standard</td><td>instant 0</td></tr>
</tbody></table><p class="mtn">No overshoot, at most one thing moving at a time, only <code>transform</code> and <code>opacity</code>. Values come from <code>@dloizides/design-tokens</code> <code>DEFAULT_MOTION</code>; reduced motion = <code>prefers-reduced-motion: reduce</code> sets every duration to <code>instant</code>.</p>'''


def main():
    p1.CUR = p1.thumb('form-top-360-light.png', 300)
    secs = []
    o = p1.opt
    # 1: R2 key light + R8 chrome
    before = form_with(dict(TODAY, label='Today: sheet backdrop is text 60% (the dialog uses background 72%), no layer shadow'), sheet(150, ('#2f2925', .6)))
    after = form_with(dict(CALM, label='Rule: one backdrop, one layer shadow, one filled primary'), sheet(150, ('#f5f4f2', .72), shadow=True))
    secs.append(('R2 + R8 floating layers: flat chrome; one shadow token only on the sheet and dialog; one backdrop (background 72%) for both; one filled primary per view, everything else outlined 1px. Approve?',
                 o('R2R8', '11/11', after, 'Do: one backdrop, one filled button', before=before)))
    # 2: R7 colour never alone (dark)
    secs.append(('R7 dark theme: the main button and focus ring use brandFill #e8dccb on the dark card (11.7:1, today 1.61:1); a status is a glyph plus a word, never a coloured dot alone. Approve?',
                 o('R7', '11/11', dark_form(True), 'Do: 11.7:1 button + focus ring', before=dark_form(False))))
    # 3: R3 + R4 + R5 quiet chrome
    secs.append(('R3 + R4 + R5 quiet chrome: tool frames stay at or under 1% saturated pixels and 16% edges at 360 (today 0.05% / 15.1%); texture only inside fliers; dividers within 6 L* of their card; outlines only on things you can press and on the selected flier. Approve?',
                 o('R345', '11/11', calm_form(), 'Do: flat, hairline divider, no boxed labels', before=busy_form()).replace('<span class="tag">Today</span>', '<span class="tag">Do not: texture, tints, boxed labels (a made-up bad case, not today)</span>', 1)))
    # 4: R9 colour script
    secs.append(('R9 colour script: every tool screen keeps its median lightness within 10 of the form (light 88-100, dark 3-23), sheet and dialog open included, so no screen flashes darker or lighter. Approve?',
                 o('R9', '11/11', script_strip(False), 'Do: all four screens inside the band', before=script_strip(True))))
    # 5: R10 motion table
    secs.append(('R10 motion: the table below, from the design-tokens motion values; reduced motion makes every step instant. Approve?',
                 o('R10', '11/11', filmstrip(), 'Do: sheet enters 300 ms decelerate', before=filmstrip(today=True)).replace('<span class="tag">Today</span>', '<span class="tag">Today: no motion, the sheet appears in one frame</span>', 1) + MOTION_TABLE))
    html = p1.HEAD.replace('page 1 of 2', 'page 2 of 2').replace('Visual Rules</title>', 'Visual Rules 2</title>')
    html = html.replace('</style>', '.blk .opt figure svg{max-width:220px}.blk:nth-of-type(4) .opt figure svg,.blk:nth-of-type(5) .opt figure svg{max-width:420px}'
                        '.mt{border-collapse:collapse;width:100%;margin-top:14px;font-size:.85rem}.mt th,.mt td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}'
                        '.mtwrap{overflow-x:auto}.mtn{color:var(--ink2);font-size:.85rem}</style>')
    html = html.replace('one question.</p>', 'one question. Page 1 approved: print-shop details, calm tool, R6 shapes, R1 values, accent on the main action only, one Flier Studio mark.</p>')
    for i, (q, pics) in enumerate(secs, 1):
        pics = pics.replace('<table class="mt">', '<div class="mtwrap"><table class="mt">').replace('</table>', '</table></div>')
        html += f'<section class="blk"><div class="pics">{pics}</div>{p1.block(f"q{i}", f"Q{i}", q, [("A", "Approve")])}</section>'
    html += '<p class="foot">Values, audit figures and sources: <code>apps/flier-studio/docs/visual-language.md</code></p></main>'
    frames, options = [], {}
    items = p1.ITEMS['form']
    for oid in p1.OPTS:
        options[oid] = {'inventory': f'{len(items)}/{len(items)}', 'items': {'before': items, 'after': items}}
        pair = {'route': '/', 'state': 'form top, first load' + (', dark' if oid == 'R7' else ', light'), 'fixture': 'Kizomba preset, 4 fliers (default)', 'viewport': '360x640', 'scrollAnchor': 'title', 'crop': 'first screen'}
        for side in ('before', 'after'):
            frames.append({'option': oid, 'shot': 'form', 'side': side, 'build': 'schematic mockup (before = today, after = proposed rule)', 'pair': pair, 'visibleItems': {'before': items, 'after': items}})
    res = {'task': 'FLIER-2 "Flier Studio follow-ups" VISUAL-1 page 2', 'pairMethod': 'same-steps', 'countMethod': 'visible-in-frame',
           'rowsMethod': 'none: no side-by-side form rows in any frame (single-column 360 mockups); not tool-discovered',
           'note': 'rule approval page, no redesign; both sides are schematic mockups of the same route, state and crop', 'options': options, 'frames': frames}
    io.open(os.path.join(HERE, 'result.json'), 'w', encoding='utf-8').write(json.dumps(res, indent=1))
    io.open(os.path.join(HERE, 'index.html'), 'wb').write(html.encode('utf-8'))
    print('ok', len(html), [round(bez(DECEL, t / 300), 2) for t in (75, 150, 225)])


if __name__ == '__main__':
    main()
