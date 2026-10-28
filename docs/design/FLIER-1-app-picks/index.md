# FLIER-1 "Flier Studio" app picks (2026-10-28)

Page: `index.html` (published as an Artifact, answers in its `db` store, `apply-answer-ui.py` key `flier1-app-picks`).
Captures: `capture.cjs` serves `dist/` of apps/flier-studio main (a959cc8), opens it fresh per frame, applies an option as injected CSS/DOM (app source untouched), scrolls to the same anchor, captures with Playwright device descriptors (Galaxy S9+ at 360x640, Desktop Chrome at 1280x800). Before = the same steps with no injection. Records: `result.json` (`pairMethod` same-steps, `countMethod` visible-in-frame, `rowsMethod` auto). Scrolled sweep frames: `img/parts/`.
Gate: `check-before-after.mjs` 0 problems for this folder (2026-10-28).

## Q1 — App accent and palette (proposal for `FLIER_TOKENS` in `@dloizides/design-tokens`)

Shared light neutrals: background `#f5f4f2` (flier sand background), surface `#fbfaf8`, surfaceElevated `#ffffff`, text `#2f2925` (13.7:1 on surface), textSecondary `#6f655c` (5.2:1 on background, 5.5:1 on surface), border `#ddd6cd`.
Shared dark neutrals (flier Night palette): background `#1c1a17`, surface `#25221e`, surfaceElevated `#2c2824`, text `#f4efe8` (13.8:1), textSecondary `#a59a8c` (5.7:1 on surface), border `#3a352f`.

| Option | primary / onBrand | ring + slider | heading mark | dark primary / onBrand | Contrast |
|---|---|---|---|---|---|
| P-A Ink | `#4a423c` / `#ffffff` | `#4a423c` | `#e9b47f` underline | `#e8dccb` / `#1c1a17` | 9.8:1 button; 12.8:1 dark |
| P-B Peach | `#e9b47f` / `#2f2925` | `#9a5a26` (focusRing token) | `#e9b47f` | `#e9b47f` / `#1c1a17` | 7.7:1 button; ring 5.4:1 on white (peach alone is 1.7:1, fails 3:1) |
| P-C Burnt amber | `#9a5a26` / `#ffffff` | `#9a5a26` | `#d9a06a` | `#d9a06a` / `#1c1a17` | 5.4:1 button |

Today: `KATALOGOS_TOKENS` primary `#005f73` (main.ts:26, pwa-sw.config.cjs, scripts/themeColor.ts); critic r4 criterion 4 = 3.

## Q2 — Previews at 360 px (start ~2,500 px below the form today)

| Option | At 360 | At 1280 | Moved |
|---|---|---|---|
| L-A Sticky mini-preview | fixed bottom bar: thumbnail of the selected flier, "Flier 1 of 4", "See all 4" (jumps to previews) | unchanged | nothing removed; bar covers the bottom 88 px, content scrolls above it |
| L-B Edit / Preview tabs | sticky two-tab switch at the top; Edit = prompt + form + configs, Preview = 4 cards + Edit/Download + Download all | unchanged | every item stays, one tab at a time |
| L-C Previews first | previews above the form as a horizontal swipe strip | unchanged | previews moved above the form |

New strings (need `FM()` keys at build): "See all 4", "Live preview", "Flier {n} of {total}", "Edit", "Preview ({n})".

## Information inventory (one role: anonymous user) — 45 items, every option 45/45

- Prompt panel (2): Describe the flier, Generate.
- Flier form (19): Layout, Format, Colours, Fonts, Background, Upload picture, Upload logo, Picture alignment, Picture size, Title, Second title, Script line (date), Includes heading, Footer, Venue, Schedule, Prices, Includes, List rows.
- Flier actions (2): Add flier, Remove this flier.
- Previews (13): 4 flier canvases, 4 Edit flier, 4 Download PNG, Download all PNGs.
- Saved configs (9): Config name, Save, Saved config, Load, Rename, Delete, Export file, Import file, Load Kizomba preset.

Measured per option and viewport by a scrolled visible-in-frame sweep (box in viewport and clip ancestors, not hidden, `elementFromPoint` hits it); side-by-side rows auto-discovered on every sweep frame, 0 rows off by more than 1 px (21-48 row pairs checked per sweep). Detail: `result.json` → `options.<id>.inventorySweep`.

## Not covered

design-critic run 2026-10-28 (critique-2026-10-28-picks.md): P-A 4.1, P-C 4.1, L-A 4.0, L-B 4.0 PASS; P-B 3.9, L-C 3.5 REDO, withdrawn on the page, not pickable. P-C heading mark #d9a06a and L-B underline tab applied and re-captured. Dark mode not rendered. No real device. Mocks are injected DOM, not built components; motion of the bar/tabs not specified yet.
