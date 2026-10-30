Mode: parity

# Build critique round 2: FLIER-2 "Flier Studio follow-ups", D37 option A "Role list, open one"

AC-44 "Fonts by text role", AC-45 "Highlight on hover/focus", AC-46. Critic: design-critic, 2026-10-30, build round 2.
Viewed: 32 frames in `build/` (360 + 1280, light + dark: closed, open, hover/peek, shared, card-end, add, replace-typed, folded), `seen-*.json`, round 1 `critique-2026-10-30-build.md`, inventory `FLIER-2-AC44-45-inventory.md` (41 rows, Visitor). Pixel scans on the PNGs (1280 = 1:1 CSS px; 360 = 3x device px).

## Verdict: REDO (hard fail: overflow, `A-build-360-light-open.png` + `A-build-360-dark-open.png`, Size "+" button)

Not scored, not ranked (OPTION-GATE-1 "No option reaches the owner if it loses a field or misaligns a form row"; TEXT-FIT-1 "UI text never overflows its box at 360x640 or desktop, in every state").

## Hard fails

| Check | Result | Evidence |
|---|---|---|
| Overflow | **FAIL** | 360 open, light and dark: the role editor card's right border is at device x 978-980 (rows y 950, 1000); the Size "+" button spans x 868-998, so it runs ~18 device px (~6 CSS px) past the card border, drawn over it (y 1060, 1100 scan finds the button edge at 996-998 and no card border). Round 1 fix widened the value slot ("100%" now fits at x 720-835 between "-" 686 and "+" 868) but the row did not shrink to fit: the extra width pushed "+" out of the card. |
| Text fit (value) | pass | "100%" clears both stepper buttons at 360 (gap 33 device px each side) and 1280. |
| Form rows (1px) | pass | 1280 light open, top/bottom edges: Font select 471/514, Size "-" 471/514, "+" 471/514; Width "-" / "+" 547/590; swatch 1 and Custom 623/666; Bold, Italic, Letter spacing 698/741. 360: Font select and Size buttons share top 1020. |
| Hit boxes >= 44 | pass | Steppers, swatches, Custom, Bold, Italic, Letter spacing 44 px tall (471-514); role rows 46 px; mini "See" and "See all 4" ~44 CSS px tall at 360. |
| Inventory | **41/41** | `seen-*.json` union: all 37 test-id rows present (pick-theme and preview-3/4 at 1280 only; mini-* at 360 only, which matches the old screen's columns). Text rows seen on the picture: "Look of every flier" + card note (1280 closed), "Shared text" (360/1280 card-end), Replace hint "Type a word or phrase..." (1280 card-end), Card folded (`*-folded`), add-flier (1280 card-end). |
| Pair parity | n/a | Build-only frames, no before pair or `pair` records in `build/`. |

## Round 1 fixes, checked

| # | Round 1 defect | Round 2 |
|---|---|---|
| 1 | Prices outline took whole lines, crossed "Intermediates" | Fixed on fliers 1-3 (boxes on "5€", "20€" only). Flier 4: box no longer crosses "Intermediates", still wraps the whole "Party pass 20€" string (one text run, so the Price labels word is inside the Prices box). |
| 2 | Title box cut the date script | Fixed (`A-build-1280-light-hover`: box bottom clears "Saturday 31 October"). |
| 3 | No outline in dark 360 peek | Fixed (`A-build-360-dark-peek`: dashed box round KIZOMBA). |
| 4 | Focus on row toggle, not Font select | Fixed (ring on Font select, 360 + 1280 open). |
| 5 | Hovered row had no cue | Partly: Title row now has the 2px border, but the open Prices row keeps the same 2px border, so two rows read as selected. |
| 6 | Custom swatch black when unset | Fixed (shows the role's grey). |

## New defects

1. **Overflow** (hard fail above).
2. **Outline collapses over the glyphs** (`A-build-1280-light-card-end.png`, all 4 fliers): with the user at the card end, the Prices box is drawn as a ~4 px dashed band through "5€" / "20€" and through "Party pass 20€" on flier 4; the prices are unreadable. Either a stale outline left after the row lost hover/focus, or a box measured at the wrong height. Not judged: whether it clears after the 2 s tap timeout.
3. **Dark outline style** (`A-build-1280-dark-open.png`): still a solid rounded grey box; light uses 2px dashed ink.

## Scores

Not scored (hard fail). Non-gate reading for the designer: focal point, portability, no-slop and chrome parity hold from round 1; the editor is otherwise clean at both widths.

## Target table (build vs option A mockup / rule, every measured gap)

| Element | Measured (build) | Target | Delta |
|---|---|---|---|
| 360 Size "+" right edge | device x 998 (~CSS 333) | inside editor card border, x <= 966 device (border 978 minus 12 inner padding) | +32 device px (~11 CSS px) |
| 360 Size row width | Font select 140-524 + gap + "-" 556-686 + value + "+" 868-998 | fits card content box 140-966 | +32 device px |
| 360 value slot | ~182 device px (686-868) | 52 CSS px = 156 device px | +26 device px |
| Prices outline, flier 4 | whole "Party pass 20€" | amount "20€" only | +~45 CSS px wide |
| Prices outline at card end | ~4 px dashed band over glyphs | no outline once no role is hovered/focused (or a full line box after tap) | outline present + wrong height |
| Outline style, 1280 dark | solid rounded grey ~2px | 2px dashed, as light | style differs |
| Hover vs open row | both 2px ink border | hovered row 2px, open row drops to 1px while another row is hovered | open row +1 px |
| Editor rows | Font+Size, Width+Drawn size, Colour, Weight+Letter spacing, note, Reset | Font+Size, Colour, Weight+Letter spacing, Reset + note one row | carried from round 1, not blocking |

## Top fixes

- **A-build-360-*-open**: below 400 CSS px wide, put Font on its own full-width row and Size (-, value, +) on the next row, or cut the value slot to 52 CSS px and the Font select to fill the rest; re-run `expectTextFits` plus a child-inside-parent check on the open editor (the probe passed a button outside its card).
- **A-build-1280-*-card-end**: clear the outline when the role row loses hover/focus (and after the 2 s tap), and measure the box from the run's line box, never a zero-height rect.
- **A-build-1280-dark-***: draw the dark outline with the same 2px dashed poster ink as light; split flier 4's "Party pass 20€" so only "20€" is boxed.

NOT COVERED: live build not driven (frames only); outline timing (100 ms in, 2 s tap) not judged from stills, so defect 2 may be a capture during the fade; dark card-end / add / shared frames not opened (light read, dark taken from `seen-*.json`); 360 Width row and lower editor rows not in any 360 frame; keyboard walk through roles not done; no real device.
