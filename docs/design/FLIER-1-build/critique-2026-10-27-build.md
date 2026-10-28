# FLIER-1 "Flier Studio" build check: design-critic (2026-10-27, build round)

Blind, screenshot-only. Judged: the 9 PNGs in `FLIER-1-build/`, rendered by `@dloizides/poster-render` 0.2.0 from the
Kizomba preset with the real dancers picture and Bailemos logo. Each was compared with its picked or escalated option in
`FLIER-1-layouts/img/` (E-A, E-B, E-C, P-A, P-B, D-A, D-B). `list-story` and `picture-bottom-story` have no option, so they
were judged as standalone layouts. Same rubric and reading as `FLIER-1-layouts/critique-2026-10-27-r2.md`: there is no taste
ledger and no flier `visual-language.md`, so criteria 4-5 use the target video's rules (warm off-white ground, taupe condensed
titles, peach script and accents, one illustrated couple, no panels). Criterion 9 does not apply. Criterion 7 means the layout
fits its frame and the text fits. Coordinates are real px unless marked "disp" (display px; for phone and desktop,
real = disp x 1.27 / 1.28).

Hard rules come from the task doc `BaseClient/docs/Tasks/TODO/flier-studio/FLIER-1-flier-studio-app/FLIER-1-flier-studio-app.md`:
- picture whole and uncovered (AC-01/AC-02);
- event inventory 11/11;
- list inventory 4 rows.

## Hard fails (checked first)

| Render | Option | Inventory (seen on the picture) | Form rows | Picture whole, nothing over it | Verdict |
|---|---|---|---|---|---|
| E-A-story | E-A | **10/11: pin missing** (venue text only) | 0 rows | yes, bottom on frame edge | REDO (hard fail: Pin + venue) |
| E-B-story | E-B | **10/11: pin missing** | 0 rows | yes | REDO (hard fail: Pin + venue) |
| E-C-story | E-C | **10/11: pin missing** | 0 rows | yes, arch behind only | REDO (hard fail: Pin + venue) |
| P-A-phone | P-A | **10/11: pin missing** | 0 rows | yes, clock zone empty | REDO (hard fail: Pin + venue) |
| P-B-phone | P-B | **10/11: pin missing** | 0 rows | yes | REDO (hard fail: Pin + venue) |
| D-A-desktop | D-A | **10/11: pin missing** | 0 rows | yes | REDO (hard fail: Pin + venue) |
| D-B-desktop | D-B | **10/11: pin missing** | 0 rows | yes | REDO (hard fail: Pin + venue) |
| picture-bottom-story | none (standalone) | **10/11: pin missing** | 0 rows | yes | REDO (hard fail: Pin + venue) |
| list-story | none (standalone) | 4/4 list rows (title, 3 dated rows with level times and party price, venue/logo/5€/includes/footer/picture) | 0 rows | yes | no hard fail; scored below |

Every option drew a peach pin disc beside "Bailemos / Dance School". The renderer has no venue icon at all
(`layout/blockGroups.ts:67-69` builds the venue as text lines only, and `render/render.ts` has no icon draw). This is one
package defect, and it fails all 8 event renders. Since `data-inventory="11/11"` is false for these renders, it must not be
claimed for them. The list inventory names "Venue" without a pin, so the list passes this rule.

Withdraw on find: these are build renders, not on a pick page, so nothing needs withdrawing. The picked options themselves
still hold their 11/11.

## Build vs option: what drifted (for the designer; not scored, since the hard fail comes first)

These faults hold across the fleet:
- **White includes card.** No option uses one. The options set the includes as a plain peach heading plus bullets, and the
  target rule is "no panels". The card comes from `blockGroups.ts:73` (`card: { color: p.card, … }`).
- **Rules missing.** The options frame the venue with a rule above and below. The builds draw one short rule above the venue
  only (`blockGroups.ts:68`).
- **Level times not indented** under the level label as in the options. This is a minor nit.

Per render:
- **E-A:** closest to its option. The couple is right, the size is right and the bottom sits on the frame edge. Beyond the
  pin, the only drifts are the card and the missing rules.
- **E-B:** mirror of E-A, same drifts.
- **E-C:** the option's three-column row (venue | Level 1 | Level 2) and its inline includes line are gone. The build has a
  stacked left column plus an includes card top right with the footer under it, so the band is unbalanced (the right column
  ends at y~600, the left at y~750). The flank prices and the lighter arch from the r2 fixes did land.
- **P-A:** the clock zone holds (top ~27% empty). The footer moved from above the title to the bottom. That is acceptable.
- **P-B:** same body drift as E-C. The r2 fix landed: the arch top is at ~y 1605 real, and the prices clear it.
- **D-A:** **the prices split across columns.** 5€ sits at the foot of column 1 (y~905 disp) and 20€ at the head of column 2
  (y~580 disp), so they read as unrelated. This is a text-flow overflow, not a design. **The logo floats, as reported:** it is
  centred in the 26% header slice (`render.ts:93-95` `splitHeader`, `LOGO_SHARE`), so it lands at x~1280-1560 real. It aligns
  neither with KIZOMBA's end (x~947) nor with WORKSHOP's (x~1160), nor with the couple. Its top (y~150 real) is also below
  KIZOMBA's cap (y~70).
- **D-B: the logo is too small, as reported.** It is ~75 px wide on a 2560 canvas, against ~220 px in the option, so it reads
  as a speck in the corner. Cause: `layoutSpecs.ts:58` gives `logo: [0.88, 0.04, 0.09, 0.14]` (230x200), then
  `render.ts:128` `capAligned` shifts that zone down by up to half its height, because the header text sits far lower at
  y 0.3. That halves the zone to ~100 px tall. The title-to-arch gap is ~64 real, which is fine. Otherwise this is the closest
  of the arch family to its option.
- **picture-bottom-story (standalone):** same price split as D-A (20€ top right, 5€ bottom left). The couple is small and
  centred (x 300-790), with ~95 px of dead strip above it and empty flanks. It reads as a picture dropped below a form.

## list-story (standalone): scores

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point | 4 | UPCOMING title, then the couple; reads as a list of workshops in 5 s |
| 2 | Portability | 3 | stacked left column + card + couple bottom right; generic flier grid |
| 3 | Hierarchy/type/spacing | 3 | script dates (~70 px) compete with the title script; "Party pass 20€" (y~947) sits ~40 px over "Sat 7 Nov" with no break, so the rows run together |
| 4 | Visual-language | 3 | white includes panel |
| 5 | Taste (target) | 3 | busy left column; the target is calm |
| 6 | No AI tells | 4 | none |
| 7 | Fits frame, text fits | 4 | all text fits; includes clears the couple by ~85 px |
| 8 | Inventory | 5 | 4/4 list rows seen |
| | **Mean** | **3.6** | below the bar (mean >= 4) |

Verdict: REDO (taste, round 1).

Top fixes:
1. Script date at 0.7x (~50 px) with 48 px space above each dated row, or a thin peach rule between rows.
2. Drop the includes card and set it as a plain heading plus bullets.
3. Set "5€ per hour" at the party-pass size, directly under the last row.

## Package fixes (all in `NpmPackages/packages/poster-render/src`)

1. **Pin (hard fail, all 8 event renders).** In `layout/blockGroups.ts:67-69`, give the venue group a leading icon: a peach
   disc about 1.6x the venue line height, with a pin outline in the background colour, text indented beside it. Add the draw
   to `render/render.ts` (`drawFlow`), with the icon box reported so that AC-02 still checks it.
2. **Includes card (all renders, taste).** In `layout/blockGroups.ts:73`, drop `card:` (or make it opt-in per layout) and
   render the heading plus bullets with no fill.
3. **Price split (D-A, picture-bottom).** In `layout/textFlow.ts`, keep the two price groups together in one column (never
   break between 5€ and 20€). Or give the D-A landscape body in `layout/layoutSpecs.ts:54` the option's three columns
   (venue | levels | prices) plus a bottom includes band.
4. **D-A logo floats.** Add an explicit `logo` rect to D-A landscape in `layout/layoutSpecs.ts:54`, just right of the title
   block with its top at KIZOMBA's cap (about `[0.40, 0.045, 0.09, 0.17]`). Or make `render.ts:93-95` place the logo at the
   measured right edge of the header text + 0.02w instead of centring it in a fixed 26% slice.
5. **D-B logo too small.** In `render/render.ts:128`, skip `capAligned` when `geo.logo` is explicit. Set
   `layoutSpecs.ts:58` `logo` to about `[0.86, 0.03, 0.11, 0.18]`, so the logo is ~250 px wide, as in the option.

After fixes 1-5, re-render all 9 and send them to a new critic round, with the pin seen on every event render.

## NOT COVERED

- No pixel measurement of AC-02 overlap; this check is visual only.
- Dark/alt palettes and the post/square formats were not rendered.
- No mask diff was run.
- Sizes for the phone and desktop renders were read from downscaled displays (x1.27 / x1.28).
- The taste ledger does not exist.
