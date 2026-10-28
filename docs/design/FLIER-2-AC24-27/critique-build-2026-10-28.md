# FLIER-2 "Flier Studio follow-ups": AC-24..27 option C build critique (2026-10-28)

Critic: design-critic. Judged on the rendered pixels of the BUILT option C "Contents card, fliers first" (D18), flier-studio `ebabfa5`, `npm run build` + check-scoped `vite preview` (killed after). Fixture: kizomba preset, 4 fliers, fresh storage, clock 2026-10-28 15:00Z. Compared with the option C mockup frames (`C-*.png`) and `critique-2026-10-28.md` in this folder.

Captures (28 frames, each with a measurement record in `frames/build-*.json`): `build-{360,1280}-{light,dark}-{top,editing,drafts,generate,fliers,folded,folded-reload}.png`. `folded` = every Flier group (Layout, Pictures, Text) folded; `folded-reload` = the same page after a reload.

## Verdict

**REDO (hard fail: FOCUS-1 at 1280).** No score and no rank (OPTION-GATE-1 procedure). Every other gate passes; the advisory notes below are for the next round.

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| Lost item (inventory, 76 rows) | pass, no loss found | All 62 `probe` rows render at 360 (light + dark). At 1280, 58/58 render; the 4 `mini-*` rows are mobile-only, also absent in `before-1280` and `C-1280`. The 14 `state` / `absent-live` rows (dialogs, invalid, pending, status) were not re-driven in this run; `lead` has no testid and is seen by eye in every top frame. New `ai-entry` link is an addition. |
| FORM-ALIGN-1 | pass | `misaligned: []` in all 28 frames (every `.row`, 1px tolerance). Theme / Shared text edits, Config name / Save share top edge and height by eye. |
| Text fit (TEXT-FIT-1) | pass | `textFit: []` in all 28 frames, `hscroll: false` everywhere; the 360 drafts row wraps "10/28 / 5:00 PM" inside its box. |
| Hit boxes | pass | `under44: []` (nav links, fold toggles, header controls). |
| **FOCUS-1** | **FAIL** | 1280 default: focus on load = `field-title` (`src/main.ts:205` → `src/ui/formView.ts:101-103`, `preventScroll: true`), but Title sits in the Text group below the fold: `field-title` is not in the viewport in `build-1280-*-top.png`, so a keyboard user types into a field they cannot see. 1280 after the viewer folded Text (`folded-reload`): focus on load = `BODY`; the named control is inside a folded group and the focus call silently does nothing. 360: none, by the documented choice (`index.md:15`), not counted. |
| PAIR-PARITY-1 | n/a | Build sighting, not a before/after pair. |

## Spec checks

| Check | Result |
|---|---|
| AC-24 on-device AI named | pass: "Generate with on-device AI" entry on the first screen at both sizes (critique round 1 fix 1 adopted); Generate card reads "On-device AI" badge + "Without WebGPU, a keyword match fills the flier." (`build-1280-dark-generate.png`, `build-360-light-generate.png`) |
| AC-25 contents card, left column | pass: 2x3 numbered card at the top of the left column, All fliers / Flier / Drafts beneath |
| AC-26 folding headers that remember | pass: Layout, Pictures, Text fold; after reload `group-toggle-*=false`, cards stay open (`folded-reload` frames) |
| AC-27 Download all on the header row | pass: `dlOnHeader: true` in every frame; now content-width at 1280 (the mockup's 590 px bar is gone) |
| Previews visible while editing low in the form, 1280 | pass: `field-items` focused, all 4 previews in view, Drafts in view (`build-1280-light-editing.png`) |
| Drafts reached | pass at both sizes by page scroll |
| Dark mode | pass by eye: card, chip and Save fills read; crop marks visible on the dark ground |

## Advisory (not a score; for the next round)

Against the C mockup the build is as calm or calmer: fliers still the first thing on the right at 1280, the wide Download bar is gone. Two things read worse than the mockup:
- 1280 header: the AI entry sits alone in column 2, row 2 (`styles.css:165`), under Download all with a ~64 px empty band before the cards; it reads as an orphan button rather than part of the header row.
- 360 first screen: header + AI entry + contents card fill the whole 640 px; the only flier on screen is the mini bar. The "ON THIS PAGE" label (round 1 fix 2) was not dropped.

## Top fixes

1. **FOCUS-1 (the hard fail):** make the 1280 initial focus visible and robust. Move `field-title` to the first row of the Flier card (above the Layout group, still in the Flier card, nothing removed) so it is in the first viewport, and in `src/ui/formView.ts:101-103` fall back to `group-toggle-text` when Title is not rendered (Text folded). Record the 1280 / 360 choice in the app's focus ledger.
2. **1280 header:** in `src/ui/styles.css:162-165` put `.ai-entry` on the top row beside Download all (`grid-row: 1; justify-self: end`, Download all last), so the header is one row + lead and the fliers rise ~60 px.
3. **Contents card:** remove the visible "ON THIS PAGE" heading (`src/ui/sectionNav.ts:22`, `styles.css:149`); keep it as the nav `aria-label` only. Saves ~30 px of the 360 first screen.

## NOT COVERED

State inventory rows (import / cutout dialogs, invalid, render-pending, status messages) not re-driven; fold/unfold motion and contents-card jump behaviour judged from stills; keyboard walk of the nav and toggles not run; no real device; Lighthouse not run.
