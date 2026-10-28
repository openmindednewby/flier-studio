# FLIER-1 "Flier Studio" build check, round 2: design-critic (2026-10-28)

Blind, screenshot-only. Judged the 9 PNGs in `FLIER-1-build/` rendered by `@dloizides/poster-render` 0.2.1, against the
round-1 sheet `critique-2026-10-27-build.md` (renders in `r1/`). Same rubric, same reading of criteria 4-5 (target video
rules: warm off-white ground, taupe condensed titles, peach script and accents, one illustrated couple, no panels; no taste
ledger, no flier `visual-language.md`). Criterion 9 does not apply. Coordinates are real px unless marked "disp"
(phone x1.27, desktop x1.28).

## Hard fails (checked first)

| Render | Pin | Inventory | Form rows | Picture whole, nothing over it | Verdict |
|---|---|---|---|---|---|
| E-A-story | yes, peach disc + glyph beside venue | 11/11 | 0 rows | yes, bottom on frame edge | pass |
| E-B-story | yes | 11/11 | 0 rows | yes | pass |
| E-C-story | yes | 11/11 | 0 rows | yes, arch behind only | pass |
| P-A-phone | yes | 11/11 | 0 rows | yes, clock zone (top ~27%) empty | pass |
| P-B-phone | yes | 11/11 | 0 rows | yes | pass |
| D-A-desktop | yes | 11/11 | 0 rows | yes | pass |
| D-B-desktop | yes | 11/11 | 0 rows | yes | pass |
| picture-bottom-story | yes | 11/11 | 0 rows | yes | pass |
| list-story | yes (not required by list inventory) | 4/4 list rows | 0 rows | yes | pass |

Round-1 package fixes seen on the pixels:
1. Pin: landed on all 8 event renders and the list.
2. Includes card: gone everywhere; heading + bullets, no fill.
3. Price split: fixed. D-A and picture-bottom keep 5€ and 20€ together in one column.
4. D-A logo: now beside KIZOMBA (x~1070-1200 real), top ~95 real vs KIZOMBA cap ~70. Aligned enough.
5. D-B logo: now ~190 px wide (r1 ~75); reads as a mark, close to the option's ~220.

Still open (not a hard fail): the venue has a rule above only; the options also had one below. Level times are still not indented.

## Scores

| # | E-A | E-B | E-C | P-A | P-B | D-A | D-B | pic-bottom | list |
|---|---|---|---|---|---|---|---|---|---|
| 1 Focal point | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 |
| 2 Portability | 3 | 3 | 4 | 3 | 4 | 3 | 4 | 3 | 3 |
| 3 Hierarchy/type/spacing | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 4 |
| 4 Visual-language | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 5 Taste (target) | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 3 | 4 |
| 6 No AI tells | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 7 Fits frame, text fits | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| 8 Inventory | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
| **Mean** | **4.0** | **4.0** | **3.9** | **4.0** | **3.9** | **4.0** | **4.1** | **3.8** | **4.0** |
| Verdict | PASS | PASS | REDO | PASS | REDO | PASS | PASS | REDO | PASS |

Evidence, one line each:
- **E-A:** KIZOMBA then couple; left column (x 50-383) clears the couple (x~450); footer ends y~1630. Calm, no panel.
- **E-B:** mirror of E-A; couple's left shoulder ~15 px from the frame edge, inside the frame.
- **E-C:** band still unbalanced: the right column (includes + footer) ends y~570, the left (venue + levels) ends y~750,
  leaving a ~180 px hole top right. The flank captions do not match: "per hour" ~40 px, "Party pass" ~32 px, because each
  flank shrinks its own label to fit. Includes ~22 px and footer ~20 px are small for a story.
- **P-A:** clock zone holds; title, column and couple read in order; logo sits beside KIZOMBA.
- **P-B:** same body as E-C, scaled down further: the right column ends y~1270 real, the left ~1440, includes ~22 px real.
  Same caption mismatch ("per hour" ~50 real vs "Party pass" ~40 real).
- **D-A:** prices one column; logo anchored. A ~410 real gap between the body (ends x~1360) and the couple (x~1770) and an
  empty lower left; acceptable for landscape.
- **D-B:** closest to its option; title block vertically centred, arch central, body column right, logo now legible.
- **picture-bottom:** the top band is balanced now (left ends y~875, right y~940), but the couple is still small and centred
  (x 300-790 of 1080) with ~300 px empty flanks and ~80 px dead strip above. It still reads as a picture dropped below a form.
- **list:** the r1 fixes landed: dates ~55 px with ~50 px space above each row, card gone, "5€ per hour" set apart under
  the last row. The rows now separate cleanly. Left column + couple bottom right is still a generic grid (#2 = 3).

## Top fixes (REDO only; none removes an inventory item)

**E-C and P-B (same package cause):**
1. `src/layout/blockGroups.ts:57-59` `flankPriceGroups`: give both flanks one label size (measure the narrower fit and
   use it for both, or flag the price groups `uniform` across flanks in `render/render.ts:110-112` `flankFlows`), so
   "per hour" and "Party pass" match.
2. Balance the two body columns by height in the flow (`render/render.ts:150` body flow / `layout/textFlow.ts` column
   break): break where both columns end within one line, or restore the option's three-column row (venue | Level 1 |
   Level 2) with the includes as one inline line below, in `layout/layoutSpecs.ts:41` (Arch portrait) and `:49` (PhoneArch
   portrait).
3. Includes and footer at least 30 px real on story and phone (`blockGroups.ts:74-78`, sizes 38/34 shrink too far in the
   narrow right column).

**picture-bottom:**
1. `src/layout/geometry.ts` `bottom(w, h)`: start the picture region at the body's measured end + 40u, and size the couple to
   ~0.8w (about x 110-970), so it fills the lower half instead of floating in it.
2. Then anchor the couple's bottom on the frame edge, as E-A does.

**All renders (minor, not scored as a fail):** add the rule under the venue (`blockGroups.ts:69` `rule` above only), as in
the options.

Round count: E-C and P-B had a hard fail in round 1, so this is their first taste REDO; picture-bottom likewise. None are
ESCALATE.

## NOT COVERED

- No pixel measurement of AC-02 overlap or of exact sizes; phone and desktop read from downscaled displays.
- No side-by-side with the `FLIER-1-layouts/img/` option PNGs this round; drift judged against the round-1 notes.
- Dark/alt palettes and the post/square formats not rendered.
- No taste ledger exists, so criterion 5 uses the target video's rules.
