# -*- coding: utf-8 -*-
"""LOGO-1 landing card refit: mark + wordmark + tagline centred inside the crop safe area.
Safe area (source px) = intersection of the live object-fit: cover crops measured in before.json:
360 card x 169..1111, 1280 card x 117..1163, info header covers from y ~675; 320 card adds x 222..1059.
Kept with a margin: x 230..1050, y 60..620."""
import io, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); BRAND = os.path.dirname(HERE)
sys.path.insert(0, BRAND); sys.path.insert(0, os.path.dirname(BRAND))
from gen_brand import TOK, TAG, R, svgdoc, lockup, outlined_ui
SAFE = (230, 60, 1050, 620)
inner, w, h, _ = lockup('r3', 210, TOK['text'], 'v')
TS, GAP = 34, 56
_, adv = outlined_ui(TAG, 0, 0, TS, '#6f655c', 400)
bw = max(w, adv); bh = h + GAP + TS
x = (SAFE[0] + SAFE[2] - bw) / 2; y = (SAFE[1] + SAFE[3] - bh) / 2
lx = x + (bw - w) / 2; tx = x + (bw - adv) / 2
tag, _ = outlined_ui(TAG, tx, y + h + GAP + TS * 0.8, TS, '#6f655c', 400)
card = R(0, 0, 1280, 800, f' fill="{TOK["page"]}"') + f'<g transform="translate({lx:.1f} {y:.1f})">{inner}</g>' + tag
io.open(os.path.join(HERE, '_card.svg'), 'w', encoding='utf-8').write(svgdoc(card, 1280, 800))
print(dict(lockup_w=round(w), lockup_h=round(h), tag_w=round(adv), block=[round(x), round(y), round(x + bw), round(y + bh)], safe=SAFE))
