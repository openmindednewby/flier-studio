# Flier Studio visual language

- **Product / medium:** app (plain Vite PWA, https://fliers.dloizides.com). Someone who runs classes or parties fills one form and downloads a set of event fliers and phone wallpapers; everything stays in their browser.
- **Status:** DRAFT 2026-10-28. Verdict page 1: https://claude.ai/artifact/MQueVLiqBS8xTwESvbqvD6 (db collection `answers`, doc key `flier-vf-p1`; source `docs/design/visual-foundation/index.html`, generator `build_page1.py`). Page 1 answered 2026-10-28 06:16Z (D3). Page 2 (R2, R3, R4, R5, R7, R8, R9, R10 motion): https://claude.ai/artifact/8RiofM4FctBodMTGmhQn9y (doc key `flier-vf-p2`, source `docs/design/FLIER-2-vf-page2/`). Page 3 (R11 mark + wordmark candidates, held "do not pick yet" until design-critic passes): https://claude.ai/artifact/H46ujLaCJVYaFk6ZKso9mi (doc key `flier-vf-p3`, source `docs/design/FLIER-2-brand-marks/`).
- **Source of truth for values:** `@dloizides/design-tokens` `src/presets/flier.ts` (`FLIER_TOKENS`, 1.16.0); motion from `src/motion.ts` (`DEFAULT_MOTION`); app CSS `apps/flier-studio/src/ui/styles.css`.
- **Fleet rules:** `BaseClient/docs/code-standards/visual-language.md` binds this doc (D-VL-FLEET-1). Values below set numbers; a deviation names its measurement.
- **Content vs brand:** the Kizomba preset (Bailemos logo, dancers art, `src/presets/kizomba.ts`) is a customer's content. It may appear inside a flier frame. It never stands in for the Flier Studio brand.

## Audit (measured 2026-10-28, live 95d91d2; capture: Playwright `Galaxy S5` 360x640 DPR 3 + 1280x800, PNG; script `docs/design/visual-foundation/audit-capture.cjs`, frames `docs/design/visual-foundation/audit/`)

| Frame | Viewport | L* p10/p50/p90 | Saturated % | Edges | Note |
|---|---|---|---|---|---|
| Form top, light | 360x640 | 63/98/100 | 0.05 | 15.1 | chrome only; scrollWidth 360 |
| Form top, light | 1280x800 | 68/96/100 | 0.33 | 21.8 | form + 3 preview fliers |
| Form top, dark | 360x640 | 9/13/29 | 0.27 | 8.7 | |
| Form top, dark | 1280x800 | 9/13/96 | 0.50 | 19.9 | |
| Previews, light | 360x640 | 55/96/100 | 0.40 | 26.6 | customer fliers = the detail (allowed, R4) |
| Previews, light | 1280x800 | 64/96/100 | 0.32 | 23.8 | |
| Home-screen icon `public/icons/icon-512.png` | 512 | 5/5/32 | 7.18 | 4.2 | Bailemos logo (from `public/img/logo.png`) |
| Tab icon `public/img/logo.png` (`index.html:16`) | 500 | 0/0/61 | 10.25 | 6.6 | Bailemos logo |
| Share card `public/img/dancers.png` (`index.html:14`) | 576x1069 | 12/78/99 | 0.97 | 23.4 | Kizomba preset art; not 1200x630 |
| dloizides.com card `dloizidesLandingPage/images/flier-studio.png` | 1280x800 | 96/96/96 | 0.18 | 7.8 | a Kizomba flier still reading "Level 1/2" (pre AC-11) |

Token pairs (computed, WCAG relative luminance):

| Pair | ΔL* | Contrast |
|---|---|---|
| light background #f5f4f2 ↔ surface #fbfaf8 | 2.1 | 1.05:1 |
| dark background #1c1a17 ↔ surface #25221e | 4.0 | 1.10:1 |
| border #8c8279 ↔ surface (light) | 43.3 | 3.61:1 |
| dark border #80766a ↔ dark surface | 36.8 | 3.56:1 |
| primary #4a423c ↔ white (light button) | 71.4 | 9.83:1 |
| primary #4a423c ↔ dark surface (dark button fill + focus ring) | 15.2 | **1.61:1** |
| dark brandFill #e8dccb ↔ dark surface (token exists, unused) | 74.9 | 11.71:1 |
| accent #e9b47f ↔ surface (light) | 21.3 | 1.78:1 (decoration only) |

**Holds** (keep):
- Calm, flat chrome: no box-shadow anywhere in `src/ui/styles.css`; saturated pixels ≤ 0.5% on every tool frame. The customer's fliers are the only loud thing (fleet mood "calm back office").
- One focus-ring style (`styles.css:72`, 3px outline, offset 2) and one filled primary per view (`button.primary`, `styles.css:71`).
- Borders 3.6:1 in both themes (UI boundary ≥ 3:1).
- No horizontal scroll at 360 (scrollWidth 360).

**Fights** (ranked):
1. **R11 marks: Flier Studio has no mark of its own.** 4 of 4 owned brand surfaces (tab icon, home-screen icon, share card, dloizides.com card) carry customer content: the Bailemos logo (`index.html:16`, `public/icons/*`), the Kizomba dancers (`index.html:14`), a Kizomba flier (landing card, also stale vs AC-11). The tool chrome carries no mark at all, only "Flier Studio" in the system face.
2. **R7/R8 dark theme: primary fill and focus ring at 1.61:1** on the dark surface (`styles.css:71-72,91` use `--primary` in both themes; `main.ts:33` only sets `data-theme`). The preset already has `dark.brandFill`/`focusRing` #e8dccb at 11.71:1, unused. A fix that moves toward the rules, not gated by VISUAL-1.
3. **R1 value steps: page vs card ΔL* 2.1 (light) / 4.0 (dark)**, fleet default ≥ 15; cards separate only by the 1px border.
4. **Mood: accent as decoration.** `.group > h3` (`styles.css:54`) underlines every section heading in the accent; the fleet mood allows the accent only on the main action.
5. **R6/R8: selection = focus.** A selected flier (`figure.selected canvas`, `styles.css:91`) wears the same 3px `--primary` ring as keyboard focus (`styles.css:72`), and flier canvases share the control radius 8px.
6. **R2 two backdrops:** `.mini-sheet::backdrop` is text 60% (`styles.css:135`), `.import-dialog::backdrop` is background 72% (`styles.css:145`).
7. **R10 no motion at all:** 0 transitions/animations in `styles.css`; panels, sheet and dialog appear instantly. The motion table is greenfield.

## References and mood

- References: **print shop (crop and registration marks)**, owner D3 page 1 Q1. Rejected: poster wall, proof sheet. Page 1 Q1 asked which flier-making world the small details borrow from: A print shop (crop and registration marks), B poster wall (paste-up tape, condensed type), C proof sheet (frame numbers, grease-pencil circle). Each is a real artefact of making printed fliers, not a category cliché.
- **Mood (approved D3 Q2):** calm tool (fleet default). The flier is the loud thing; chrome is ink on paper-white. Peak budget: none on tool screens (no celebration); export success = one 200 ms cross-fade. Page 1 Q2.

## Rules (values for this product)

| # | Rule | Values (proposed) | Audit figure that justifies it | Owner verdict |
|---|---|---|---|---|
| 6 | Shape families | containers (cards, sheet, dialog) radius 12 · controls radius 8 · fliers = square paper (radius 0), selected by 4 crop-mark corners · thumbnails radius 0 · the 3px ring means keyboard focus only | fights 5; 3 radii in use today (12/8/4), canvases share the control radius | **Approved** D3 page 1 Q3 |
| 1 | Value bands (L*) | page 92 (#ebe8e3) · card 100 · hairline 55 (border, 3.4:1 on page) · secondary text 45 · ink 17 · primary 29. Deviation from fleet ≥ 15: cards separate by ΔL* 8 plus the ≥ 3:1 border, because a page at L* 85 turns the calm tool grey; dark: page 9, card 16 (ΔL* 7) | fight 3 (ΔL* 2.1 / 4.0) | **Approved** D3 page 1 Q4 |
| 2 | Key light | flat; one shadow token only on floating layers (sheet, dialog); one backdrop: background 72% | fight 6 | page 2 Q1 (with R8) |
| 3 | Saturation | tool frames ≤ 1% excluding the fliers (today 0.05-0.5%); accent only on the one main action | holds; fight 4 | accent part **Approved** D3 page 1 Q5 · ≤ 1% / texture: page 2 Q3 |
| 4 | Detail | chrome-only frames ≤ 16% edges at 360 (text-led form; today 15.1%); texture only inside fliers | audit 15.1% | page 2 Q3 (with R3, R5) |
| 5 | Figure-ground | dividers ≤ 6 L* from their card; outline only on pressable controls and the selected flier | | page 2 Q3 (with R3, R4) |
| 7 | Colour never alone | dark primary = brandFill #e8dccb (11.7:1); focus ring = focusRing token per theme; status = glyph + word | fight 2 | page 2 Q2 (fix may ship first, a11y) |
| 8 | Chrome | one filled primary per view, the rest outlined 1px; one focus ring; one backdrop | holds | page 2 Q1 (with R2) |
| 9 | Colour script | every tool screen median L* within ±10 of form-top (98 light / 13 dark) | audit | page 2 Q4 (sheet + dialog medians measured after build) |
| 10 | Motion | from `DEFAULT_MOTION`: press feedback fast 140 ms standard · sheet/dialog enter slow 300 ms decelerate, leave base 200 ms accelerate · flier re-render cross-fade base 200 ms · no overshoot · ≤ 1 moving thing · reduced motion = instant (duration `instant` 0) | fight 7 | page 2 Q5 (motion table on the page) |
| 11 | Marks | one Flier Studio mark (drawn on page 2) on tab icon, home-screen icon (incl. maskable), share card 1200x630, dloizides.com card, app header; sample fliers on owned surfaces are generic, never a customer's | fight 1 | **Approved** D3 page 1 Q6: mark on manifest/PWA icons, favicon, OG card, landing card, app header ONLY; posters keep their own content logo (owner 08:17) · candidates: page 3 |

## Derived layers (filled from the rules above, never designed separately)

| Layer | Derived from | Spec |
|---|---|---|
| Characters / figures | none | the product has no characters |
| Motion | R10 | table above; CSS `transition` values read from the design-tokens motion strings (ui-motion is RN-web only) |
| UI chrome | R6, R8, R11 | after page 1 + 2 |
| Brand (icons, share card, landing card) | R9, R11 | mark candidates on page 3 (`docs/design/FLIER-2-brand-marks/`), then regenerated via `og-image-generator` |

## Worked example

Page 1 draws the 360 form screen and the previews screen to the proposed rules (blocks Q2 A, Q3, Q4, Q5) beside today's capture. Measured figures of a built screen follow the build.

## Decision log
| Date | Decision (question as asked → answer) | Reasoning / owner's words | Measured state that made it well-formed | Process change, if any |
|---|---|---|---|---|
| 2026-10-28 | Page 1 Q1 world for small details → A print shop (crop + registration marks) | owner pick on https://claude.ai/artifact/MQueVLiqBS8xTwESvbqvD6 | 3 worlds drawn on the same 360 form screen | |
| 2026-10-28 | Q2 tool mood → A calm tool | | tool frames 0.05-0.5% saturated today | |
| 2026-10-28 | Q3 R6 shapes (cards r12, controls r8, fliers square paper, crop-mark selection, ring = focus) → Approve | | selection = focus ring today (`styles.css:72,91`) | |
| 2026-10-28 | Q4 R1 page 8 L* below card, 3.6:1 border → Approve | | ΔL* 2.1 light / 4.0 dark today | |
| 2026-10-28 | Q5 accent only on the one main action → Approve | | accent underline on every heading (`styles.css:54`) | |
| 2026-10-28 | Q6 R11 one Flier Studio mark on owned surfaces → Approve | "the requirement is not to add a different logo in the posters but the manifest and the site its self should have its own logo as its own service really" (08:17) | 4/4 owned surfaces carry Bailemos/Kizomba art | mark scope = manifest/PWA, favicon, OG, landing card, app header; never posters |

## Changelog

| Date | Rule | Change | Owner's words |
|---|---|---|---|
| 2026-10-28 | all | first draft from the audit | |
| 2026-10-28 | refs, mood, R1, R3 (accent), R6, R11 | approved on page 1 (D3) | see decision log |
| 2026-10-28 | R11 | 3 mark + wordmark candidates drawn (A Trim, B Crop F, C Register); all pass greyscale/squint/CVD ΔL* 80.7-81.4 on the 512 icon, 16 px ink cover 25.0 / 26.6 / 38.3% | |
