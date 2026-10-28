# FLIER-1 "Flier Studio" app picks: design-critic (2026-10-28)

Blind, screenshot-only. Seen: before/P-A/P-B/P-C at 1280 top and 360 top; L-A 360-text; L-B 360-top and 360-previews;
L-C 360-top and 360-text. Coordinates are display px of the 1125x2000 downscale of the 360 captures ("disp").
No taste ledger exists (`apps/flier-studio/docs/design/taste-ledger.md` absent) and no flier `visual-language.md`:
criteria 4-5 use the r5 reading (sand flier palette, owner taste "calm, realm colours" from `user_design_taste.md`).
Criterion 9 does not apply.

The page was published before this review (index.md "design-critic not run"). REDO options below are already on it:
WITHDRAW https://claude.ai/artifact/GRTJEb1VqCtgXMD2dbVYDx for P-B and L-C until fixed.

## Hard fails (checked first)

| Option | Inventory | Form rows | Pair record | Contrast (text, ring) | Verdict |
|---|---|---|---|---|---|
| P-A | 45/45 sweep; seen frames show the same fields as before | Format/Colours row shares top edge + height on 1280 capture; sweep rowsOff [] | before/after records equal (route `/`, flier 1 of 4, kizomba, viewport, anchor, crop) | button 9.4:1, ring dark | pass |
| P-B | 45/45 | same | equal | text on peach 7.7:1; ring #9a5a26 5.2:1 | pass |
| P-C | 45/45 | same | equal | 5.4:1 | pass |
| L-A | 45/45, bar covers bottom 88 px, rows scroll above it (seen: Schedule label above bar) | sweep rowsOff [] | equal | teal unchanged | pass |
| L-B | 45/45, one tab at a time; Preview tab shows cards, Edit/Download, Download all | sweep rowsOff [] | equal; tab switch is the change under review | pass | pass |
| L-C | 45/45, previews above form | sweep rowsOff [] | equal | pass | pass |

All 18 pairs (36 frames) have field-for-field equal `pair` records in `result.json`.

## Scores

| # | P-A Ink | P-B Peach | P-C Burnt amber | L-A Sticky bar | L-B Tabs | L-C Previews first |
|---|---|---|---|---|---|---|
| 1 Focal / purpose | 4 | 3 | 4 | 4 | 4 | 3 |
| 2 Portability | 3 | 4 | 4 | 3 | 3 | 3 |
| 3 Hierarchy/type/colour | 4 | 3 | 3 | 3 | 3 | 3 |
| 4 Visual language | 4 | 3 | 4 | 4 | 4 | 4 |
| 5 Taste | 4 | 4 | 4 | 4 | 4 | 3 |
| 6 No AI tells | 5 | 5 | 5 | 5 | 5 | 5 |
| 7 360 + 1280, text fits | 4 | 4 | 4 | 4 | 4 | 2 |
| 8 Inventory | 5 | 5 | 5 | 5 | 5 | 5 |
| **Mean** | **4.1** | **3.9** | **4.1** | **4.0** | **4.0** | **3.5** |
| Verdict | PASS | REDO | PASS | PASS | PASS | REDO |

Rank Q1: P-C, P-A, P-B. Rank Q2: L-B, L-A, L-C.

Evidence, one line each:
- **P-A:** calm, one dark ink primary (9.4:1); the peach LAYOUT underline is the only warm note. But primary #4a423c vs body
  text #2f2925 is 1.46:1, so "accent" and text are the same value: buttons read by size, not colour. Portable (any
  warm-neutral SaaS).
- **P-B:** fill is the flier's own peach #e9b47f, so Generate/Download all fuse with the flier's peach marks next to them
  at 1280 (eye splits between button and flier dates). Two accent colours at once: peach fill + brown #9a5a26 selected
  ring. Fill vs surface 1.78:1, button edge dissolves on the sand card.
- **P-C:** one accent, ties to the flier orange, white text 5.4:1, strongest focal on Generate. The heading mark
  #f3dcc3 is 1.27:1 on surface: at 360 disp y~1862 the LAYOUT underline is barely visible, so the mark exists only on
  paper.
- **L-A:** solves "see the flier while editing" on every form frame; bar is clean (thumb, "Flier 1 of 4 / Live
  preview", "See all 4" 44 px tall). Thumbnail is ~40 px wide at 360: it proves a change happened, cannot show it.
- **L-B:** clean segmented switch, both labels fit; but on the Preview tab the active tab and Download all PNGs are two
  stacked teal fills (disp y~16-336): two primaries in the top 110 px.
- **L-C:** the selected card's ring is clipped on its left edge by the scroller (disp x~50, y~680-1525, left stroke and
  top-left corner cut). Past the first screen (360-text) no preview is visible while editing, so the 2,500 px problem
  returns as soon as the user scrolls to Title.

## Top fixes (none removes or hides an inventory item)

**P-B (REDO):**
1. Primary buttons: keep fill #e9b47f, add a 1px #9a5a26 border so the edge reaches 5.2:1 and fill + ring read as one
   family.
2. Selected flier ring: 3 px #9a5a26 plus a 2 px #e9b47f inner ring, so the ring is not a third, unrelated accent.

**L-C (REDO):**
1. Give the swipe strip `padding-inline: 8px` (and `scroll-padding` to match) so the 3 px selected ring is never clipped.
2. When the strip scrolls out of view, show a 56 px "Flier 1 of 4 · See previews" row pinned at the top that jumps back
   to the strip (the form stays fully visible below it).

**P-C (PASS, optional):** heading mark #f3dcc3 → #d9a06a (2.2:1) so it is seen.
**P-A (PASS, optional):** lighten nothing; give the selected ring the peach #e9b47f inner line so one warm note links
app and flier.
**L-A (PASS, optional):** tapping the thumbnail opens the selected flier full-height as a sheet; thumbnail 56 px wide.
**L-B (PASS, optional):** active tab = surfaceElevated with 600 weight and a 2 px primary underline, not a primary fill.

## NOT COVERED

- No taste ledger file and no flier `visual-language.md`; criterion 5 from memory `user_design_taste.md` + r5 reading.
- Not opened: L-A 360-top/360-previews/1280, L-B 360-text/1280, L-C 360-previews/1280, before-360-text/previews, all
  `img/parts/` sweep frames. Inventory and rows rely on the recorded sweep (`inventorySweep`), not my pixel read.
- Mocks are injected DOM, not built components; motion of bar/tabs/strip not judged; dark palettes not rendered;
  hover/focus/error states unseen; no real device; live artifact not opened (captures only).
