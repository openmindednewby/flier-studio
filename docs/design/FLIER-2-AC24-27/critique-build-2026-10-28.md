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

---

# Round 2 (2026-10-28), build `21e99cb`

Critic: design-critic. Judged on the designer's `build-r2/` before/after pairs (focus JSON per frame) plus a critic re-capture: `npm run build` + check-scoped `vite preview :4199` (killed after), 360 (Galaxy S5) and 1280x800, light AND dark, shots top, editing, drafts, generate, configs, pictures, text, fliers, folded, folded-reload; same `scan` as round 1 (testids rendered, `.row` alignment, text fit, 44 px, hscroll) plus focus, header row and "On this page" probes. Fixture: kizomba preset, 4 fliers, clock 2026-10-28 15:00Z.

## Round 1 fixes

| Fix | Result | Evidence |
|---|---|---|
| 1. FOCUS-1 at 1280 | **landed** | Load: focus `field-title`, in view (Title is now the first field of the Flier card, y ~740 of 800), light and dark. Text folded + reload: focus `field-title`, in view (Title no longer lives in the Text group, so the fold cannot hide it; `formView.ts:102` keeps `flier-form-toggle` as the fallback). Matches `build-r2/after-1280-*.json` `focusedInView: true`; before was `false` / `BODY`. 360: `BODY`, the documented choice, unchanged. |
| 2. 1280 header one row | **landed** | `ai-entry`, `download-all` and `brand` share one line at 1280 light + dark; Download all last; fliers rise from y 192 to 160 (`flier1Top`). At 360 the AI entry wraps to its own row under the lead (by width, expected). |
| 3. No "On this page" heading | **landed** | Text absent from `innerText` in all 40 states; contents card starts with 01 All fliers. |

## Hard fails (re-checked)

| Check | Result | Evidence |
|---|---|---|
| Lost item (76 rows) | pass, **76/76** | Rendered testid set identical to round 1 in every run: 360 light 86/86, 360 dark 86/86, 1280 light 82/82, 1280 dark 82/82; none lost, none new. Title moved to the top of the Flier card (same card, visible, labelled), not removed. State rows (dialogs, invalid, pending, status) not re-driven, same as round 1. |
| FORM-ALIGN-1 | pass | `misaligned: []` in all 40 states (every `main .row`, 1px). Theme / Shared text edits share top edge and height by eye in both themes. |
| PAIR-PARITY-1 (`build-r2/`) | pass | The 3 pairs (1280 top, 1280 Text-folded reload, 360 top) carry identical `pair` records (route, state, fixture, viewport, anchor `scrollTo(0,0)`); the images differ only by the build. |
| TEXT-FIT-1 | pass | `textFit: []` (header buttons/links/lead, nav, main buttons, headings, labels, paragraphs) and `hscroll: false` in all 40 states. |
| Hit boxes | pass | `under44: []`. |

## Score (option C build, round 2)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | 1280: three fliers own the right two-thirds on load. 360: first screen still header + AI entry + contents card; the flier is only the mini bar. |
| 2 | Portability | 4 | Numbered contents card, crop marks on the fliers, real kizomba content; not a stock dashboard. |
| 3 | Hierarchy / type / spacing | 4 | Header now one row at 1280 and the orphan band is gone. 360 leaves a ~48 px empty band between the AI entry and the contents card. |
| 4 | Visual language | 4 | One warm neutral ramp, one dark fill (Download all) per screen, outline buttons elsewhere, same in dark. |
| 5 | Taste ledger | 4 | Calm, decides by seeing (fliers first at 1280); nothing a ledger row rejected. |
| 6 | No AI tells | 5 | No gradient, no violet, no card trio, no emoji. |
| 7 | 360 + 1280 designed, text fits | 4 | Both designed, all states fit; 360 first screen spends its height on chrome. |
| 8 | Inventory k/n | 5 | 76/76, Title moved within its card and drawn there. |

**Mean 4.25, lowest 4. PASS** (every criterion >= 3, mean >= 4, no hard fail). `data-inventory="76/76"`, `data-aligned="pass"`.

## Top fixes (optional, no re-review needed for PASS)

1. 360: remove the ~48 px gap under "Generate with on-device AI" (header bottom margin to the 16 px card gap), so the All fliers controls start above the fold.
2. 360: put "Generate with on-device AI" on the brand row's second line at full width with the same height as Download all, so the header reads as one block instead of a lone button.

## NOT COVERED

State inventory rows (import / cutout dialogs, invalid, render-pending, status messages) not re-driven; keyboard walk of the nav and fold toggles not run; fold motion judged from stills; focus ledger entry for the 1280 / 360 choice not opened; no real device; Lighthouse not run.
