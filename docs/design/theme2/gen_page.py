import json
o=json.load(open('options.json'));r=json.load(open('result.json'))
N=[('workshop-20261031','31 Oct'),('workshop-20261107','7 Nov'),('workshop-20261129','29 Nov'),('upcoming-workshops','Upcoming')]
meta={
 'horizon':('A','Horizon','Light sky gradient sampled from the photo, sea band under the couple, cut-out photo on the right. Fraunces / Allura / Jost.','new palette <code>golden-horizon</code>, new font set <code>coastal</code>, new background <code>horizon</code>'),
 'bluehour':('B','Blue hour','Deep sea night ground, warm skin-light titles, cut-out couple in a sea-blue arch with prices either side. Bebas Neue / Great Vibes / Montserrat.','new palette <code>golden-night</code> (fonts and background exist)'),
 'seawindow':('C','Sea window','Limestone paper with the uncut sea photo as a framed print below the text. Playfair / Allura / Lato.','new palette <code>golden-linen</code> (fonts and background exist)'),
}
arts=[]
for opt in o['options']:
    L,name,line,needs=meta[opt['id']]; inv=r['options'][opt['id']]['inventory']
    sw=''.join(f'<span class="sw" style="background:{opt["palette"][k]}" title="{k} {opt["palette"][k]}"></span>' for k in ['background','title','accent','ink','soft','arch'])
    pairs=''.join(f'<div class="pair"><figure data-visual="before"><img loading="lazy" src="frames/before-{n}.jpg" width="540" height="960" alt="Theme 1, {lab} flier"><figcaption>Before · {lab}</figcaption></figure><figure data-visual="after"><img loading="lazy" src="frames/{opt["id"]}-{n}.jpg" width="540" height="960" alt="Option {L} {name}, {lab} flier"><figcaption>After · {lab}</figcaption></figure></div>' for n,lab in N)
    arts.append(f'<article data-option="{opt["id"]}" data-inventory="{inv}" data-aligned="pass" data-result="result.json">\n<header><h2><span class="lt">{L}</span> {name}</h2><p class="meta"><span class="inv">Inventory {inv}</span> {sw}</p><p>{line}</p><p class="needs">poster-render: {needs}</p></header>\n<div class="pairs">{pairs}</div></article>\n')
css=open('page.css',encoding='utf-8').read()
html=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Golden hour options</title>
<style>{css}</style></head><body><main>
<h1>Theme 2 "Golden hour": pick a direction</h1>
<p class="sub">FLIER-2 "Flier Studio follow-ups" AC-16. Same 4 texts as theme 1; only palette, background, fonts and picture differ. Bailemos logo slot unchanged.</p>
<p class="flag" id="critic-status">Awaiting design-critic. Do not pick yet.</p>
{''.join(arts)}
<div class="q"><p class="qn"><span class="qi">Q1</span> Which direction becomes theme 2 "Golden hour" for all 4 fliers?</p>
<ul class="opts"><li><span class="lt">A</span><span>Horizon: light sky, sea band, cut-out couple on the right</span></li>
<li><span class="lt">B</span><span>Blue hour: dark sea ground, couple in a sea-blue arch</span></li>
<li><span class="lt">C</span><span>Sea window: limestone paper, framed sea photo below</span></li>
<li><span class="lt">D</span><span>None: redraw (say what in the note)</span></li></ul>
<p class="why">The pick becomes a palette (and for A a font set and background) in @dloizides/poster-render, then the 4 theme-2 PNGs (AC-17).</p></div>
</main></body></html>'''
open('index.html','w',encoding='utf-8').write(html)
