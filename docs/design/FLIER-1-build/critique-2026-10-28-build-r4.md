# FLIER-1 "Flier Studio" build check, round 4: design-critic (2026-10-28)

Blind, screenshot-only. (a) 13 PNGs from `@dloizides/poster-render` 0.2.5: the 9 defaults plus E-A (picture right) and
E-B (picture left) in post (1080x1350) and square (1080x1080). Compared with `r3/` and `critique-2026-10-28-build-r3.md`.
New since r3: 30 px type floor, picture-bottom resized. (b) App form pairs: `r3/app-before-*.png` vs `app-after-*.png`
at 1280x800 and 360x640 (form-top, previews). Same rubric and reading of criteria 4-5 as r3 (target video rules; no
taste ledger, no flier `visual-language.md`). Criterion 9 does not apply. Coordinates in real px unless marked "disp".

## Pixel diff vs r3 (threshold 20 grey levels)

Unchanged (0 px): E-C-story, P-A-phone, list-story. Changed: E-A-story, E-B-story, P-B-phone, D-A-desktop, D-B-desktop,
picture-bottom-story. r3 verdicts carry over for the unchanged three.

## Hard fails (checked first)

| Item | Inventory | Form rows | Pair record | Verdict |
|---|---|---|---|---|
| 9 defaults + 4 post/square | 11/11 each (list 4/4); every item visible | 0 rows | n/a (renders, no pair) | pass |
| app pairs (1280, 360 top, 360 previews) | no app inventory in brief; every field visible in the before crops is present in after (Picture position renamed "Picture alignment"); fields below Title not in the after crops | 3 pair rows, aligned | **none**: no `result.json` holds `pair` records for these frames (`FLIER-1-layouts/result.json` covers the layout options only) | **REDO (hard fail: pair app-after-1280 / app-after-360-form-top / app-after-360-previews, no record)** |

Pair parity on the pixels (would pass once recorded): same route, flier 1 of 4 selected, same fixture (31 Oct / 7 Nov /
29 Nov / Upcoming), same viewport, form-top anchored at scroll 0, previews anchored on the "Previews" heading, same crop.
Only the form change (and the 0.2.5 render inside the preview cards) differs.

FORM-ALIGN-1, measured edge rows on the captures:
- app-after-1280: Format|Colours 264-306 both columns; Fonts|Background 349-391; Upload picture|Upload logo 448-490.
- app-after-360 (real px): story|sand 1190-1382; classic|solid 1574-1763; uploads 2016-2210. Same top and bottom both
  columns. The slider is now on its own row (no side-by-side partner), so the r3 caveat is gone.

## Scores

| # | E-A story | E-B story | E-C | P-A | P-B | D-A | D-B | pic-bottom | list | E-A post | E-A square | E-B post | E-B square |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 Focal point | 4 | 4 | 4 | 4 | 3 | 2 | 4 | 4 | 4 | 2 | 2 | 2 | 2 |
| 2 Portability | 3 | 3 | 4 | 3 | 4 | 3 | 4 | 3 | 3 | 3 | 3 | 3 | 3 |
| 3 Hierarchy/type/spacing | 4 | 4 | 4 | 4 | 2 | 3 | 3 | 4 | 4 | 3 | 3 | 2 | 2 |
| 4 Visual-language | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 3 | 3 |
| 5 Taste (target) | 4 | 4 | 4 | 4 | 3 | 2 | 4 | 4 | 4 | 2 | 2 | 2 | 2 |
| 6 No AI tells | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 7 Fits frame, text fits | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 3 | 3 |
| 8 Inventory | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| **Mean** | **4.0** | **4.0** | **4.1** | **4.0** | **3.6** | **3.3** | **4.0** | **4.0** | **4.0** | **3.1** | **3.1** | **3.0** | **3.0** |
| Verdict | PASS | PASS | PASS | PASS | REDO | REDO | PASS | PASS | PASS | REDO | REDO | REDO | REDO |

App (not ranked; hard fail first). For the designer, what the pixels would score once the records exist: #1 4, #2 3,
#3 4, #4 3, #5 4, #6 4, #7 4, mean 3.7. r3 fixes 1-3 all landed (LAYOUT / PICTURES / TEXT headings, labels lighter
than values, "100%" beside Picture size, Layout and Picture alignment no longer contradict). The remaining gap is #4:
the teal accent (Download all PNGs, selected card ring, slider) has no relation to the warm sand flier palette. That
would be the app's second taste REDO, so with records in place it goes to the owner as ESCALATE, not another round.

Evidence, one line each:
- **E-A / E-B story:** type floor reflowed into one stacked column (x 50-430 / 648-1030); couple large, bottom on edge.
- **E-C / P-A / list:** pixels identical to r3.
- **P-B:** the floor pushed Level 2 into the right column (y~900-990 disp) ABOVE Level 1 on the left (y~1075-1170 disp):
  the eye reads Level 2 first; the two level times no longer sit together.
- **D-A (regression):** the couple shrank from a large figure (r3, x~1390+) to ~150 x 270 real px in the bottom-right
  corner (disp x 1805-1920, y 910-1125). Body ends x~1300 disp; ~500 disp px of empty right half above the couple.
- **D-B:** arch central, body right; "Dance School" ends x~1508 disp and "per hour" starts x~1542: ~34 disp px gutter, tight.
- **picture-bottom:** r3 fix landed. Couple now x~250-840, top y~815, bottom on the frame edge; it is the focal point.
  Body ends y~750, so a clear 65 px break. Closed (was held at REDO once in r3).
- **E-A post / square:** couple ~190 x 355 (post) / ~190 x 340 (square) jammed into the bottom-right corner, right
  shoulder cut by the frame edge; the two text columns take x 50-835 and the full height down to y~960, so the picture
  gets only leftover space. Venue "Dance School" ends x~425, prices start x~460: 35 px gutter.
- **E-B post / square:** same small corner couple, bottom-left, left arm cut by the frame. The body moved to x 243 while
  the title stays at x 50: two left edges, and the prices column runs to x~1030 (50 px right margin).

## Top fixes (REDO only; none removes an inventory item)

**App pairs (hard fail):**
1. Write one `pair` record per frame (route, UI state, fixture, viewport, scroll anchor, crop) for before and after of
   app-1280, app-360-form-top and app-360-previews into the result.json the page names; records must match.
2. Add one full-height after capture (or a second anchor at "TEXT") at 360 and 1280 so Second title, Script line,
   Includes heading and the rest are seen kept.
3. (Taste, goes to owner as ESCALATE once 1 is done) take the accent from the flier palette (the sand/orange of the
   venue rule) for the primary button, selected ring and slider.

**E-A / E-B post and square (first round):**
1. In `geometry.ts` side layouts for post/square: one text column only (prices and includes stacked under the levels,
   as story does) capped at ~0.5w; the picture gets the other ~0.5w at ~0.75h, bottom on the frame edge, nothing cut at
   the side.
2. If the column cannot fit at the 30 px floor in that width, step the title down before the picture shrinks; the
   picture keeps a minimum of ~0.4w.
3. E-B: title and body share one left edge (both start after the picture column, or both at x 50 with the picture right).

**D-A desktop (first round, regression from 0.2.5):**
1. Restore the r3 picture region: couple height ~0.8h, bottom on the frame edge, starting at body end + 80u (x~1390
   real as in r3). The type floor must reflow text, never shrink the picture into a corner.

**P-B phone (first round):**
1. Keep Level 1 and Level 2 in one column (left, under the venue); move includes + footer to the right column. Reading
   order stays title, venue, levels, prices.

**D-B (PASS, optional):** widen the venue-to-prices gutter to >= 60 real px.

## NOT COVERED

- No app information inventory in the brief; fields below Title (1280) and below Picture size (360) not in the after
  captures, so "nothing lost" is unverified for them.
- No `pair` records exist, so parity was judged from the pixels only.
- Slider and select boxes measured from pixel edges, not `expectFieldsAligned` on a live render.
- Type floor read by eye; no per-glyph px measurement. Phone/desktop judged from downscaled displays.
- Dark/alt palettes, other colour/font/background options, picture-bottom in post/square, form hover/focus/error states.
- No taste ledger; criterion 5 uses the target video rules.
