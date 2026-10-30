Mode: parity

# Build critique: FLIER-2 "Flier Studio follow-ups", D37 option A "Role list, open one"

AC-44 "Fonts by text role", AC-45 "Highlight on hover/focus". Critic: design-critic, 2026-10-30, build round 1.
Viewed: all 12 frames in `build/` (360 light/dark closed, open, peek; 1280 light/dark closed, open, hover), mockup `A-1280-light-open.png`, `critique-2026-10-29-r2.md`, inventory `FLIER-2-AC44-45-inventory.md` (41 rows, Visitor). Pixel crops and edge measurements taken on the PNGs (1280 frames are 1:1 CSS px; 360 frames are 3x device px).

## Verdict: REDO (hard fail: text overflow, `A-build-360-light-open.png` + `A-build-360-dark-open.png`)

Not scored, not ranked (OPTION-GATE-1 "No option reaches the owner if it loses a field or misaligns a form row"; TEXT-FIT-1 "UI text never overflows its box at 360x640 or desktop, in every state").

## Hard fails

| Check | Result | Evidence |
|---|---|---|
| Text fit | **FAIL** | 360 open (light and dark): the Size stepper value "100%" runs under the "+" button; the "%" is cut by the button's left border (device x ~700-815, "+" starts at x 811). Width stepper row shows the same pattern ("100%" at x ~285-395 against "+" at x 395). The gap between the two 44px buttons is ~42 CSS px, the text needs ~46. |
| Form rows (1px) | pass | 1280 open, measured top/bottom edges: Font select 471/515, Size "-" 471/515, "+" 471/515; Width "-"/"+" 547/591; swatches 623/667, Custom swatch 623/667; Bold 698/742, Italic 698/742, Letter spacing 698/742. |
| Hit boxes >= 44 | pass | Swatches 44x44 (x 150-194, 200-244, 250-294, 300-344, 350-394), Custom 44x44 (x 453-497), steppers 44x44, Bold/Italic 44 tall, role rows 46 tall at 1280, ~46 CSS at 360. |
| Inventory | **22/41 seen, 19 not captured** | Seen: all-fliers, all-fliers-row, all-fliers-toggle, all-fonts(+row), all-layout(+row), all-palette(+row), pick-theme, heading "Look of every flier", card note, nav-all, preview-1..4, preview-grid, mini-preview, mini-position, mini-see-all, mini-open. Not in any build frame: add-flier, all-ai-line, all-custom-layouts, Card folded, mini-highlighted, mini-see-marks, pick-scope, replace-apply/bar/count/find/matches/text/with/word, Replace hint, shared-fields, shared-state, "Shared text" heading. None is shown lost, but none is shown kept: the count cannot be written as 41/41 from these frames. |
| Pair parity | n/a | Build frames have no before pair and no `result.json` `pair` records in `build/`; the mockup pairs were checked in r2. |

## Other defects (fix in the same round)

1. **Outline hides another role's glyphs** (`A-build-1280-dark-open.png`, `A-build-1280-light-open.png`, flier 4): the Prices box around "Party pass 20€" / "Party pass 15€" has its top edge through the "Intermediates 21:00 - 22:00" line; in dark the word "Intermediates" is unreadable. The box also takes in "Party pass", which is the Price labels role: the cross-role hit r2 predicted for whole-line matching has shipped.
2. **Title outline runs through the date script** (`A-build-1280-light-hover.png`, all 4 fliers): the box bottom edge cuts the ascenders of "Saturday 31 October". Mockup r2: box sat on KIZOMBA without touching the next line.
3. **No outline in the dark 360 peek** (`A-build-360-dark-peek.png`): the light peek shows the dashed box round KIZOMBA, the dark peek shows the crop with no box at all. AC-45 is invisible on a phone in dark mode.
4. **Focus on open** (FOCUS-1 "Every screen names its initial focus"): open frames show the 3px ring on the "Prices" row toggle, not on the Font select. r2 top fix (2) not done.
5. **Hover frame shows no hover on the row**: 1280 hover outlines Title on the poster, but the Title row has no hover cue and the Prices row still carries the dark ring, so the eye reads "Prices" and sees KIZOMBA boxed.
6. **Custom colour shows black when unset**: the native colour swatch next to "Custom" is #000000 though Prices is on Theme; reads as "custom black is applied".

## Scores

Not scored (hard fail). For the designer's reading only, the non-gate picture: focal point and portability hold from r2 (role rows are this poster's parts); dark mode follows the same chrome with no new colour; no AI-default tells.

## Target table (build vs option A mockup, every measured gap)

| Element | Measured (build) | Target (mockup A / rule) | Delta |
|---|---|---|---|
| 360 Size value "100%" | ~46 CSS px text in ~42 CSS px gap, overlaps "+" by ~4 px | fits between buttons (TEXT-FIT-1) | -4 px; shrink to 15px tabular or widen gap to 52px |
| 360 Width value "100%" | same overlap | fits | -4 px |
| Prices outline extent | whole line ("5€ per hour", "20€ Party pass", "Party pass 20€") | amount only ("5€", "20€", "15€") | +~70 CSS px wide per box at 1280; includes Price labels role |
| Flier 4 Prices box top edge | crosses "Intermediates" line (y ~704) | clear of neighbouring lines | overlaps ~3 px |
| Title box bottom edge | crosses date-script ascenders (y ~70) | sits above date script | overlaps ~3-4 px |
| Outline style, 1280 dark | solid rounded grey ~2px | 2px dashed, as light | style differs |
| Outline, 360 dark peek | none visible | 2px dashed box | missing |
| Open row ring | 3px ink ring on row toggle | focus on Font select (FOCUS-1); row open state 2px | focus target wrong |
| Editor rows | Font+Size, Width+Drawn size, Colour, Weight+Letter spacing, note, Reset | Font+Size, Colour, Weight+Letter spacing, Reset + note on one row | +1 row (Width/Drawn size, +76 px); Reset moved below the note (+44 px) |
| Colour "Custom" | text label + 44px native swatch #000000 | bordered "Custom" button, 44px tall | control differs; swatch shows a value not applied |
| Role row height 1280 | 46 px | 44 px | +2 px (fine) |
| Role summary text | "Theme" for every role | face · size when set, "Theme" otherwise | state only, not a gap |

## Top fixes per frame

- **A-build-360-light-open / dark-open**: Size and Width value in a fixed 52px slot (`flex: none; min-width: 52px; text-align: center`) or font 15px tabular-nums; re-run `expectTextFits` on the open state (the probe missed it, as in r2 for C).
- **A-build-1280-light-open / dark-open**: outline per role line box (`lineBoxes` keyed by role), not per field line; inset the box 2px inside the line height so it never crosses the next line.
- **A-build-1280-light-hover / dark-hover**: give the hovered row the same 2px ink border the open row has, and drop the ring from the open row while another row is hovered; keep the Title box above the date script.
- **A-build-360-dark-peek**: draw the dashed box in the peek in dark mode (it is drawn on the light poster crop, so use the poster's ink, not the chrome token).
- **A-build-360-*-open, 1280-*-open**: move focus to the Font select on open.
- **All open frames**: Custom swatch shows the current role colour (theme colour when on Theme), not #000000.
- **Capture**: add frames that reach the rest of the card (Custom layouts, AI line, Shared text, Replace bar typed, card folded, mini see-marks/highlighted) so the inventory can be ticked 41/41 on the build.

NOT COVERED: live build not driven (frames only); outline timing (100 ms, 2 s tap) not judged from stills; 360 closed/peek dark frames read only for the peek strip; no real device; keyboard path through roles not walked; 19 inventory rows not in any build frame.
