# FLIER-2 "Flier Studio follow-ups": kizomba-sample PNG text-style parity (critique, 2026-10-29, round png-1)

Scope (owner D33): **text style only**: face, weight, size vs H/W, colour, tracking, leading, position, icons, dividers. Wording and photo ignored.
Reference: `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/Ismini sample whatsapp.jpeg` (900x1600).
Renders: `.../fliers/{workshop-20261031,workshop-20261107,workshop-20261129,upcoming-workshops}-kizomba-sample.png` (1080x1920).
Both are 9:16, so every reference value is scaled x1.2 to the 1920 frame. Measured by an ink-row scan of the left column (threshold lum < 200-235), median ink colour per band.

Hard fails: inventory n/a (`noloss: allow`, fixed text, D33); no form rows. No hard fail. Verdict is on parity.

## Measurements (reference px at 1920 vs render px)

| Element | Reference (x1.2) | 20261031 / 1107 / 1129 render | Delta |
|---|---|---|---|
| Title line 1 "KIZOMBA" cap height | 182 (9.5%H), width 54%W | 110 (5.7%H), width 38%W | **-40%** |
| Title line 2 "WORKSHOP" cap height | 198 (10.3%H), width 59%W; larger than line 1 | 110, width 40%W; same as line 1 | **-44%**, lost the size step between line 1 and line 2 |
| Title colour | rgb(109,100,93) | rgb(109,100,93) | match |
| Title face | heavy condensed grotesque, width/cap ratio 2.97 for KIZOMBA | condensed grotesque, ratio 3.73 | render is wider for its height: tighter tracking or narrower face needed |
| Date script band (with descenders) | 128 tall, 55%W wide | 88 tall, 40%W | **-31%** |
| Date script face | monoline casual script, even ~6px stroke, legible | high-contrast copperplate script, ~2px hairlines | wrong face class |
| Date colour | rgb(228,187,152) | rgb(229,187,151) | match |
| Gap KIZOMBA to date | 19 | 54 | +35 too loose |
| Gap date to WORKSHOP | 13 | 13 | match |
| Gap WORKSHOP to first divider | 32 | 102 | **+70 dead band** |
| Divider thickness | ~5 | 2-3 | too thin |
| Divider lengths | staggered, following the photo edge: 668, 572, ~480, ~390, ~366 | all 411 (x49-460) | stagger lost |
| Divider colour | rgb(217,189,168) | rgb(213,188,168) | match |
| Venue text | ONE line, 47 tall, starts x162, rgb(90,79,73) | TWO lines (36 + 24), starts x202 | split + two sizes |
| Venue pin | 80 tall, bare (no circle) | 96 tall, bare | +20%, ok-ish |
| Icon circle diameter | 112, rgb(205,163,131) | 106, rgb(204,163,131) | -5%, ok |
| Row label ("Beginners") | 66 tall, semibold condensed, rgb(71,55,50) | 45 tall, rgb(69,55,47) | **-32%** |
| Row label ("Intermediate…") | same size as "Beginners" | **25 tall** (shrink-to-fit in a 381px-wide column) | unbalanced: second row label is 55% of the first |
| Time line | 40 tall, medium weight, rgb(178,136,109) | 25 tall, bold, rgb(173,129,100) | -38%, heavier |
| Text column right edge | x516 (48%W) | x381 (35%W) | column too narrow, causes the shrink above |
| Price "5€" to sub-line gap | tight, about 10 | 28 | loose |

`upcoming-workshops-kizomba-sample.png` (different layout, same style rules):
- "UPCOMING" cap 144 (7.5%H), "WORKSHOPS" cap ~135, width 50%W: closer to the reference scale but still under it.
- Script "Kizomba" between the title lines: its descender (y ~325) reaches the top of "WORKSHOPS" (y ~330), a near-collision.
- Dividers are 8px and rgb(173,129,100): darker and thicker than both the reference and the other three renders.
- The venue is set in the heavy condensed TITLE face (Oswald-like), not the row face; the pin sits in a filled circle, which the reference does not have. Both differ from the 3 dated renders.
- Bottom line "Classes by Jimmy & Ismini" ends about 60px from the bottom edge: tight, no clipping.

Clipped / overlapping: no text is clipped in any render. Near-collision: upcoming "Kizomba" descender against WORKSHOPS. Photo cutout jaggies near the feet (y ~1690) are noted only, since photo differences are out of scope.

## Scores (style parity, 1-5)

| PNG | Title | Script | Rows | Dividers/icons | Balance | Verdict |
|---|---|---|---|---|---|---|
| workshop-20261031 | 2 | 2 | 2 | 3 | 2 | **REDO** |
| workshop-20261107 | 2 | 2 | 2 | 3 | 2 | **REDO** (same measured band positions and sizes as 1031) |
| workshop-20261129 | 2 | 2 | 2 | 3 | 2 | **REDO** (same measured band positions and sizes as 1031) |
| upcoming-workshops | 3 | 2 | 3 | 2 | 3 | **REDO** |

## Top fixes (concrete targets at 1080x1920)

1. **Title scale:** KIZOMBA cap height 110 -> 182px (about 54%W wide); WORKSHOP 110 -> 198px (about 59%W), so line 2 is larger than line 1 as in the reference. Tighten tracking to a width/cap ratio of ~3.0. Pull the first divider up so the title-to-divider gap goes 102 -> 32px, and the KIZOMBA-to-date gap 54 -> 19px.
2. **Script face and size:** replace the hairline copperplate with a monoline casual script (even ~6px stroke at this size), band height 88 -> 128px, about 55%W wide; keep colour rgb(229,187,151).
3. **Info rows:** widen the text column right edge from x381 to x516 and use one size for every label: label 45 -> 66px tall (semibold condensed), time 25 -> 40px (medium, not bold). Put the venue on one line at 47px, starting at x162. Dividers 2-3 -> 5px, staggered to follow the photo edge (about 668 / 572 / 480 / 390 / 366px long), not a fixed 411px. Upcoming: same row face for the venue, a bare pin, dividers back to 5px rgb(213,188,168).

NOT COVERED: compared from stills only; font identity inferred from glyph shapes (no font metadata); the JPEG reference is WhatsApp-compressed, so divider thickness is ±1px.
