# FLIER-2 "Flier Studio follow-ups": kizomba-sample PNG text-style parity (critique, 2026-10-29, round png-3)

Scope (owner D33): **text style only**, same rubric as rounds 1-2 (`critique-2026-10-29-png.md`, `critique-2026-10-29-png-r2.md`). Wording and photo ignored.
Reference: `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/Ismini sample whatsapp.jpeg` (900x1600, values x1.2).
Renders: `.../fliers/{workshop-20261031,workshop-20261107,workshop-20261129,upcoming-workshops}-kizomba-sample.png` (1080x1920), poster-render 0.9.0, flier-studio 5e14dde.
Method: ink-row scan (lum < 215; pin/venue < 225), left column only, photo columns excluded (x <= 560 below the title, x150-700 for venue text). Reference scanned the same way, then x1.2.
Round rule (brief): third round for the date-script and venue criteria, so a fail there is **ESCALATE**, not REDO.

Hard fails: inventory n/a (`noloss: allow`, fixed text, D33); no form rows; no before/after pair in scope. No hard fail.

## What round 3 fixed

| r2 fix | r3 measured | Status |
|---|---|---|
| Date band 97 -> >= 110 | 125 (y265-389, with descender), 1107/1129: 119 | size fixed |
| Dated venue text centre 32px above pin | pin y622-701 cy661.5, text y641-682 cy661.5 | **fixed, 0px** |
| Pin 98 -> 80 | 80 (ref 80-82) | fixed |
| Pin-to-text gap 64 -> 34 | 38 (pin right x121, text x159; ref 36) | fixed |
| Price sub-line gap ~27 -> ~10 | 11 (5€ y1192-1240, sub y1251-1279); 20€ 11 | fixed |
| Upcoming WORKSHOPS-to-divider 114 -> 32 | 32 (y491 -> 523) | fixed |
| Upcoming venue two lines | one line, x173-606 | fixed |

## FULL remaining target table (1080x1920 px)

| # | PNG | Element | Now | Target (ref x1.2) | Delta | Criterion |
|---|---|---|---|---|---|---|
| 1 | all 4 | Date script face class | high-contrast formal copperplate script, swash capitals ("O" of October, "N" of Nov), hairline p10 = 2px | monoline casual upright script, even stroke ~6px, no hairlines, no swash caps | face change | Script (**3rd round, ESCALATE**) |
| 2 | upcoming | Venue text vs pin centre | text y555-589 cy572, pin y557-635 cy596 | centres equal (+-1) | text 24px high: move down 24 | Venue (**3rd round, ESCALATE**) |
| 3 | upcoming | Pin-to-venue-text gap | 53 (pin right x120, text x173) | 36 | -17: text start x173 -> x156 | Venue |
| 4 | dated 3 | Venue text height | 42 (y641-682) | 47 | +5 (about 12% larger) | Venue |
| 5 | dated 3 | Venue to divider 2 | 38 (y701 -> 739) | 24 | -14 | Rows/spacing |
| 6 | dated 3 | Divider 2 to Beginners row | 47 (y743 -> 790) | 37 | -10 | Rows/spacing |
| 7 | dated 3 | KIZOMBA cap height | 148 | 182 | -34, inside the accepted width cap (logo) | Title, accepted |
| 8 | dated 3 | WORKSHOP cap height | 163 | 197 | -34, inside the accepted width cap (photo hair) | Title, accepted |
| 9 | dated 3 | Date script start x | 51 | 77 (ref indents the script ~8px past the title stem) | +26, optional | Script |
| 10 | upcoming | UPCOMING / WORKSHOPS caps | 149 / 136 | ref scale ~182-197 | logo-capped | Title, accepted |
| 11 | upcoming | Date scripts "Sat 31 Oct" etc. | 49-56 tall, same formal face as #1 | same face fix as #1 | face change | Script (ESCALATE with #1) |

Matches (no target): KIZOMBA-to-date gap 19 (ref 20) · WORKSHOP-to-divider 32 (ref 31) · divider-to-venue 23 (ref 24) · dividers 5px, staggered · pin 80 · venue one line · row labels and time lines unchanged from r2 (ok) · price sub-gap 11 · upcoming title-to-divider 32 · no text clipped or overlapping in any render.

## Scores (style parity, 1-5)

| PNG | Title | Script | Rows | Dividers/icons/venue | Balance | Mean | Verdict |
|---|---|---|---|---|---|---|---|
| workshop-20261031 | 4 | 3 | 4 | 4 | 4 | 3.8 | **ESCALATE** (script face, 3rd round) |
| workshop-20261107 | 4 | 3 | 4 | 4 | 4 | 3.8 | **ESCALATE** (script face, 3rd round) |
| workshop-20261129 | 4 | 3 | 4 | 4 | 4 | 3.8 | **ESCALATE** (script face, 3rd round) |
| upcoming-workshops | 4 | 3 | 4 | 3 | 4 | 3.6 | **ESCALATE** (script face + venue alignment, 3rd round) |

Means r1 -> r2 -> r3: 2.2 -> 3.6 -> 3.8 (dated), 2.6 -> 3.6 -> 3.6 (upcoming).
The dated renders miss the 4.0 bar on one criterion only: the script face. Size, spacing and venue are now at reference within a few px. Owner question to put on a pick page: keep the formal copperplate date script, or swap it for a monoline casual script like the sample (before/after of row 1).

NOT COVERED: stills only; font identity inferred from glyph shapes (stroke-run percentiles: render p10/50/90 = 2/7/9 px, ref 1/6/10 px, so the median weight matches and the difference is the hairline contrast and swash capitals, judged by eye); reference is WhatsApp-compressed JPEG (+-1px on thin strokes); 1107/1129 checked on the date band only (rest identical layout to 1031 per r2).
