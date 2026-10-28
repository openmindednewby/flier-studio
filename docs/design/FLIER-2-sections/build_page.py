"""Builds index.html for FLIER-2 "Flier Studio follow-ups" All fliers sections from the capture frames."""
import io

OPT = {
    'A': ('Three titled sections in the card',
          'One card, three side-by-side sections at 1280 (Theme | Shared text edits | Fliers), stacked at 360. The small caps section headings replace the field labels, so there are fewer labels. Download all moves onto the card heading line, so it stays visible when the card is folded.',
          '208 px at 1280 (before 264 + the Download row), 466 px at 360 (before 368 + 60)',
          'At 1280 or wider the previews column stops scrolling inside itself, so page scroll reaches Drafts.'),
    'B': ('Settings list, each row opens',
          'Each setting is one 48 px row that shows its current value ("Theme  Kizomba classic"), like iOS Settings. Tapping a row opens its picker under it. Add flier sits below. Download all is on the heading line.',
          '303 px at 1280, 385 px at 360',
          'At 1280 or wider, the Drafts card moves to the bottom of the left controls column, where it is seen without the inner scroll.'),
    'C': ('One toolbar strip',
          'No section headings. At 1280 the card is one strip, Theme | Shared text edits | Add flier, split by thin rules. At 360 the strip stacks with hairlines. The note moves under the strip, and the labels keep their current wording.',
          '204 px at 1280, 449 px at 360',
          'Same as A: the previews column no longer scrolls inside itself, so page scroll reaches Drafts.'),
}
INV = [
    ('All fliers card <code>all-fliers</code>', 'src/ui/allFliersPanel.ts:26', 'kept', 'kept', 'kept'),
    ('Fold toggle, aria-expanded, remembered per viewer <code>all-fliers-toggle</code>', 'src/ui/collapsible.ts:38-49', 'kept', 'kept', 'kept'),
    ('Fold hint (aria-description)', 'src/ui/collapsible.ts:38', 'kept', 'kept', 'kept'),
    ('Note "Theme and these settings change all n fliers."', 'src/ui/allFliersPanel.ts:25,33', 'kept', 'kept', 'kept (under the strip)'),
    ('Theme label <code>theme-row</code>', 'src/ui/themeControls.ts:52', 'moved to section heading THEME (label stays the accessible name)', 'moved to row title "Theme"', 'kept'),
    ('Theme picker <code>pick-theme</code> (2 themes)', 'src/ui/themeControls.ts:48', 'kept', 'moved to row Theme &rsaquo; picker (value shown on the row)', 'kept'),
    ('Label "Shared text edits apply to"', 'src/ui/allFliersPanel.ts:28', 'moved to heading SHARED TEXT EDITS (full label = accessible name)', 'moved to row title "Shared text edits"', 'kept'),
    ('Scope picker <code>pick-scope</code> (This flier only / All fliers (footer, level names, class price))', 'src/ui/allFliersPanel.ts:21-24', 'kept', 'moved to row Shared text edits &rsaquo; picker', 'kept'),
    ('Row container <code>all-fliers-row</code>', 'src/ui/allFliersPanel.ts:28', 'kept (section grid)', 'kept (list)', 'kept (strip)'),
    ('Add flier <code>add-flier</code>', 'src/ui/allFliersPanel.ts:29', 'moved to section FLIERS', 'kept', 'kept'),
    ('Download all PNGs <code>download-all</code> (row above the card)', 'src/main.ts:182', 'moved to the card heading line', 'moved to the card heading line', 'moved to the card heading line'),
    ('Folded state (body hidden)', 'src/ui/collapsible.ts:41-43', 'kept; Download all stays visible when folded', 'kept; same', 'kept; same'),
    ('Drafts card reachable at desktop <code>drafts-panel</code>', 'src/main.ts:186, src/ui/styles.css:147', 'moved to page scroll (inner scroller removed)', 'moved to the bottom of the controls column at 900 px or wider', 'moved to page scroll (inner scroller removed)'),
]


def pair(o, d, s, kind, alt):
    b = f'before-{d}-{s}{kind}.png'
    a = f'{o}-{d}-{s}{kind}.png'
    cls = 'pair phone' if d == '360' else 'pair'
    return (f'<div class="{cls}"><figure data-visual="before"><img src="{b}" alt="Before at {d}, {s}: {alt}">'
            f'<figcaption>Before, {d} {s}</figcaption></figure><figure data-visual="after"><img src="{a}" alt="After {o} at {d}, {s}: {alt}">'
            f'<figcaption>After {o}, {d} {s}</figcaption></figure></div>')


arts = []
for o, (t, d, h, dr) in OPT.items():
    arts.append(f'''<article data-option="{o}" data-inventory="13/13" data-aligned="pass" data-result="result.json">
<h2>{o} &middot; {t}</h2>
<p class="meta"><b>Inventory:</b> 13/13 &middot; aligned: pass (0 side-by-side pairs off by more than 1px, 4 frames) &middot; text fit: pass &middot; card height {h}</p>
<p>{d}</p><p><b>Drafts:</b> {dr}</p>
<h3>All fliers card, 1280 and 360</h3>
{pair(o, '1280', 'light', '', 'All fliers card scrolled to the top')}
{pair(o, '360', 'light', '', 'All fliers card scrolled to the top')}
{pair(o, '1280', 'dark', '', 'dark mode')}
<h3>Page scrolled to Drafts, 1280</h3>
{pair(o, '1280', 'light', '-drafts', 'page scrolled to the Drafts card')}
</article>''')
rows = ''.join(f'<tr><td>{i + 1}</td><td>{n}</td><td>{src}</td><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for i, (n, src, a, b, c) in enumerate(INV))
src = io.open('../FLIER-2-AC18-20/index.html', encoding='utf-8').read()
head = src.split('/* ---- answer-UI token defaults')[0].rsplit('\n', 1)[0].replace('<title>All Fliers Section</title>', '<title>All Fliers Sections</title>')
body = f'''
</style>
</head>
<body>
<main>
<p class="withdrawn">Critic pending &mdash; do not pick.</p>
<h1>FLIER-2 "Flier Studio follow-ups": the All fliers card in sections</h1>
<p class="meta">Live build 00f0f12 with each mockup applied to the live page. Galaxy S5 360x640 and Desktop Chrome 1280x800, light and dark, clock frozen at 2026-10-28 15:00Z, same steps for before and after (frames/*.json). Initial focus does not change: the Title field at 1280, none at 360 (main.ts:189). In B, opening a row moves focus to its picker.</p>
<p>All three options also fix Drafts being unreachable at desktop. Before: the previews column scrolls inside itself (768 px), so page scroll never reaches Drafts. Scrolling the page to it leaves it off screen (frames/before-1280-light-drafts.json). After: Drafts is on screen in A, B and C.</p>
{''.join(arts)}
<h2>Information inventory (role Visitor, All fliers card)</h2>
<table><tr><th>#</th><th>Item</th><th>Source</th><th>A</th><th>B</th><th>C</th></tr>{rows}</table>
<div class="q" data-qid="q1"><p class="qn"><span class="qi">Q1</span> How should the All fliers card be split into sections?</p>
<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Three titled sections side by side (Theme, Shared text edits, Fliers)</span></li>
<li data-letter="B"><span class="lt">B</span><span>Settings list: one row per setting showing its value, tap to open</span></li>
<li data-letter="C"><span class="lt">C</span><span>One toolbar strip split by thin rules, labels unchanged</span></li>
</ul>
<p class="why">All three keep 13/13, move Download all onto the card heading and make Drafts reachable at desktop. A and B shorten the visible label "Shared text edits apply to" to "Shared text edits"; the full label stays the accessible name.</p></div>
</main>
</body>
</html>
'''
io.open('index.html', 'wb').write((head + body).encode('utf-8'))
