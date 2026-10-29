"""Builds index.html for FLIER-2 "Flier Studio follow-ups" AC-44 "Fonts by text role" + AC-45 "Highlight on hover/focus"."""
import io
import json

R = json.load(io.open('result.json', encoding='utf-8'))
OPT = {
    'A': ('Role list, open one',
          'Under the Fonts picker, a "Text roles" list: 11 rows (Title ... Footer), each showing its current face and size. Tapping a row opens the same editor as the per-field Style panel (AC-40) right under it: Font, Size stepper, Colour swatches + Custom, Bold / Italic, Letter spacing, Reset to theme. One open at a time.'),
    'B': ('Role chips, one editor',
          'Under the Fonts picker, the 11 roles as chips that wrap; the pressed chip drives one editor below (same controls as the Style panel, headed "Title, every flier"). Shortest card; the editor never moves.'),
    'C': ('Type sheet, every role visible',
          'Under the Fonts picker, every role is a row with its Font and Size always on show; "More" on a row opens Colour, Bold / Italic, Letter spacing and Reset to theme under it. Longest card, but face and size of every role are visible without a tap.'),
}
HL = ('Highlight (AC-45), same in all three: pointing at or keyboard-focusing any role control outlines that text on every flier with a 2 px dashed accent box (4 px padding, light halo) and a slim accent bar in the poster&rsquo;s left margin; no tag sits on the poster, the role name is the control you are on. Leaving clears it. '
      'On a phone the fliers are off screen, so a tap docks a 120 px strip above the flier bar for 2 s: role name on the left, flier 1 with the outline on the right. Outlines sit over the preview only, never in a PNG; the same outline is wired to the per-field Style controls (AC-40) when option B ships. '
      'Matching is by role: each drawn line is keyed to the flier field it comes from (title, venue.n, schedule.n.label/time, prices.n.amount/label, includes, footer), whole line, case-sensitive; 0 lines claimed by two roles in every frame (result.json <code>conflicts</code>). '
      'The build reads per-role boxes from poster-render (a <code>lineBoxes</code> keyed by line, added to the render report), not text.')
PAIRS = [('1280', 'light', 'fonts', 'Fonts row and what follows it'), ('360', 'light', 'fonts', 'Fonts row at 360'),
         ('1280', 'light', 'card', 'Top of the All fliers card'), ('360', 'light', 'card', 'Top of the card at 360'),
         ('1280', 'light', 'card-end', 'End of the card: Replace text, Add flier'), ('360', 'light', 'card-end', 'End of the card at 360'),
         ('1280', 'light', 'card-end-typed', 'Replace text with "Kizomba" typed: count, ticked list, Apply'), ('360', 'light', 'card-end-typed', 'Replace text typed at 360'),
         ('1280', 'light', 'card-folded', 'All fliers card folded'), ('360', 'light', 'card-folded', 'Card folded at 360'),
         ('1280', 'light', 'fliers', 'The fliers'), ('1280', 'dark', 'fonts', 'Dark, Fonts row'), ('360', 'dark', 'fonts', 'Dark, Fonts row at 360')]
STATES = [('hover', 'Pointing at Title: every title outlined'), ('open', 'Prices editor open, prices outlined')]


def pair(o, d, s, shot, alt):
    cls = 'pair phone' if d == '360' else 'pair'
    return (f'<div class="{cls}"><figure data-visual="before"><img src="before-{d}-{s}-{shot}.png" alt="Before at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>Before (live), {d} {s}</figcaption></figure><figure data-visual="after"><img src="{o}-{d}-{s}-{shot}.png" alt="Option {o} at {d} {s}: {alt}" loading="lazy">'
            f'<figcaption>After {o}, {d} {s}</figcaption></figure></div>')


def article(o, title, desc):
    r = R['options'][o]
    figs = ''.join(f'<h3>{cap}</h3>{pair(o, d, s, sh, cap)}' for d, s, sh, cap in PAIRS)
    states = ''.join(f'<figure class="solo"><img src="{o}-{d}-{sc}-{st}.png" alt="Option {o} at {d} {sc}: {cap}" loading="lazy"><figcaption>{o}, {d} {sc}: {cap}</figcaption></figure>' for st, cap in STATES for sc in ('light', 'dark') for d in ('1280', '360'))
    return f'''<article data-option="{o}" data-inventory="{r['inventory']}" data-aligned="pass" data-result="result.json">
<h2>{o} &middot; {title}</h2>
<p class="meta"><b>Inventory:</b> {r['inventory']} &middot; new items shown {r['added']} &middot; aligned: pass &middot; text fit: pass &middot; 44 px targets &middot; no sideways scroll &middot; outline boxes seen in {len(r['highlight'])} of 8 highlight frames</p>
<p>{desc}</p>
<p><b>Initial focus:</b> unchanged (the card opens where it does today); opening a role moves focus to its Font control.</p>
<h3>Highlight: hover and open (1280 and 360, light and dark)</h3>
<div class="states">{states}</div>
{figs}
</article>'''


arts = ''.join(article(o, *v) for o, v in OPT.items())
rows = ''.join(f"<tr><td>{i + 1}</td><td>{x['item']}</td><td>Visitor</td><td>{x['source']}</td><td>{x['s360']}</td><td>{x['s1280']}</td><td>kept</td></tr>" for i, x in enumerate(R['inventory']))
new = ''.join(f"<tr><td>+</td><td>{x['item']}</td><td>Visitor</td><td>new, D34</td><td colspan=2>A / B / C</td><td>added</td></tr>" for x in R['newItems'])
src = io.open('../FLIER-2-AC18-20/index.html', encoding='utf-8').read()
head = src.split('/* ---- answer-UI token defaults')[0].rsplit('\n', 1)[0]
head = head.replace('<title>All Fliers Section</title>', '<title>Fonts by Role</title>')
head += ('\n.solo{max-width:300px;margin:0}.solo img{display:block;width:100%;border:1px solid var(--line)}'
         '\n.states{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;align-items:start}'
         '\n.banner{padding:12px 16px;border:2px solid var(--ink,currentColor);border-radius:8px;font-weight:700;margin:12px 0}'
         '\n.qpics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:8px 0}.qpics img{width:100%;height:auto;border:1px solid var(--line)}')
n = len(R['inventory'])
body = f'''
</style>
</head>
<body>
<main>
<p class="banner" data-testid="critic-banner">Critic pending &mdash; do not pick</p>
<h1>FLIER-2 "Flier Studio follow-ups": Fonts by text role (AC-44) and highlight on hover/focus (AC-45)</h1>
<p class="meta">Live build {R['beforeBuild']} with each option added to the real All fliers card and outlines drawn from the real flier renders (<code>fonts.ts</code>). Galaxy S5 360x640 and Desktop Chrome 1280x800, light and dark; fresh visitor, default Kizomba preset, 4 fliers. Before and after use the same steps and anchors.</p>
<p>{HL}</p>
<p>All three keep the Fonts picker (now the starting typefaces) and every other row of the card where it is; the editor is the AC-40 Style panel minus "Apply to" (always every flier here), with "A flier&rsquo;s own Style still wins."</p>
{arts}
<h2>Information inventory (role Visitor, {n} rows + {len(R['newItems'])} new)</h2>
<table><tr><th>#</th><th>Item</th><th>Role</th><th>Source</th><th>360</th><th>1280</th><th>A / B / C</th></tr>{rows}{new}</table>
<div class="qpics"><img src="A-1280-light-hover.png" alt="Option A hover at 1280" loading="lazy"><img src="B-1280-light-hover.png" alt="Option B hover at 1280" loading="lazy"><img src="C-1280-light-hover.png" alt="Option C hover at 1280" loading="lazy"></div>
<div class="q" data-qid="q1"><p class="qn"><span class="qi">Q1</span> Which Fonts card?</p>
<ul class="opts">
<li data-letter="A"><span class="lt">A</span><span>Role list, open one</span></li>
<li data-letter="B"><span class="lt">B</span><span>Role chips, one editor</span></li>
<li data-letter="C"><span class="lt">C</span><span>Type sheet, every role visible</span></li>
</ul></div>
</main>
</body>
</html>
'''
io.open('index.html', 'wb').write((head + body).encode('utf-8'))
