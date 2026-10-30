# FLIER-2 "Flier Studio follow-ups": kizomba-sample PNG text-style parity (critique, 2026-10-29, round png-2)

Scope (owner D33): **text style only**, same rubric as round 1 (`critique-2026-10-29-png.md`). Wording and photo ignored.
Reference: `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/Ismini sample whatsapp.jpeg` (900x1600, values x1.2).
Renders: `.../fliers/{workshop-20261031,workshop-20261107,workshop-20261129,upcoming-workshops}-kizomba-sample.png` (1080x1920), poster-render 0.8.0, flier-studio 5e6ade4.
Method: ink-row scan (lum < 215, pins/icons < 225) of the left column, x40-770.
Accepted constraints (parent brief): title width capped by photo hair + logo; date width set by the longer preset wording.

Hard fails: inventory n/a (`noloss: allow`, fixed text, D33); no form rows. No hard fail.

## Measurements, dated renders (1031; 1107 and 1129 identical except date band 93/92 tall)

| Element | Reference (x1.2) | Round 1 | Round 2 | Status |
|---|---|---|---|---|
| KIZOMBA cap height | 182 | 110 | 148 (y99-246), 48%W | -19%, inside the width cap: accepted |
| WORKSHOP cap height | 198, larger than line 1 | 110 | 163 (y375-537), 66%W | -18%; size step back (1.10 vs ref 1.09) |
| Date script band | 128, monoline casual script | 88, hairline copperplate | 97 (y266-362), 66%W, still high-contrast formal script | -24%; **face class still wrong** |
| Gap KIZOMBA to date | 19 | 54 | 20 | match |
| Gap date to WORKSHOP | 13 | 13 | 13 | match |
| Gap WORKSHOP to divider 1 | 32 | 102 | 33 | match |
| Dividers | ~5px, staggered 668/572/480/390/366 | 2-3px, all 411 | 5px; 667/571/479/389/365 | match |
| Venue text | one line, 47 tall, x162 | two lines, x202 | one line, 41 tall, x202-706 | line fixed; start 40px late |
| Venue pin | 80 tall, text centred on it | 96 | 98 tall (y606-703), centre y655 | **text centre y623 sits 32px above pin centre** (ref: aligned within ~1px) |
| Pin to text gap | ~34 | 64 | 64 (pin right x138, text x202) | +30 |
| Row label (Beginners, with descender) | 66 | 45 | 58 | -12%, ok |
| Row label (Intermediates) | same as Beginners | 25 | 45 cap-to-baseline, same as Beginners | balanced, fixed |
| Time line | 40, medium | 25, bold | 41 (y859-899) | match |
| Text column right edge | x516 | x381 | x534 | match |
| Icon circles | 112 | 106 | 106 | ok |
| "5€" to sub-line gap | ~10 | 28 | ~27 (eyeballed) | still loose |

## Upcoming-workshops

| Element | Round 2 | Status |
|---|---|---|
| UPCOMING / WORKSHOPS cap | 137 / 136 (y35-171, y327-462) | under ref scale, logo-capped: accepted |
| Script "Kizomba" to WORKSHOPS | 13px gap (y314 -> 327) | near-collision fixed |
| WORKSHOPS to first divider | **114px** (y462 -> 576) | dead band; ref 32 |
| Dividers | 5px, x49-446 | fixed |
| Venue | row face, bare pin 75 tall, centres y650 / y656 | face and pin fixed, aligned; still **two lines** in a 397px column |
| Date scripts "Sat 31 Oct" etc. | 50 tall, same high-contrast script | same face issue as dated renders |
| Rows | 36 / 28 / 35 tall lines, one size per role | consistent |

No text clipped or overlapping in any render.

## Scores (style parity, 1-5)

| PNG | Title | Script | Rows | Dividers/icons | Balance | Mean | Verdict |
|---|---|---|---|---|---|---|---|
| workshop-20261031 | 4 | 3 | 4 | 3 | 4 | 3.6 | **REDO** |
| workshop-20261107 | 4 | 3 | 4 | 3 | 4 | 3.6 | **REDO** |
| workshop-20261129 | 4 | 3 | 4 | 3 | 4 | 3.6 | **REDO** |
| upcoming-workshops | 4 | 3 | 4 | 4 | 3 | 3.6 | **REDO** |

Round 1 means were 2.2 / 2.2 / 2.2 / 2.6. Every criterion is now >= 3; the mean bar (>= 4) is what fails.

## Top fixes (targets at 1080x1920)

1. **Date script face (all 4):** replace the high-contrast formal script with a monoline casual script (even stroke ~6px at this size, no hairlines), keep rgb(229,187,151). At the same 718px width a monoline face of this class runs taller per width; target band 97 -> >= 110px.
2. **Venue row (dated 3):** centre the text on the pin: text centre y623 -> y655 (move down 32px, or vertically centre the row box on the pin). Pin 98 -> 80px tall; text start x202 -> ~172 (pin-to-text gap 64 -> 34px). Price sub-line gap ~27 -> ~10px.
3. **Upcoming:** close WORKSHOPS-to-divider 114 -> 32px (lift venue and rows ~80px); venue on one line by widening its column from 397px to the ~640px the dated renders use.

NOT COVERED: stills only; font identity inferred from glyph shapes; JPEG reference is WhatsApp-compressed (±1px on thin strokes); the price sub-line gap was read by eye, not scanned.
