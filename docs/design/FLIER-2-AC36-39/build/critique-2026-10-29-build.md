# Critique: FLIER-2 "Flier Studio follow-ups" build of D29 option B "One menu per row" (AC-36..40) + item 8 rail caption

- Critic: design-critic, 2026-10-29, round: build 1.
- Judged from the 40 PNGs in this folder (28 `B-*`, 12 `rail-*`; 360x640 and 1280x800 at DPR 2, light and dark; all 40 md5-distinct) and `capture.build.spec.ts` (capture steps only). Compared with the approved option B frames and `../critique-2026-10-29-r3.md` (B PASS 4.0), and `../../FLIER-2-rail-label/critique-2026-10-29.md` (rail REDO 3.75).
- Code and designer rationale not read.

## Verdicts

| Surface | Verdict | Why |
|---|---|---|
| B "One menu per row" (build) | **REDO (hard fail: inventory 38/65 + 8/15 shown; rename row at 1280 misaligned and clipped)** | below |
| Item 8 rail caption | **PASS**, mean 4.0, lowest #2 = 3 and #3 = 3 | below |

Not on a published pick page, so no WITHDRAW.

## B: hard fails (checked first, so no score and no rank)

### 1 Lost item: the build frames show 38/65 base rows and 8/15 new items

The task doc says it outright (D29 step 2): "Inventory 65/65 + 15/15 is not re-counted on the build". The 28 frames cover Drafts, the More menu, rename, toast, confirm, the line-size block and the style panel. The other sections the option round captured (`top`, `form`, `form-mid`, `form-end`, `flier`, `size`, `drafts-end`) were not captured on the build.

Seen on the build: download-1..3, draft-restore-1..4, draft-star-1..4, drafts-all, drafts-favourites, drafts-list, drafts-panel, drafts-panel-toggle, edit-1..3, field-includesHeading, field-script, field-titleBottom, flier-form, group-toggle-text, mini-preview, nav-* (6), preview-1..4, preview-grid, rail-toggle, section-nav = **38**.

Not in any build frame (27): download-all, draft-restore-5/6, draft-star-5/6, field-footer, field-includesItems, field-items, field-prices, field-schedule, field-title, field-venue, flier-form-toggle, group-toggle-layout, group-toggle-pictures, pick-anchor, pick-background, pick-fonts, pick-format, pick-layout, pick-palette, pick-scale, pick-scale-value, remove-background, upload-logo, upload-picture, drafts-empty.

New items seen (8): draft name, delete via More + Undo toast, Clean up + confirm, line tool, Style on titleBottom, Style on script, Style on includesHeading, style panel. Not seen (7): Style on title, footer, venue, schedule, prices, includesItems, items.

This is most likely a capture gap, not a deletion. The rule still counts what the pictures show.

### 2 Misaligned form row: rename at 1280 (light and dark)

In `B-1280-*-rename.png` the rename input and the Restore / Star / More buttons share one row. The input's box starts about 14 CSS px above Restore's top edge: about 28 device px at DPR 2, read from the frame and the 1280 contact sheet. FORM-ALIGN-1 "Fields side by side in a form share one top edge and height" says an unlabelled button sits on the input line. At 360 the input gets its own row above the buttons, which passes.

### 3 Text overflow: the 1280 rename input cuts off the name

The same input is narrower than the name it edits. "Bachata social, 3:09 PM" shows as "chata social, 3:09 PM", with the first two letters scrolled out of the box. TEXT-FIT-1 "UI text never overflows its box at 360x640 or desktop, in every state" says never clip. At 360 the full name fits.

### Checked and passing

- **Done on the 360 style sheet:** present in light and dark as a filled button bottom right in a sticky foot, beside "Reset to theme" (r3 fix 1 landed). The sheet sits above "Flier 1 of 4". Alignment scrolls under the foot, which is acceptable.
- **Measured form rows (DPR 2 pixel rows, light = dark):**
  - 360 Font select inner box 308-395 vs Size steppers 308-395 (0 px). The select carries a focus ring at 298-303 with a 2 px gap; the ring is outside the box.
  - 360 Bold / Italic / Letter spacing 704-791 (0 px). 360 Same width / Same size 452-539 (0 px).
  - 1280 Font 784-871 inside its ring, steppers 784-871 (0 px). Weight row 1088-1175, Alignment 1238-1325, Apply to 634-721, Reset / Done 1418-1505 (0 px each).
- **Pair parity:** the build frames are after-only states, with no before pairs to match. The rail pair is the same build, route, state and viewport, with only the 399px rule swapped in the CSSOM. Passes.
- **Other states:** text fits in every other state. The 360 toast wraps "Deleted “Bachata social, 3:08 PM”" to four lines and covers most of a row, as in r3. It fits.

### Seen against the approved option (for the next round, not scored)

- Matches option B: name-led rows, one More per row (Rename, Delete in red), star icon, Clean up beside the chips. The confirm opens on "Keep them", red stays off the rows, and the dark confirm uses salmon with dark text.
- The 1280 style card opens below the WORKSHOP input, never over it. The whole panel, Alignment and Done included, is in frame at 1280. That was a "Not covered" gap in r3 and is now closed.
- r3 fix 2 (a pre-confirm `cleanup` frame) is resolved: the build has no duplicate frame.
- The 1280 drafts list wraps "Bachata social, 3:09 / PM" and "KIZOMBA NIGHT, / 3:09 PM" mid-name. This fits, but the time splits from its name.

## B: top fixes (none removes an item)

1. Recapture the build with the option round's full walk: `top`, `form`, `form-mid`, `form-end`, `flier`, `size` and `drafts-end` with 6 drafts, plus an empty-drafts frame, at 360 and 1280, using the same anchor scrolls. Then type the counted k/n into `result.json`.
2. At 1280 rename, place the input on the button line: same top edge and 44 px height as Restore, with Restore / Star / More aligned to it. Better still, put the input on its own full-width line under the thumbnail, as at 360, so the name is never cut. Recapture `rename` in light and dark.
3. Widen the 1280 Drafts name column, or move the buttons under the name, so "3:09 PM" stays on the line with its name.

## Item 8 rail caption: hard fails

| Check | Result |
|---|---|
| 1 Lost item | pass, 7/7 rail items (All fliers, Flier, Drafts, Generate, Fliers, Saved configs, collapse toggle) at 360 and 1280, light and dark |
| 2 Misaligned form row | n/a (navigation) |
| 3 Pair parity | pass: same build, route (Generate active), data, viewport and scroll; only the `<400px` rule is swapped back to `overflow-wrap: anywhere` |

The r1 gap is closed. `rail-360-*-generate-before` shows the defect, a bold "Generat / e". The after frame shows bold "Generate" on one line in light and dark. "Saved configs" active wraps at the word break. The 1280 rail (88 px, bold active) is unchanged and fits.

## Item 8 rail caption: score sheet

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point | 4 | The active tab reads at once (tint + bar + bold) |
| 2 | Portability | 3 | Generic icon + caption tab bar; the warm palette carries the identity |
| 3 | Hierarchy / type / spacing | 3 | Captions about 10 px, the smallest text on screen. The "Saved configs" icon still sits about 4 px above the other five (r1 fix 3 not done) |
| 4 | Visual language | 4 | Metrics only, no new colour or shape |
| 5 | Taste ledger | 4 | Calm; nothing the ledger rejected |
| 6 | AI-default tells | 5 | None |
| 7 | 360 + 1280, light + dark, every state | 4 | Active Generate, active Saved configs, 1280 and dark all captured; all fit |
| 8 | Inventory | 5 | 7/7, nothing moved |
| | **Mean** | **4.0** | **PASS** (bar met exactly) |

Rail fix (not blocking): set `justify-content: flex-start` on `.rail a` below 1024 px, so all six icons share one top edge.

## Gate note

The 1280 rename misalignment and the clipped name were found by eye and by pixel rows. An `expectFieldsAligned` probe on the Drafts list would catch the row if the rename state counts as a form row. An `expectTextFits` probe catches the clipped name only if it measures input `scrollWidth`.

## Not covered

- `/impeccable`, `/taste-skill` and `vf_measure.py` were not run; criteria 3-4 are scored by eye.
- No real device; 360 is Playwright emulation at DPR 2 (the option round used DPR 3).
- Motion not judged from stills: toast timing, sheet open and close, menu open, rename keyboard flow.
- Style panel scope "All 4 fliers", colour Custom picker and the result on the canvas were not captured.
- The line ties on the canvas (Same width ±1 px, AC-38) were not measured in these frames.
- The 1280 rename offset was read from the frame at about 2 device px precision, not with `expectFieldsAligned` on a live render.
