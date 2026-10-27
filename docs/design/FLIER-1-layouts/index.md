# FLIER-1 "Flier Studio" wave 2: layout pick

Page: `index.html` (this folder), published as a claude.ai Artifact with the `db` capability.
Answers: collection `answers`, doc ids `q1..q3`, body `{question, choice, choiceText, note, doc, updatedAt}`, doc key `flier1-layouts`.

## Questions
- Q1 Event flier, Sat 31 October, story 1080x1920: E-A picture right whole · E-B picture left, text right · E-C text on top, dancers on an arch, prices flank them.
- Q2 Phone wallpaper 1170x2532: P-A clock-clear top 28%, picture right · P-B clock-clear top, dancers on an arch.
- Q3 Desktop wallpaper 2560x1440: D-A details left (3 columns), picture right · D-B dancers centred on an arch, titles left, details right.

## How the pictures were made
- Before: a scratch copy of `KizombaWarrior/docs/event fliers/flier-studio/index.html` + `assets.js` (picture cropped 60px and faded), only `W,H` changed per format. The story before is pixel-identical to the shipped `fliers/workshop-20261031.png` (0 px differ).
- After: `mock.html` with the uncropped `jimmyAndIsminiWorkshopYounger.png`, placed by contain + anchor; layer order background, picture, text. Rendered headless by `render.cjs`.

## Measurements (`measure.json`, `result.json`)
| Option | Inventory | Picture inside canvas | Picture px covered | Text overflow |
|---|---|---|---|---|
| E-A | 11/11 | yes | 0 / 392,663 | none |
| E-B | 11/11 | yes | 0 / 420,279 | none |
| E-C | 11/11 | yes | 0 / 256,534 | none |
| P-A | 11/11 | yes | 0 / 463,326 | none |
| P-B | 11/11 | yes | 0 / 263,667 | none |
| D-A | 11/11 | yes | 0 / 572,851 | none |
| D-B | 11/11 | yes | 0 / 572,819 | none |

Covered = pixels under the picture's opaque mask (alpha > 8) that differ between the full render and a background+picture render. The desktop before shows 8/11 (party price, includes, footer fall below 1440 in today's hard-coded layout).
Gate: `personalServerNotes/scripts/check-before-after.mjs` 0 problems; planted `data-inventory="10/11"` went red.

## Round 2 (2026-10-27, after `critique.md`)
Live page republished with "Withdrawn — do not pick" on E-C, P-B, D-B (version 2). Redrawn in `mock.html` (round 1 kept as `mock-r1.html`, old captures in `img/r1/`); banners stay until design-critic passes round 2.
| Option | Change | Couple scale vs r1 | Picture bottom | Min text-to-arch/picture px | Covered |
|---|---|---|---|---|---|
| E-C | couple 1.35x, bottom-anchored, head breaks the arch crown; includes line moved under the venue/levels row, third rule removed; prices flank the crown | 1.351 | 1920 = edge | 48 (Party pass) | 0 / 468,011 |
| P-B | couple 1.36x, bottom-anchored; venue + Level 1 + Level 2 in one row, includes under it; prices flank the crown; top 28% still clear | 1.361 | 2532 = edge | 46 | 0 / 488,095 |
| D-A | couple bottom anchored to the frame edge (was 70 px above) | 1.0 | 1440 = edge | 90+ | 0 / 572,851 |
| D-B | couple bottom-anchored; titles 0.85x, vertically centred, only titles on the left; right column moved +70 px off the arch; footer under the includes | 1.0 | 1440 = edge | 47 (script date), WORKSHOP 58 | 0 / 572,819 |
Clearance probe (`report.clear` in `measure.json`): min distance from every text box to arch-panel or opaque picture pixels; planted round-1 D-B geometry reads WORKSHOP 0 px, script 0 px (red as expected).

## Round 2 verdicts (`critique-2026-10-27-r2.md`) and republish (version 3)
Round-2 captures replace round 1 in `img/` (E-C, P-B, D-A, D-B; r1 kept in `img/r1/`). No hard fail on any option.
"Withdrawn" banners removed; E-C, P-B, D-B carry "Reviewer unsure (taste call, x.x/5): your pick" and are pickable again (Q labels say "reviewer unsure, your pick"). Each card shows its critic score.
| Option | Critic score | Verdict |
|---|---|---|
| E-A | 4.5 | PASS (r1) |
| E-B | 4.1 | PASS (r1) |
| E-C | 3.9 | ESCALATE (taste, r2) |
| P-A | 4.3 | PASS (r1) |
| P-B | 3.6 | ESCALATE (taste, r2) |
| D-A | 4.25 | PASS (r2) |
| D-B | 3.9 | ESCALATE (taste, r2) |
Before/after pairs, inventory attributes and the db pick wiring (`answers`, `q1..q3`) unchanged.
