# FLIER-1 "Flier Studio" build check, round 3: design-critic (2026-10-28)

Blind, screenshot-only. (a) The 9 PNGs in `FLIER-1-build/` rendered by `@dloizides/poster-render` 0.2.2, against
`r2/` and `critique-2026-10-28-build-r2.md`. All 9 re-judged because the two-column spacing changed. (b) The app form
screen `app-360.png` (1620x2880, 360x640 at 4.5x) and `app-1280.png` (1280x800). Same rubric and reading of criteria
4-5 as r2 (target video rules; no taste ledger, no flier `visual-language.md`). Criterion 9 does not apply.
Coordinates are display px unless marked "real" (phone x1.27, desktop x1.28, app-360 x1.44).

## Hard fails (checked first)

| Item | Pin | Inventory | Form rows | Picture whole, nothing over it | Verdict |
|---|---|---|---|---|---|
| E-A-story | yes | 11/11 | 0 rows | yes, bottom on frame edge; column (x 50-383) clears couple (x~450) | pass |
| E-B-story | yes | 11/11 | 0 rows | yes; couple ends x~600, column starts x~697 | pass |
| E-C-story | yes | 11/11 | 0 rows | yes; prices flank the arch, none on the couple | pass |
| P-A-phone | yes | 11/11 | 0 rows | yes; clock zone (top ~27%) empty | pass |
| P-B-phone | yes | 11/11 | 0 rows | yes; clock zone empty | pass |
| D-A-desktop | yes | 11/11 | 0 rows | yes | pass |
| D-B-desktop | yes | 11/11 | 0 rows | yes, arch behind only | pass |
| picture-bottom-story | yes | 11/11 | 0 rows | yes | pass |
| list-story | yes | 4/4 list rows | 0 rows | yes | pass |
| app-360 | n/a | not measured (no app inventory in brief) | 4 pair rows | n/a | pass (rows) |
| app-1280 | n/a | not measured | 4 pair rows | n/a | pass (rows) |

Form rows (FORM-ALIGN-1), pixel rows on the captures:
- app-360: story|sand boxes 5-138 both; classic|solid 249-382 both; Upload picture|Upload logo 680-813 both. Picture
  position select 505-638 (centre 571) vs Picture size slider track centre 572: the slider has no box, so top edge and
  height cannot be read from pixels; its line sits on the select's centre within 1 display px.
- app-1280: Format|Colours 81-125; Fonts|Background 159-203; Upload 297-341 both; select 241-285 (centre 263) vs
  slider centre 263. Preview cards: Edit flier 1/2/3 and Download PNG rows share one top edge.

Round-2 fixes seen on the pixels:
1. E-C / P-B flank captions now match ("per hour" and "Party pass" both ~32 px on E-C, ~25 disp on P-B). Fixed.
2. E-C / P-B columns balanced: E-C left ends y~740, right y~770 (r2: 180 px hole); P-B left ~1130, right ~1155. Fixed.
3. E-C includes ~28 px, footer ~28 px (r2 ~22/~20). Close to the 30 px asked; accepted.
4. Rule under the venue: present on all 8 event renders and the list. Fixed.
5. picture-bottom couple: NOT changed. Couple x~300-790 of 1080, top y~1010, same pixels as `r2/`. The r2 fix in
   `geometry.ts` `bottom(w, h)` did not land.

## Scores

| # | E-A | E-B | E-C | P-A | P-B | D-A | D-B | pic-bottom | list | app |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 Focal point | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 |
| 2 Portability | 3 | 3 | 4 | 3 | 4 | 3 | 4 | 3 | 3 | 3 |
| 3 Hierarchy/type/spacing | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 |
| 4 Visual-language | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 |
| 5 Taste (target) | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 3 |
| 6 No AI tells | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 7 Fits frame/viewport, text fits | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 8 Inventory | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | n/a |
| **Mean** | **4.0** | **4.0** | **4.1** | **4.0** | **4.1** | **4.0** | **4.1** | **3.8** | **4.0** | **3.4** |
| Verdict | PASS | PASS | PASS | PASS | PASS | PASS | PASS | REDO | PASS | REDO |

Evidence, one line each:
- **E-A / E-B:** new column spacing keeps the text column clear of the couple; venue rule above and below; calm, no panel.
- **E-C:** band now ends level on both sides; the 5€/20€ flanks read as a pair; arch frames the couple.
- **P-A:** clock zone holds; title, column, couple read in order.
- **P-B:** same as E-C scaled; includes ~25 real px is the smallest text on the set but legible.
- **D-A:** prices one column; ~420 real px gap between body (ends x~1060) and couple (x~1390); acceptable for landscape.
- **D-B:** title block centred left, arch central, body right; closest to its option.
- **picture-bottom:** top band balanced, but the couple is still small and centred with ~300 px empty flanks; reads as a
  picture dropped under a form. Unchanged since r2.
- **list:** dates set apart, rows separate, "5€ per hour" under the last row; grid is still generic (#2 = 3).
- **app:** 1280 is a designed desktop (bounded form column + 3-up preview grid, Download all PNGs top right). 360 is a
  plain single-column form. All labels and values are the same weight and size, nothing groups the 14+ fields, and the
  top select reads "Picture right" while "Picture position" reads "bottom" and the previews show the picture right:
  two controls appear to own the same thing. Teal accent is unrelated to the warm flier palette (#4 = 3).

## Top fixes (REDO only; none removes an inventory item)

**picture-bottom (package, r2 fix not applied):**
1. `src/layout/geometry.ts` `bottom(w, h)`: start the picture region at the body's measured end + 40u and size the
   couple to ~0.8w (about x 110-970 of 1080), bottom on the frame edge as E-A does.
Round count: second taste REDO, which by rule is ESCALATE. It is held at REDO once because the r2 fix was never tried
(pixels identical to `r2/`); if r4 still fails, ESCALATE to the owner.

**app form screen (first round):**
1. Resolve the "Picture right" vs "Picture position: bottom" conflict on screen: give the top select a visible label
   ("Layout") and make Picture position reflect it, or drive both from one control; the previews must match what the
   form says.
2. Group the form under three small headings (Layout, Pictures, Text) with ~24 px between groups and ~8 px between a
   label and its control; labels 1 step smaller and medium weight so values read first.
3. Show the slider's value beside "Picture size" (e.g. "100%") so the row reads as a control, not a bare line.
Per DESIGN-TIER-1 "Two-tier design process", fix 2 moves elements: before/after captures (same scroll anchor) next round.

## NOT COVERED

- app-360 shows one scroll position only (mid form): the top of the form, the template select and the previews at
  360 were not seen; no mobile preview of the fliers judged.
- Slider row alignment read from the track centre only; its element box needs `expectFieldsAligned` on a live render.
- No app information inventory was in the brief, so app #8 is n/a and no lost-field check was possible for the app.
- No pixel measurement of overlap or exact sizes; phone/desktop read from downscaled displays.
- Dark/alt palettes, post/square formats, hover/focus/error states of the form, not rendered.
- No taste ledger exists; criterion 5 uses the target video's rules.
