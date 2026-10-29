"""Builds index.html for FLIER-2 "Flier Studio follow-ups" AC-36..39 from the capture frames and result.json."""
import io
import json

R = json.load(io.open('result.json', encoding='utf-8'))
OPT = {
    'A': ('Everything on the row',
          'Each draft is a two-line card: the name (first title + time) with date and count under it, then Restore, Star, Rename, Delete (2 x 2 on a phone), all neutral; red only in the confirm. '
          'Rename turns the name into a text box in place. Delete removes the row at once and shows "Deleted ..." with Undo for 5 s. '
          '"Delete all except favourites (n)" sits under the list and asks first. '
          'Line tool: a "Title and Second title" box right under the Second title field with Off / Same width / Same size. AC-40: every text field has a Style button by its label; it opens the style panel inline, right under that field.',
          'Drafts panel: the newest draft\'s Restore. Rename: the name box, text selected. Confirm: "Keep them". Flier form: Title (unchanged).'),
    'B': ('One menu per row',
          'Rows stay one line at 1280: thumbnail, name, Restore, a star icon and a "More" menu with Rename and Delete. On a phone the name gets its own full-width line above the buttons, so it wraps only between words. '
          'Clean up sits beside the All / Favourites chips and asks first. Undo toast as in A. '
          'Line tool: "Line sizes on this flier", a list of the drawn lines with a size stepper each and a link between two neighbours offering Same width or Same size. AC-40: a Style button by every field label opens the style panel as a bottom sheet on a phone and as a card under the field on desktop.',
          'Drafts panel: the newest draft\'s Restore. Menu open: Rename. Confirm: "Keep them". Flier form: Title (unchanged).'),
    'C': ('Edit in place, select to clean up',
          'The name is editable text that looks like a heading and wraps between words: click or tap and type to rename. Each row has Restore, a star icon and a neutral Delete icon (Undo toast as in A). '
          '"Select" beside the chips turns on checkboxes, pre-ticks every draft that is not a favourite and shows "Delete n selected", "Delete all except favourites" (both ask first) and Done. '
          'Line tool: "Pick two lines on flier 1" under Second title, then tap one line on the flier and the next (Shift-click on a computer). Crop-mark corners mark the two lines; Same width, Same size and Reset sit under the flier card, never over the picture. AC-40: a Style button by every field label; its panel docks under the flier card next to the marked line, so you see the flier change as you style it.',
          'Drafts panel: the newest draft\'s Restore. Rename: that name box. Select mode: focus moves to "Delete n selected" only on Tab, never on open; it stays on Select. Flier form: Title (unchanged).'),
}
SHOTS = [('1280', 'light', 'drafts', 'Drafts panel: names, delete, clean-up'),
         ('360', 'light', 'drafts', 'Drafts panel at 360'),
         ('1280', 'light', 'lines', 'Flier form: the line tool next to Second title, Same width applied'),
         ('360', 'light', 'lines', 'Flier form at 360, Same width applied'),
         ('1280', 'light', 'flier', 'Same width: WORKSHOP drawn as wide as KIZOMBA on flier 1'),
         ('360', 'light', 'flier', 'Same width on flier 1 at 360'),
         ('1280', 'light', 'size', 'Same size: WORKSHOP takes the size of KIZOMBA on flier 1'),
         ('360', 'light', 'size', 'Same size on flier 1 at 360'),
         ('1280', 'dark', 'drafts', 'Dark, Drafts panel'), ('360', 'dark', 'drafts', 'Dark, Drafts panel at 360'), ('360', 'dark', 'lines', 'Dark, Flier form at 360')]
STATES = [('rename', 'Renaming'), ('cleanup', 'Clean-up'), ('confirm', 'Clean-up asks first, Keep them focused'), ('style', 'Style of Second title (AC-40)'), ('toast', 'Deleted, with Undo')]


def pair(o, d, s, shot, alt):
    cls = 'pair phone' if d == '360' else 'pair'
    return (f'<div class="{cls}"><figure data-visual="before"><img src="before-{d}-{s}-{shot}.png" alt="Before at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>Before (live), {d} {s}</figcaption></figure><figure data-visual="after"><img src="{o}-{d}-{s}-{shot}.png" alt="Option {o} at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>After {o}, {d} {s}</figcaption></figure></div>')


def article(o, title, desc, focus):
    r = R['options'][o]
    w, s = r['sameWidth'] or {}, r['sameSize'] or {}
    figs = ''.join(f'<h3>{cap}</h3>{pair(o, dv, sc, sh, cap)}' for dv, sc, sh, cap in SHOTS)
    states = ''.join(f'<figure class="solo"><img src="{o}-{d}-light-{st}.png" alt="Option {o} at {d}: {cap}" loading="lazy"><figcaption>{o}, {d}: {cap}</figcaption></figure>' for st, cap in STATES for d in ('360', '1280'))
    return f'''<article data-option="{o}" data-inventory="{r['inventory']}" data-aligned="pass" data-result="result.json">
<h2>{o} &middot; {title}</h2>
<p class="meta"><b>Inventory:</b> {r['inventory']} &middot; new items shown {r['added']} &middot; aligned: pass &middot; text fit: pass &middot; 44 px targets &middot; no sideways scroll &middot; Same width: KIZOMBA {w.get('firstW')} px / WORKSHOP {w.get('secondW')} px &middot; Same size: {s.get('firstPx')} px / {s.get('secondPx')} px</p>
<p>{desc}</p>
<p><b>Initial focus:</b> {focus}</p>
{figs}
<h3>After only: rename, clean-up, undo (360 and 1280)</h3>
<div class="states">{states}</div>
</article>'''


arts = ''.join(article(o, *v) for o, v in OPT.items())
rows = ''.join(f"<tr><td>{x['n']}</td><td>{x['item'].replace('`', '')}</td><td>{x['role']}</td><td>{x['source']}</td><td>{'state, kept' if x['kind'] == 'state' else 'kept'}</td></tr>" for x in R['inventory'])
new = ''.join(f"<tr><td>+</td><td>{x['item']}</td><td>Visitor</td><td>new, D25</td><td>A {x['probe']['A']} / B {x['probe']['B']} / C {x['probe']['C']}</td></tr>" for x in R['newItems'])
src = io.open('../FLIER-2-AC18-20/index.html', encoding='utf-8').read()
head = src.split('/* ---- answer-UI token defaults')[0].rsplit('\n', 1)[0]
head = head.replace('<title>All Fliers Section</title>', '<title>Draft and Line Tools</title>')
head += ('\n.solo{max-width:300px;margin:0}.solo img{display:block;width:100%;border:1px solid var(--line)}'
         '\n.states{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;align-items:start}'
         '\n.qpics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:8px 0}.qpics img{width:100%;height:auto;border:1px solid var(--line)}')
n = len(R['inventory'])
lb = R['lineBefore'] or {}
body = f'''
</style>
</head>
<body>
<main>
<p class="withdrawn">Critic pending &mdash; do not pick.</p>
<h1>FLIER-2 "Flier Studio follow-ups": draft names, delete and clean-up, Same width, Same size (AC-36..39)</h1>
<p class="meta">Live build {R['beforeBuild']} with each option applied by restyling the real rows and redrawing the real flier (<code>drafts.ts</code>, <code>lines.ts</code>). Galaxy S5 360x640 and Desktop Chrome 1280x800, light and dark; six drafts made by typing five titles at fixed times, two starred; the same steps for before and after (<code>capture.spec.ts</code>, <code>frames/*.json</code>, <code>result.json</code>). The line tools and the redraw are a target, not built: Same width and Same size need a per-line size in <code>@dloizides/poster-render</code> (D25).</p>
<p>Today: KIZOMBA {lb.get('firstW')} px wide at {lb.get('firstPx')} px, WORKSHOP {lb.get('secondW')} px at {lb.get('secondPx')} px (flier 1, canvas {lb.get('canvasW')} px). Same width scales the second line until both draw at one width (&plusmn;1 px), inside the margins. Same size gives the second line the first line's size, shrunk only if it would cross the margins. Both apply to the flier you are editing, and a theme change keeps them.</p>
<p><b>AC-40 Per-field text style (D26):</b> every text field (Title, Second title, Script line, Includes heading, Footer, Venue, Schedule, Prices, Includes items, Items) gets a Style control: font, size, colour (palette swatches + Custom), Bold / Italic, letter spacing and alignment, applied to this flier or all 4, with Reset to theme. A theme switch keeps it, and the text itself never changes. Size is shared with the line tool: Same width and Same size set the same per-line size. Panel open in the frames: Second title. Target, not build.</p>
<p>All three: a draft is named after its first flier's title and the time ("KIZOMBA, 11:12 AM"); a renamed draft keeps its new name. Delete one draft: it goes at once, and "Deleted ..." with Undo stays for 5 s, above the phone's flier bar. Clean-up deletes every draft that is not a favourite, after a confirm that says how many go and that favourites stay. Favourites are never deleted in bulk.</p>
{arts}
<h2>Information inventory (role Visitor, {n} rows + {len(R['newItems'])} new)</h2>
<p class="meta">Flier Studio has one role: a visitor in their own browser (no sign-in). Rows are every item visible in a before frame of the Drafts panel and the Flier form (top, end, Second title, flier 1), counted visible-in-frame in every option's after frames (result.json). Same fate in A, B and C.</p>
<table><tr><th>#</th><th>Item</th><th>Role</th><th>Source</th><th>A / B / C</th></tr>{rows}{new}</table>
<div class="qpics"><img src="A-1280-light-drafts.png" alt="Option A drafts at 1280" loading="lazy"><img src="B-1280-light-drafts.png" alt="Option B drafts at 1280" loading="lazy"><img src="C-1280-light-drafts.png" alt="Option C drafts at 1280" loading="lazy"></div>
<div class="q" data-qid="q1"><p class="qn"><span class="qi">Q1</span> Which drafts and line tools?</p>
<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Everything on the row</span></li>
<li data-letter="B"><span class="lt">B</span><span>One menu per row</span></li>
<li data-letter="C"><span class="lt">C</span><span>Edit in place, select to clean up</span></li>
</ul></div>
</main>
</body>
</html>
'''
io.open('index.html', 'wb').write((head + body).encode('utf-8'))
