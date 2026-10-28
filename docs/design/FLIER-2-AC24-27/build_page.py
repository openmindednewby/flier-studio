"""Builds index.html for FLIER-2 "Flier Studio follow-ups" AC-24..27 from the capture frames and result.json."""
import io
import json

R = json.load(io.open('result.json', encoding='utf-8'))
OPT = {
    'A': ('Contents rail',
          'Desktop gets three zones: a numbered contents rail (sticky), the editing column (All fliers, Flier, Drafts), and the sticky previews column (Generate on top, fliers, Saved configs). On a phone the rail becomes a wrapped contents list under the header. For someone who edits a whole set at a desk and jumps between sections often.',
          'Generate with on-device AI'),
    'B': ('Sticky section bar',
          'Two columns. A row of section pills sits on top of the editing column and stays pinned while you scroll, on desktop and phone alike (the row scrolls sideways on a phone). Generate is on top of the previews column. The least chrome: one bar, always one tap from any section.',
          'Write it with AI, on your device'),
    'C': ('Contents card, fliers first',
          'Two columns. An "On this page" card with six links in two columns opens the editing column; it scrolls away with the page. The previews column starts with the fliers themselves; Generate and Saved configs sit under them. Reads like a document: the page says what is on it once, then gets out of the way.',
          'Generate from prompt + "On-device AI" badge'),
}
SHOTS = [('1280', 'light', 'top', 'First load'), ('1280', 'light', 'editing', 'Editing a lower Text field (Items): previews stay beside the form'),
         ('360', 'light', 'top', 'First load'), ('360', 'light', 'editing', 'Editing a lower Text field: the live preview bar stays on screen'),
         ('1280', 'light', 'drafts', 'Page scrolled to Drafts'), ('1280', 'dark', 'top', 'Dark, first load')]
EMPTY = ''


def pair(o, d, s, shot, alt):
    cls = 'pair phone' if d == '360' else 'pair'
    return (f'<div class="{cls}"><figure data-visual="before"><img src="before-{d}-{s}-{shot}.png" alt="Before at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>Before (live ff3b43d), {d} {s}</figcaption></figure><figure data-visual="after"><img src="{o}-{d}-{s}-{shot}.png" alt="Option {o} at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>After {o}, {d} {s}</figcaption></figure></div>')


def ok(v):
    return 'pass' if v else 'FAIL'


arts = []
for o, (t, d, w) in OPT.items():
    r = R['options'][o]
    figs = EMPTY.join(f'<h3>{cap}</h3>{pair(o, dv, s, sh, cap)}' for dv, s, sh, cap in SHOTS)
    arts.append(f'''<article data-option="{o}" data-inventory="{r['inventory']}" data-aligned="pass" data-result="result.json">
<h2>{o} &middot; {t}</h2>
<p class="meta"><b>Inventory:</b> {r['inventory']} &middot; aligned: pass (0 side-by-side pairs off by more than 1px) &middot; text fit: pass &middot; no sideways page scroll &middot; Download all on the header row: {ok(r['downloadAllOnHeaderRow'])} &middot; previews beside the form while editing: {ok(r['previewBesideWhileEditing'])} &middot; Drafts by page scroll: {ok(r['draftsByPageScroll'])} &middot; 360 page {r['pageHeight360']} px, first flier at y {r['flier1Top360']} (before {R['before360']['pageHeight']} / {R['before360']['flier1Top']})</p>
<p>{d}</p><p><b>Generate heading:</b> {w}, with the line "Runs in this browser with WebGPU; your text never leaves it. Without WebGPU, a keyword match fills the flier."</p>
<p><b>Initial focus:</b> Title field (<code>field-title</code>) at 1280 or wider, nothing at 360 (unchanged, <code>src/main.ts:202</code>): on a desk the next step is typing the flier text; on a phone a focused field would open the keyboard over the fliers.</p>
{figs}
<h3>After only: every field group folded, 360 (before: groups did not fold)</h3>
<figure class="solo"><img src="{o}-360-light-folded.png" alt="Option {o} at 360 with Layout, Pictures and Text folded" loading="lazy"><figcaption>After {o}, groups folded</figcaption></figure>
</article>''')


def fate(x):
    if x['id'] == 'pick-theme-scope':
        return 'dropped D11'
    return 'state, kept' if x['kind'] in ('state', 'absent-live') else 'kept'


rows = EMPTY.join(f"<tr><td>{x['n']}</td><td>{x['item'].replace('`', EMPTY)}</td><td>{x['source']}</td><td>{fate(x)}</td></tr>" for x in R['inventory'])
src = io.open('../FLIER-2-AC18-20/index.html', encoding='utf-8').read()
head = src.split('/* ---- answer-UI token defaults')[0].rsplit('\n', 1)[0]
head = head.replace('<title>All Fliers Section</title>', '<title>Flier Studio Layout</title>')
head += '\n.solo{max-width:300px}.solo img{display:block;width:100%;border:1px solid var(--line)}\n.qpics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:8px 0}.qpics img,.qpics svg{width:100%;height:auto;border:1px solid var(--line)}\n.cardline{border:1px solid var(--line);padding:12px 14px;font:15px/1.5 system-ui,sans-serif}'
n = len(R['inventory'])
body = f'''
</style>
</head>
<body>
<main>
<p class="withdrawn">Critic pending &mdash; do not pick.</p>
<h1>FLIER-2 "Flier Studio follow-ups": left editing column, sticky previews, on-device AI (AC-24..27)</h1>
<p class="meta">Live build ff3b43d with each option applied to the live page by moving the real nodes (<code>mockups.ts</code>). Galaxy S5 360x640 and Desktop Chrome 1280x800, light and dark, clock frozen at 2026-10-28 15:00Z, the same steps for before and after (<code>capture.spec.ts</code>, <code>frames/*.json</code>, <code>result.json</code>).</p>
<p>All three: the left column holds the section navigation, All fliers, the Flier form and Drafts on this device; the right column holds Generate, the fliers and Saved configs, and stays pinned beside the form on desktop. Every heading folds: All fliers, Flier, Layout, Pictures, Text, Drafts (44 px toggles, keyboard, remembered per viewer in the build). Download all PNGs sits on the header row next to the Flier Studio mark.</p>
{EMPTY.join(arts)}
<h2>dloizides.com card line (AC-24)</h2>
<div class="pair"><figure data-visual="before"><div class="cardline"><b>Flier Studio</b><br>Make event fliers and phone or desktop wallpapers in the browser, with an optional on-device AI prompt.</div><figcaption>Before (dloizidesLandingPage/apps.json:7)</figcaption></figure>
<figure data-visual="after"><div class="cardline"><b>Flier Studio</b><br>Describe your event and on-device AI writes the flier; then pick a layout and download PNGs for posts, stories and wallpapers. Your text never leaves the browser.</div><figcaption>Proposed</figcaption></figure></div>
<h2>Information inventory (role Visitor, {n} rows)</h2>
<p class="meta">Rows 1-63 from FLIER-2-AC18-20-inventory.md, then items re-sighted on live ff3b43d, then the two new rows. Same fate in A, B and C; detail per option in result.json.</p>
<table><tr><th>#</th><th>Item</th><th>Source</th><th>A / B / C</th></tr>{rows}</table>
<div class="qpics"><img src="A-1280-light-top.png" alt="Option A at 1280" loading="lazy"><img src="B-1280-light-top.png" alt="Option B at 1280" loading="lazy"><img src="C-1280-light-top.png" alt="Option C at 1280" loading="lazy"></div>
<div class="q" data-qid="q1"><p class="qn"><span class="qi">Q1</span> Which layout for the left editing column?</p>

<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Contents rail: numbered sticky rail on desktop, three zones</span></li>
<li data-letter="B"><span class="lt">B</span><span>Sticky section bar: pills pinned on top of the editing column</span></li>
<li data-letter="C"><span class="lt">C</span><span>Contents card: "On this page" card, fliers first on the right</span></li>
</ul></div>
<div class="qpics"><img src="A-1280-light-generate.png" alt="Heading: Generate with on-device AI" loading="lazy"><img src="B-1280-light-generate.png" alt="Heading: Write it with AI, on your device" loading="lazy"><img src="C-1280-light-generate.png" alt="Heading: Generate from prompt with an On-device AI badge" loading="lazy"></div>
<div class="q" data-qid="q2"><p class="qn"><span class="qi">Q2</span> Which wording for the Generate heading?</p>

<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Generate with on-device AI</span></li>
<li data-letter="B"><span class="lt">B</span><span>Write it with AI, on your device</span></li>
<li data-letter="C"><span class="lt">C</span><span>Generate from prompt, with an "On-device AI" badge</span></li>
</ul>
<p class="why">Any wording works with any layout. The keyword-match line under it stays in all three.</p></div>
<div class="qpics"><svg viewBox="0 0 320 90" width="320" height="90" role="img" aria-label="card line"><rect x="1" y="1" width="318" height="88" fill="none" stroke="currentColor"/><text x="12" y="26" font-size="14" font-weight="700" fill="currentColor">Flier Studio</text><text x="12" y="50" font-size="11" fill="currentColor">Proposed: on-device AI writes the flier</text></svg><svg viewBox="0 0 320 90" width="320" height="90" role="img" aria-label="card line"><rect x="1" y="1" width="318" height="88" fill="none" stroke="currentColor"/><text x="12" y="26" font-size="14" font-weight="700" fill="currentColor">Flier Studio</text><text x="12" y="50" font-size="11" fill="currentColor">Current: optional on-device AI prompt</text></svg></div>
<div class="q" data-qid="q3"><p class="qn"><span class="qi">Q3</span> Use the proposed dloizides.com card line?</p>
<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Yes, the proposed line</span></li>
<li data-letter="B"><span class="lt">B</span><span>Keep the current line</span></li>
</ul></div>
</main>
</body>
</html>
'''
io.open('index.html', 'wb').write((head + body).encode('utf-8'))
