# FLIER-1 "Flier Studio" build check, round 5: design-critic (2026-10-28)

Blind, screenshot-only. (a) 13 PNGs from `@dloizides/poster-render` 0.2.6 (app da8d368), compared with `r4/` and
`critique-2026-10-28-build-r4.md`. (b) App before/after pairs on `index.html` (360 full, 360 previews, 1280 full) with
their `pair` records in `result.json` / `frames/*.json`. Same rubric and reading of criteria 4-5 as r4 (target video
rules; no taste ledger, no flier `visual-language.md`). Criterion 9 does not apply. Coordinates in display px ("disp").

## Hash diff vs r4

Identical: P-A-phone, list-story, picture-bottom-story (r4 verdicts carry: PASS). Changed: E-A/E-B story, post, square;
E-C-story; P-B-phone; D-A; D-B. Seen this round: E-A post, E-A square, E-B post, E-B square, D-A, P-B, E-C. Not opened:
E-A story, E-B story, D-B (changed, verdict carried from r4 with a NOT COVERED line).

## Hard fails (checked first)

| Item | Inventory | Form rows | Pair record | Verdict |
|---|---|---|---|---|
| 13 renders | 11/11 each (list 4/4); every item visible in the 7 seen | 0 rows | n/a | pass |
| app pairs (3 on page) | 21/21 + `pick-scale-value` new; `lost: []`; after-1280-full shows every field incl. Second title, Script line, Includes heading, Footer, Venue, Schedule, Prices, Includes, List rows, Add/Remove, Saved configs | Format/Colours, Fonts/Background, Upload picture/logo, Add/Remove, Config name/Save: shared top edge and height on the capture; records `misaligned: []` | before and after records exist for all 3 page pairs and are field-for-field equal (route `/`, first load flier 1 of 4, kizomba fixture, viewport, anchor page-top/previews, crop full-page/viewport) | pass |

## Scores

| # | E-A post | E-A square | E-B post | E-B square | D-A | P-B | E-C | app |
|---|---|---|---|---|---|---|---|---|
| 1 Focal point | 4 | 4 | 4 | 4 | 4 | 2 | 4 | 4 |
| 2 Portability | 3 | 3 | 3 | 3 | 3 | 3 | 4 | 3 |
| 3 Hierarchy/type/spacing | 4 | 4 | 4 | 4 | 4 | 2 | 3 | 4 |
| 4 Visual-language | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 3 |
| 5 Taste (target) | 4 | 4 | 4 | 4 | 4 | 2 | 4 | 3 |
| 6 No AI tells | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 7 Fits frame, text fits | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 |
| 8 Inventory | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| **Mean** | **4.0** | **4.0** | **4.0** | **4.0** | **4.0** | **3.0** | **4.0** | **3.75** |
| Verdict | PASS | PASS | PASS | PASS | PASS | REDO | PASS | ESCALATE |

Carried (unchanged or not opened): P-A, list, picture-bottom PASS; E-A story, E-B story, D-B PASS from r4.

Evidence, one line each:
- **E-A post / square:** r4 fix 1 landed. One text column x 50-490, couple ~0.5w on the right at ~0.75h, bottom on the
  frame edge; square right shoulder just touches x~1050 (acceptable). Post stacks label/value, square runs them inline.
- **E-B post / square:** mirrored; title and body now share one left edge (x~590), r4 fix 3 landed. Couple left arm at
  x~10, not cut.
- **D-A:** r4 regression fixed. Couple ~0.88h, x~1380-1920 disp, bottom on the frame edge; two text columns end x~1130.
  Logo floats mid-top (x~890) between title and picture; acceptable.
- **P-B (new defect):** levels now one column (r4 fix landed), but the whole block starts at y~590 of 2000 disp: the top
  29% of the phone frame is empty. Eye lands on blank paper, then title. "with Jimmy & Ismini" floats alone at y~1140
  right, aligned with nothing.
- **E-C:** prices flank the arch, couple is focal. Right column: includes end y~440, footer at y~755: ~300 disp px gap
  with the footer detached from the column. Holds at 4.0.
- **App:** r3/r4 structure fixes held; full-height captures prove every field kept. Only taste gap left: the teal
  accent (Download all PNGs, Generate, Save, selected ring, slider, focus ring) has no relation to the sand flier palette
  (#4=3, #5=3). This is the app's second taste REDO on the same item, so ESCALATE to the owner's accent pick page, not
  another round.

## Top fixes (none removes an inventory item)

**P-B phone (REDO, round 2 on this option but a new defect, so still REDO):**
1. Pin the title block to the top margin (title top at ~0.05h, as P-A does) instead of vertically centring the text
   block above the arch.
2. Put the footer under the includes list in the right column (gap ~40 px), not on the Level 2 baseline.

**E-C (PASS, optional):** move "with Jimmy & Ismini" up to ~40 px under "2 drinks".

**App (ESCALATE):** owner picks the accent: current teal vs the flier's sand/orange (venue rule colour) for primary
buttons, selected ring, slider and focus ring.

## NOT COVERED

- E-A story, E-B story, D-B changed since r4 but were not opened this round; verdicts carried from r4.
- The list layout's picture shrink on post/square has no render in this set (list exists only as story, unchanged), so
  it was not judged.
- app-before-*-full.png not re-opened (hash-identical to r4); pair parity judged from the records plus r4's pixel read.
- Form alignment from capture pixels and the recorded `misaligned: []`, not `expectFieldsAligned` run by me.
- Dark/alt palettes, other font/background options, hover/focus/error states, motion; no taste ledger (criterion 5 uses
  the target video rules).
