# Critique 2026-10-28, round flier2: FLIER-2 "Flier Studio follow-ups"

Critic: design-critic, judging only the screenshots: the 8 captures in this folder, `frames/*.json`, `result.json`, and the 4 PNGs in `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/fliers/`.

## Hard fails (checked first)

| Check | scope | share |
|---|---|---|
| Lost item: 48 inventory rows from before, all visible after (`visibleItems` vs `result.json` items) | 48/48, none missing | 48/48, none missing |
| Misaligned form row (`formRows.misaligned`, plus a pixel check on Save, Make share link, Format/Colours, Fonts/Background) | `[]`, rows look level | `[]`, rows look level |
| Pair parity (route, state, fixture, viewport, anchor, crop records the same before and after) | 360 + 1280 equal | 360 + 1280 equal |

No hard fail. `data-inventory="48/48"` and `data-aligned="pass"` on the page agree with `result.json`.

## The 360 mini-preview bar over the scope control

The bar is fixed to the bottom of the viewport, which is why the full-page capture draws it there. Evidence: its bottom edge sits at y=640 exactly (the viewport height), it sits at the same y in the **before** capture (where it covers the LAYOUT heading), and at 1280 the dialog's dim layer stops at y=800 in the same way. So it is an artifact of the full-page capture, not a layout bug.

It still leaves a real gap in the evidence. On a phone at first load, "Shared text edits apply to" sits at about y 551-640, under the bar, and it shows only after you scroll about 90px. That is normal for a fixed bar. But it means **no capture shows the new scope control at 360**, so the text fit and the look of the new control at 360 are not proven.

## Option: scope (AC-10 scope select + Share row)

| # | Score | Evidence |
|---|---|---|
| 1 | 4 | The previews column wins at 1280. The scope select is a plain labelled select under "Editing flier 1 of 4", which is the right place. |
| 2 | 3 | A generic form tool with nothing branded. That is acceptable for an internal studio. |
| 3 | 4 | The label "Shared text edits apply to" plus "This flier only" reads clearly, and the spacing matches the rest of the form. |
| 4 | 4 | Sand palette, one dark primary (Save), no new colour. |
| 5 | 4 | Calm and quiet, in line with the ledger. Nothing it repeats was rejected. |
| 6 | 5 | No AI-default tells. |
| 7 | 3 | 1280 looks designed (3 columns). At 360 the new control was never seen (see above). |
| 8 | 5 | 48/48, and Share sits in Saved configs beside Make share link. |

Mean 4.0, lowest #2=3 and #7=3. **PASS**, with one required follow-up.
Top fixes:
1. Add a 360x640 viewport capture scrolled so `pick-scope` sits at the top (before and after, same anchor). This proves the text fits and the bar is clear of it.
2. The text in the select reads "This flier only", while the brief calls the choices "this flier / all fliers". Make the label and the options use the same words as the brief.

## Option: share (AC-12 "Import 4 templates?" dialog)

| # | Score | Evidence |
|---|---|---|
| 1 | 5 | The dialog is the only bright thing on screen. Import is the dark primary and has the focus ring (FOCUS-1 holds: focus is not on a destructive action). |
| 2 | 3 | The copy is product-specific ("adds each one as a new saved config"). The chrome is generic. |
| 3 | 4 | The title, 3 lines of reassurance and 2 equal-height buttons give a clean hierarchy. |
| 4 | 4 | One chrome language, and the dim layer keeps the palette. |
| 5 | 4 | Calm. It says plainly that nothing gets overwritten. |
| 6 | 5 | None. |
| 7 | 4 | At 360 the card fits inside the first viewport (y 207-432) and no text overflows. At 1280 it is placed at x 310-685, top-left over the Previews heading and the "Generate" button. |
| 8 | 5 | 48/48. |

Mean 4.25, lowest #2=3. **PASS**.
Top fixes:
1. At 1280, centre the dialog in the viewport (or put it above the Saved configs card it writes to) so it stops cutting across the Previews heading.

## Regenerated fliers (4 PNGs, 1080x1920)

- Schedule rows say **Beginners** and **Intermediate** on all 4 (the upcoming flier shows them per date: 31 Oct, 7 Nov, 29 Nov).
- The footer reads **"Classes by Jimmy & Ismini"** on all 4.
- Picture: the couple is complete from the top of the hair bun down to the knees, where the art ends at the bottom edge. No head, arm or side is cut, and nothing is stretched.
- Overflow: all text stays inside its column and clear of the picture. The longest lines ("Intermediate 21:00 - 22:00", "Kizomba dedicated room") fit on the upcoming flier.

**PASS**.

## Not covered
The scope control at 360 (hidden under the fixed bar in every capture), dark mode, motion of the dialog, keyboard trap and Escape in the dialog, real device, the "All fliers" state of the scope select.
