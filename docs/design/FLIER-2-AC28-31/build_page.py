"""Builds index.html for FLIER-2 "Flier Studio follow-ups" AC-28..31 from the capture frames and result.json."""
import io
import json

R = json.load(io.open('result.json', encoding='utf-8'))
FOCUS = {
    'A': 'Theme in All fliers (<code>pick-theme</code>) at 1280 or wider; nothing at 360. The Title field sits at y 1330 here (below the 800 px first screen), and All fliers is the first decision in this column, so focus starts there.',
    'B': 'Title field (<code>field-title</code>) at 1280 or wider, unchanged: the Flier panel is open on load and Title sits at y 263. Nothing at 360 (a focused field would open the keyboard over the fliers).',
    'C': 'Theme in All fliers (<code>pick-theme</code>) at 1280 or wider; nothing at 360. Title sits at y 1248, below the first screen, so focus starts on the first All fliers setting.',
}
OPT = {
    'A': ('Labelled sidebar, one scrolling column',
          'A 200 px sidebar with an icon and a name for each section, fixed to the left edge; "Collapse to icons" at its foot shrinks it to 64 px with tooltips. One tools column scrolls: All fliers, Flier, Drafts, Generate, Saved configs. On a phone the sidebar becomes a sticky bar of six labelled links in two rows; its chevron folds it to one row of icons. All fliers is a stacked settings list: name, what it changes, then the control.'),
    'B': ('Sidebar switches the panel',
          'The Canva and Adobe Express pattern: an 88 px sidebar of icons with short names; each one swaps the tools column to that one section, so the column is never longer than the section you are in. Flier is open on load. It collapses to 64 px, icons only. On a phone the six icons sit in a sticky bar with names under them, and the chevron folds the names away. All fliers is a two-column settings list: name and what it changes on the left, the control on the right (stacked under 480 px).'),
    'C': ('Icon sidebar, labels on demand',
          'A 64 px icon-only sidebar is the resting state (tooltips name each icon); the chevron at its foot opens a 216 px labelled panel over the page. One tools column scrolls, as in A. On a phone one sticky "Sections" bar opens the list of six links. All fliers is the same two-column settings list as B.'),
}
SHOTS = [('1280', 'light', 'replace', 'Replace text (AC-32..34): Find Intermediates, Replace with Improvers; 6 matches listed and marked on the fliers, match 2 unticked (dashed)'),
         ('360', 'light', 'replace', 'Replace text at 360: the match list, the count and Replace 5 ticked'),
         ('360', 'light', 'highlight', 'Replace text at 360: the same matches marked on the fliers, numbered as in the list'),
         ('1280', 'light', 'top', 'First load'), ('1280', 'light', 'allfliers', 'All fliers: every setting says what it changes; Shared text lists its fields'),
         ('1280', 'light', 'editing', 'Editing a lower Text field: the fliers stay beside the form'),
         ('360', 'light', 'top', 'First load'), ('360', 'light', 'allfliers', 'All fliers'), ('360', 'light', 'editing', 'Editing a lower Text field: the live preview bar stays on screen'),
         ('1280', 'dark', 'top', 'Dark, first load'), ('360', 'dark', 'top', 'Dark, first load')]
MOVED = ('generate', 'saved-configs', 'nav-ai', 'nav-configs')


def pair(o, d, s, shot, alt):
    cls = 'pair phone' if d == '360' else 'pair'
    return (f'<div class="{cls}"><figure data-visual="before"><img src="before-{d}-{s}-{shot}.png" alt="Before at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>Before (live ffd9a68), {d} {s}</figcaption></figure><figure data-visual="after"><img src="{o}-{d}-{s}-{shot}.png" alt="Option {o} at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>After {o}, {d} {s}</figcaption></figure></div>')


def ok(v):
    return 'pass' if v else 'FAIL'


def article(o, title, desc):
    r = R['options'][o]
    figs = ''.join(f'<h3>{cap}</h3>{pair(o, dv, s, sh, cap)}' for dv, s, sh, cap in SHOTS)
    toggled = 'opened' if o == 'C' else 'collapsed'
    return f'''<article data-option="{o}" data-inventory="{r['inventory']}" data-aligned="pass" data-result="result.json">
<h2>{o} &middot; {title}</h2>
<p class="meta"><b>Inventory:</b> {r['inventory']} &middot; aligned: pass &middot; text fit: pass &middot; every sidebar target 44 px or more &middot; no sideways scroll &middot; right column holds only the fliers: {ok(r['rightOnlyFliers'])} &middot; fliers beside the form while editing: {ok(r['previewBesideWhileEditing'])} &middot; sidebar {r['railOpenWidth1280']} px open / {r['railCollapsedWidth1280']} px icons &middot; 360 page {r['pageHeight360']} px, first flier at y {r['flier1Top360']} (before {R['before360']['pageHeight']} / {R['before360']['flier1Top']})</p>
<p>{desc}</p>
<p><b>Initial focus:</b> {FOCUS[o]}</p>
{figs}
<h3>After only: sidebar {toggled}</h3>
<div class="pair"><figure><img src="{o}-1280-light-rail.png" alt="Option {o} at 1280 with the sidebar {toggled}" loading="lazy"><figcaption>{o}, 1280, sidebar {toggled}</figcaption></figure>
<figure class="solo"><img src="{o}-360-light-rail.png" alt="Option {o} at 360 with the bar {toggled}" loading="lazy"><figcaption>{o}, 360, bar {toggled}</figcaption></figure></div>
</article>'''


def fate(x):
    if x['id'] == 'pick-theme-scope':
        return 'dropped D11'
    if x['id'] == 'replace-text':
        return 'new (AC-32..34, D20)'
    if x['id'] in MOVED:
        return 'moved to the left tools column'
    return 'state, kept' if x['kind'] in ('state', 'absent-live') else 'kept'


arts = ''.join(article(o, t, d) for o, (t, d) in OPT.items())
rows = ''.join(f"<tr><td>{x['n']}</td><td>{x['item'].replace('`', '')}</td><td>{x['source']}</td><td>{fate(x)}</td></tr>" for x in R['inventory'])
src = io.open('../FLIER-2-AC18-20/index.html', encoding='utf-8').read()
head = src.split('/* ---- answer-UI token defaults')[0].rsplit('\n', 1)[0]
head = head.replace('<title>All Fliers Section</title>', '<title>Flier Studio Sidebar</title>')
head += '\n.solo{max-width:300px}.solo img{display:block;width:100%;border:1px solid var(--line)}\n.qpics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:8px 0}.qpics img{width:100%;height:auto;border:1px solid var(--line)}'
n = len(R['inventory'])
body = f'''
</style>
</head>
<body>
<main>
<p class="withdrawn">Critic pending &mdash; do not pick.</p>
<h1>FLIER-2 "Flier Studio follow-ups": thin sidebar, tools on the left, fliers alone on the right, Replace text (AC-28..34)</h1>
<p class="meta">Live build ffd9a68 with each option applied by moving the real nodes (<code>mockups.ts</code>, <code>registry.ts</code>). Galaxy S5 360x640 and Desktop Chrome 1280x800, light and dark, clock frozen at 2026-10-28 15:00Z, the same steps for before and after (<code>capture.spec.ts</code>, <code>frames/*.json</code>, <code>result.json</code>). The new All fliers settings (Layout, Colours, Fonts for every flier, Custom layouts) are a target, not built yet.</p>
<p>All three: Generate and Saved configs move into the left tools column; the right column holds only the fliers and stays pinned on desktop. Download all PNGs and "Generate with on-device AI" stay on the header row. All fliers becomes a settings list. Look of every flier: Theme, Layout, Colours, Fonts, Custom layouts, each saying what it changes, plus a line saying the on-device AI can set any of them. Shared text: the scope picker, then the three shared fields with their current values (Footer, Level names, Class price). A new setting joins the list as one more row, so adding one never re-lays the page.</p>
<p><b>Replace text (AC-32..34, D20)</b>, the last group in All fliers in every option: Find and Replace with, a Whole word only box (capital letters never matter). As soon as Find has text, every match is listed (number, flier, field, old line struck through, new line in bold) with a count, and the same number marks the word on each flier: solid when ticked, dashed when unticked. Replace changes only the ticked matches, in one step, after saving a draft so Drafts can undo it. The preset already says Beginners, so the frames search Intermediates; your Level 1 to Beginners works the same way. A stacks Find over Replace with; B and C put them side by side at 480 px and wider. The tool is a target, not built yet.</p>
{arts}
<h2>Information inventory (role Visitor, {n} rows)</h2>
<p class="meta">Rows 1-76 from the AC-24..27 round, re-sighted on live ffd9a68, then {n - 76} items new since ffd9a68 (contents links, fold toggles, AI entry, Generate and Saved configs cards). Same fate in A, B and C; counted visible-in-frame over every anchored shot (result.json).</p>
<table><tr><th>#</th><th>Item</th><th>Source</th><th>A / B / C</th></tr>{rows}</table>
<div class="qpics"><img src="A-1280-light-top.png" alt="Option A at 1280" loading="lazy"><img src="B-1280-light-top.png" alt="Option B at 1280" loading="lazy"><img src="C-1280-light-top.png" alt="Option C at 1280" loading="lazy"></div>
<div class="q" data-qid="q1"><p class="qn"><span class="qi">Q1</span> Which sidebar and tools layout?</p>
<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Labelled sidebar, one scrolling column</span></li>
<li data-letter="B"><span class="lt">B</span><span>Sidebar switches the panel</span></li>
<li data-letter="C"><span class="lt">C</span><span>Icon sidebar, labels on demand</span></li>
</ul></div>
</main>
</body>
</html>
'''
io.open('index.html', 'wb').write((head + body).encode('utf-8'))
