# FLIER-1 "Flier Studio" layout options: design-critic, round 1 (2026-10-27)

Blind, screenshot-only. Judged: `img/E-A..D-B.jpg` (after), `img/before-*.jpg` (before), `result.json` pair records,
a 2 s contact sheet of the target `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/1.mp4` (5 s, 478x850),
zoom crops of three collision zones. Captures are half scale (story 720x1280, phone 600x1298, desktop 1280x720);
pixel figures below are in capture px, real px = x2.

No taste ledger exists (`apps/flier-studio/docs/design/taste-ledger.md` and `KizombaWarrior/docs/design/` both absent)
and no flier `visual-language.md`: criterion 5 is scored against the target video + `user_design_taste.md` ("calm, decides
by seeing"); criterion 4 against the target's own rules (warm off-white ground, taupe condensed titles, peach script + accents,
one illustrated couple, no panels). Criterion 9 (games) does not apply. Criterion 7 is read as "every format fits its frame,
text fits"; the 360x640 / 1280x800 app viewports do not apply to an exported image.

## Hard fails (checked first)

| Option | Lost item (11 rows, inventory) | Form rows | Pair parity | Picture whole, nothing over it |
|---|---|---|---|---|
| E-A | 11/11 seen | 0 rows, pass | same route/state/fixture/viewport/anchor/crop | yes |
| E-B | 11/11 seen | 0 rows, pass | match | yes |
| E-C | 11/11 seen | 0 rows, pass | match | yes (arch is behind) |
| P-A | 11/11 seen (footer moved to top, above title) | 0 rows, pass | match | yes |
| P-B | 11/11 seen | 0 rows, pass | match | yes (arch behind) |
| D-A | 11/11 seen | 0 rows, pass | match | yes |
| D-B | 11/11 seen | 0 rows, pass | match | yes (arch behind) |

Seen per option: KIZOMBA, script date, WORKSHOP, Bailemos logo, pin + venue, Level 1/2 + times, 5€ per hour, 20€ Party
pass, "Party pass includes" + 3 items, "with Jimmy & Ismini", the couple. The desktop before shows 8/11 (prices,
includes, footer fall off the bottom): that is the old screen's state, identical in both pair records, not a parity break.
No hard fail. `data-inventory="11/11"` and `data-aligned="pass"` are true for all seven.

## Scores (1-5)

| # | E-A | E-B | E-C | P-A | P-B | D-A | D-B |
|---|---|---|---|---|---|---|---|
| 1 Focal point | 4 | 4 | 3 | 4 | 3 | 4 | 4 |
| 2 Portability | 4 | 4 | 3 | 4 | 3 | 4 | 3 |
| 3 Hierarchy/type/spacing | 4 | 3 | 3 | 4 | 3 | 3 | 2 |
| 4 Visual-language (target rules) | 5 | 4 | 3 | 4 | 3 | 4 | 3 |
| 5 Taste (target video) | 5 | 4 | 3 | 4 | 3 | 4 | 3 |
| 6 No AI tells | 5 | 5 | 4 | 5 | 4 | 5 | 4 |
| 7 Fits its frame, text fits | 4 | 4 | 4 | 4 | 4 | 4 | 3 |
| 8 Inventory true on the picture | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| **Mean** | **4.5** | **4.1** | **3.5** | **4.3** | **3.5** | **4.1** | **3.4** |
| **Verdict** | PASS | PASS | REDO | PASS | REDO | PASS | REDO |

## Per option

**E-A (picture right, story): PASS, rank 1 of 3.** Closest to the target: same column split, same type, couple whole and
uncut, the before's frosted includes card and top fade are gone. Evidence: couple 392,663 opaque px, 0 covered; text column
ends x~310, couple starts x~340. Weak spots: the couple is smaller than in the target (target head sits level with WORKSHOP's
baseline, here at y~580, below the second rule), leaving an empty block right of the venue (x 330-720, y 420-580); footer
"with Jimmy & Ismini" sits alone at bottom-left in low-contrast taupe.
Fixes (optional): 1) scale the couple ~1.2x anchored bottom-right so the bun reaches y~480, keeping >=24px clear of the level
times; 2) set the footer in the peach accent at the includes' size, directly under the 3 includes, not stranded at y 1245.

**E-B (picture left, story): PASS, rank 2.** Clean mirror, but two left edges (titles x=40, details x=413) split the page;
the narrow right column wraps "Kizomba dedicated / room" onto two lines; "per hour" sits ~13px from the man's shoulder.
Fixes (optional): 1) right-align the title block to x=680 so titles and details share the right column's edge; 2) widen the
detail column to start at x~395 so "Kizomba dedicated room" fits one line.

**E-C (text top, arch, story): REDO (taste, round 1).** The couple shrinks to 256,534 px (-35% vs E-A) and stops being the
focal point; the includes line floats between two bands and separates the header from the picture; the arch is a stock
template motif the target does not use; "per hour" touches the arch edge (0px gap, zoom crop).
Top fixes: 1) scale arch + couple 1.35x (arch ~520 capture px wide, couple from y~560 to the bottom); 2) move the includes
line up into the venue/levels band (one row under the levels), removing the third rule; 3) give both prices >=24px clearance
from the arch edge (drop "per hour" to 30px or stack under 5€ inside the margin).

**P-A (clock-clear, picture right, phone): PASS, rank 1 of 2.** Top 28% empty for the lock-screen clock, everything else is
E-A's composition; couple 463,326 px, largest of all. Prices merged to one line each ("5€ per hour") read faster.
Fix (optional): 1) the footer kicker above KIZOMBA (y~383) is 12px taupe and reads as noise; move it under the includes in peach.

**P-B (clock-clear, arch, phone): REDO (taste, round 1).** Same faults as E-C, sharper on a phone: couple 263,667 px (-43%
vs P-A), the whole text block crammed into y 620-810 while the top 28% is clear and the arch has ~70px headroom.
Top fixes: 1) scale arch + couple ~1.4x (arch ~420 capture px wide) so the couple fills y~760 to the bottom; 2) move
the includes line below the arch's top as a single row under the levels, not a separate band; 3) prices >=24px off the arch edge.

**D-A (details left, picture right, desktop): PASS, rank 1 of 2.** Three detail columns read well at 2560; couple 572,851 px,
whole. Weak spots: the couple's flat source bottom edge (trousers cut at the thigh) floats at y~685 of 720 (~70 real px
above the frame), so it reads as a crop; the logo floats at x~750 aligned to nothing.
Fixes (required before build, not a gate): 1) anchor the couple's bottom to y=720 (the canvas edge) so the source's cut sits on
the frame edge, as in every story/phone option; 2) put the logo on the title block's right edge (x~820, top aligned to KIZOMBA's cap height).

**D-B (centred arch, desktop): REDO (taste, round 1).** Script "Saturday 31 October" runs onto the arch panel ("r" crosses
the edge) and WORKSHOP's P touches it (zoom crop); the title block floats mid-left with ~300px of dead space below it; the
couple's flat bottom edge floats inside the arch at y~685; arch = stock motif.
Top fixes: 1) shrink the title block to end >=32px left of the arch (titles ~0.85x) or shift the arch +40px right;
2) anchor the couple's bottom to y=720 so the arch frames a picture that sits on the frame edge; 3) move "with Jimmy & Ismini"
under the includes on the right so the left column carries only the titles.

## Ranking
Event: E-A > E-B (E-C REDO). Phone: P-A (P-B REDO). Desktop: D-A (D-B REDO).
The arch family (E-C, P-B, D-B) fails on the same cause in all three formats: the arch shrinks the couple and adds a panel the
target does not have. If the owner wants an arch option on the pick page, it must be redrawn with the fixes above first.

## Not covered
- No taste ledger, no flier visual-language doc: criteria 4-5 judged against the target video only; `vf_measure.py` not run.
- OS chrome not simulated: iPhone lock-screen flashlight/camera buttons (bottom ~8%) will sit over the couple's legs in
  P-A/P-B; Windows desktop icons (left column) sit over D-A/D-B titles; macOS/taskbar not checked.
- Half-scale captures: text-fit and clearances read at 50%; a 1-2 real px collision would not be visible.
- Target motion (the .mp4 animates) not judged; only a 2 s still sheet.
- Dark mode, other palettes, other fonts, post/square formats and the list flier were not part of these options.
