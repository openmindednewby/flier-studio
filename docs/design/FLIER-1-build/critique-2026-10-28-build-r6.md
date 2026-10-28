# FLIER-1 "Flier Studio" build check, round 6: design-critic (2026-10-28)

Blind, screenshot-only. (a) 13 PNGs from `@dloizides/poster-render` 0.2.7 (real fonts), compared with `r5/` and
`critique-2026-10-28-build-r5.md`. (b) App after-captures (Ink palette D7, sticky mini-preview D8) against the
owner-picked P-A "Ink" and L-A "Sticky mini-preview" in `../FLIER-1-app-picks/`. Taste on picked items is settled;
the app is judged on build fidelity to the pick. Coordinates in display px ("disp").

## Hash diff vs r5

All 13 renders changed (0.2.7 drops the bold body weight on every layout). Opened: P-B, E-C, P-A (+ r5/P-A),
E-A post, D-B. Not opened: E-A square/story, E-B post/square/story, D-A, list, picture-bottom (verdicts carried).

## Hard fails (checked first)

| Item | Inventory | Form rows | Pair record | Verdict |
|---|---|---|---|---|
| renders seen (5) | 11/11 each: title, script line, second title, logo, venue, Level 1/2, both prices, includes heading + 3 items, footer, picture | 0 rows | n/a | pass |
| app (3 page pairs) | 22/22, `lost: []`; 360-full shows all fields, all 4 previews with Edit/Download, Add/Remove; bottom padding keeps the last row clear of the 88 px bar | Format/Colours, Fonts/Background, Upload picture/logo: one top edge and height on 360 and 1280 captures; records `misaligned: []` | 1280-full, 360-full, 360-previews: before/after records exist and are field-for-field equal | pass |

Page carries `data-inventory="22/22"`, `data-aligned="pass"`, matching `result.json`.

## Scores

| # | P-B | E-C | P-A | E-A post | D-B | app (fidelity) |
|---|---|---|---|---|---|---|
| 1 Focal point | 4 | 4 | 4 | 4 | 4 | 4 |
| 2 Portability | 3 | 4 | 3 | 3 | 3 | 3 |
| 3 Hierarchy/type/spacing | 4 | 4 | 4 | 4 | 4 | 4 |
| 4 Visual-language | 4 | 4 | 4 | 4 | 4 | 4 |
| 5 Taste / fidelity to pick | 4 | 4 | 4 | 4 | 4 | 3 |
| 6 No AI tells | 4 | 4 | 4 | 4 | 4 | 4 |
| 7 Fits frame, text fits | 5 | 4 | 4 | 4 | 4 | 4 |
| 8 Inventory | 5 | 5 | 5 | 5 | 5 | 5 |
| **Mean** | **4.1** | **4.1** | **4.0** | **4.0** | **4.0** | **3.9** |
| Verdict | PASS | PASS | PASS | PASS | PASS | REDO |

Carried PASS (not opened): E-A square/story, E-B post/square/story, D-A, list, picture-bottom.

Evidence:
- **P-B:** both r5 fixes landed. Title top at y~120 of 2000 (0.06h), logo aligned to it; footer "with Jimmy & Ismini"
  sits ~40 disp under "2 drinks" in the right column. Remaining: ~170 disp empty band between Level 2 (y~830) and the
  price row (y~1000); acceptable, the arch reads as the next block.
- **E-C:** footer now ~45 disp under the includes list (r5 optional fix landed); columns pack cleanly, couple focal.
- **P-A:** only change is the lighter body weight; reads calmer and matches the others. The text block is still
  bottom-anchored with ~580 disp of empty top (same as r1-r5, accepted then); noted as optional, not a new defect.
- **E-A post / D-B footer packing:** footer directly under the includes list (~40 disp) on both; no detached footers.
- **App fidelity:** Ink matches the pick: #4a423c primary (Download all PNGs, Generate), dark selected ring on flier 1,
  dark slider and focus ring, warm paper cards. L-A bar matches: thumbnail, "Flier 1 of 4 / Live preview", "See all 4",
  content scrolls above it. Two gaps:
  1. The pick's section-heading mark (#e9b47f underline under LAYOUT, PICTURES, TEXT) is absent on both 1280 and 360
     after-captures.
  2. The capture records say build `be49506+L-A+FLIER_TOKENS`, not app 18537fe, and the preview thumbnails still
     render the bold body weight that 0.2.7 removed: the captures predate the build under review.

## Top fixes (none removes an inventory item)

**App (REDO, fidelity):**
1. Add the 2 px #e9b47f underline under each section label (LAYOUT, PICTURES, TEXT, ...), as in P-A-1280-top.png.
2. Re-run `e2e/appCapture.spec.ts` on 18537fe with poster-render 0.2.7 so `build` and the thumbnails match; keep the
   same pair steps.

**P-A (PASS, optional):** pin the title block to the top margin like P-B, or let the picture rise to fill the top third.

## NOT COVERED

- 8 of 13 renders not opened this round (changed only by the body-weight swap); verdicts carried from r5.
- App captures are from be49506, not 18537fe: the D7/D8 code at 18537fe itself was not seen.
- Form alignment read from capture pixels plus `misaligned: []`; `expectFieldsAligned` not run by me.
- Dark mode, hover/error states, bar motion and "See all 4" jump behaviour, real device; no taste ledger file.
