Mode: parity

# Build critique round 3: FLIER-2 "Flier Studio follow-ups", D37 option A "Role list, open one"

AC-44 "Fonts by text role", AC-45 "Highlight on hover/focus", AC-46. Build flier-studio `ba5d541`. Critic: design-critic, 2026-10-30, build round 3.
Viewed: `build/` frames (22 re-captured 10:41 + 10 unchanged from r2), `seen-*.json`, r2 sheet `critique-2026-10-30-build-r2.md`, inventory `FLIER-2-AC44-45-inventory.md` (41 rows, Visitor), taste ledger `apps/flier-studio/docs/design/taste-ledger.md`. Pixel scans on PNGs (1280 = 1:1 CSS px; 360 = 3x device px).

## Verdict: PASS, mean 4.1, lowest #3 = 3

## Hard fails (all pass)

| Check | Result | Evidence |
|---|---|---|
| Overflow | pass | 360 open light + dark: Font is now a full-width row; Size row below it. Edge scan y 1270: "-" 140-270, "+" 810-942; card border 978-981. "+" ends 36 device px (12 CSS) inside the border. r2 hard fail closed. |
| Form rows (1px) | pass | 1280 open: Font select / Size "-" / "+" share top 469 and bottom 514; Width row 545/590; swatches + Custom 621/666; Bold, Italic, Letter spacing 696/741. 360: Size "-" and "+" share top (scan y 1250: 816 / 932 edges, same row). |
| Hit boxes >= 44 | pass | 360 Size buttons 132 device px wide = 44 CSS; 1280 steppers, swatches, Bold/Italic 44-45 px tall; role rows 46 px; "See all 4" ~44 CSS tall. |
| Inventory | **41/41** | 36 test-id rows found in the `seen-*.json` union (script match, 0 missing). 5 text rows on the picture: "Shared text" + Replace hint (`A-build-1280-light-card-end`), Card folded (`*-folded`), "Look of every flier" + card note (`A-build-1280-*-closed`, unchanged from r2). |
| Pair parity | n/a | Build-only frames, no before pair in `build/`. |

## Round 2 items, checked

| # | Round 2 item | Round 3 |
|---|---|---|
| 1 | 360 Size "+" past the card (hard fail) | Closed (above). |
| 2 | Stale ~4 px outline band over prices at card end | Closed: `A-build-1280-light-card-end` shows no outline on any flier. |
| 3 | Dark outline solid grey vs light dashed | Closed: `A-build-1280-dark-open` draws the same 2px dashed ink as light. |
| 4 | Flier 4 boxed whole "Party pass 20€" | Closed in extent: the box now targets "20€" / "15€" only. |
| 5 | Hovered and open rows both 2px | Closed: `A-build-1280-light-hover` Title row 2px, open Prices row 1px. |

## Non-blocking (for the designer, not gates)

1. **Prices outline drawn through the glyphs** (`A-build-1280-light-open`, `-dark-open`, 4x zoom): the box is shorter than the digits, so its top dash runs through "5€"; on fliers 2 and 3 the second-line box collapses to a pill over "15€" / "10€", which become unreadable; on flier 4 the box's left dash and its paper-coloured halo cover "ss" of "Party pass" and its top dash touches "Intermediates". The Title box (hover frame) and the 360 KIZOMBA peek are correct, so this is the Prices run's measured rect, not the outline style.
2. Crop-mark corners at the selected flier (360 add, 1280 grid) read as stray ticks against the grey page at 360; carried, unchanged since r2.
3. Editor still carries Width + Drawn size as its own row (carried from r1, not blocking).

## Scores

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | Fliers stay the centre at 1280; the open role row and its editor read first in the left column. |
| 2 | Portability | 4 | The role list named by the flier's own text (Title, Date script, Prices) and the outline on the poster are specific to this product. |
| 3 | Hierarchy, type, spacing, colour | 3 | Editor clean at both widths; the Prices outline hides the text it marks (non-blocking 1). |
| 4 | Visual-language rules | 4 | One chrome language, warm greys, accent only on the active rail item; dashed ink outline matches across themes. |
| 5 | Taste ledger | 4 | Fits D13/D29 (fewest labels, controls beside what they change, fliers first); nothing the ledger rejected reappears. |
| 6 | No AI-default tells | 5 | No violet, no gradient, no card skeleton, icons are line glyphs. |
| 7 | 360 + 1280 designed, text fits | 4 | Both designed; Size moved to its own row at 360; all text inside its boxes in every frame read. |
| 8 | Inventory true on the picture | 5 | 41/41 measured. |
| 9 | Games | n/a | |

Mean 33/8 = 4.1; every criterion >= 3. PASS.

## Target table (build vs option A mockup / rule, every measured gap)

| Element | Measured (build) | Target | Delta |
|---|---|---|---|
| 360 Size "+" right edge | device x 942 | <= 966 (card content box) | -24 device px, inside |
| 360 Font select | full content width 140-940 device | fits content box | 0 |
| Prices outline height, flier 1 "5€" | top dash at glyph mid-cap (~6 CSS px short) | box 2-4 px outside the run's line box | ~-8 CSS px tall |
| Prices outline, fliers 2-3 "15€"/"10€" | ~4 px tall pill over the digits | full line box round the amount | ~-10 CSS px tall |
| Prices outline, flier 4 left edge | dash + halo over "ss" of "Party pass" | left edge 2 px before "2"/"1" of the amount | ~+10 CSS px too far left |
| Outline style, dark vs light | both 2px dashed ink | same | 0 |
| Hover vs open row | hover 2px, open 1px | same | 0 |
| Outline after card end | none | none | 0 |

## Top fixes (non-blocking)

- **Prices outline (1280 open, both themes)**: measure the box from the amount run's line box (ascent to descent) plus 3 px padding, and drop the paper halo so it never covers the neighbouring "Party pass" word.
- **Crop marks at 360**: draw them at 50% ink or only round the hovered flier so they stop reading as stray ticks.

NOT COVERED: live build not driven (frames only); outline timing (100 ms in, 2 s tap) not judged from stills; 360 Width / Colour / Weight rows not in any 360 frame (only Font + Size visible above the sticky mini preview); 10 r2 frames (closed, folded, replace-typed) not re-captured, read from r2; keyboard walk through roles not done; no real device; Prices outline defect seen at 1280 only (360 peek showed Title).
