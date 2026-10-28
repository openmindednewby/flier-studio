# Flier Studio mark: all nine (LOGO-1 "A logo pipeline that makes beautiful, animatable marks", D3)

Source of the pick page `index.html` (built by `build_all.py`, answer UI by `report-standards/apply-answer-ui.py`, doc key `flier-logo-all`). Owner decision D3: show every mark drawn and the owner picks.

| Pick | Mark | Source | Critic | Mean | Why | Motion |
|---|---|---|---|---|---|---|
| A | Trim | FLIER-2 page 3, A (round 2) | REDO | 3.9 | Generic crop-tool frame; 16 px ticks 1 px; 512 mark ~40% of tile | none drawn |
| B | Crop F | FLIER-2 page 3, B (round 2) | PASS | 4.3 | Strongest silhouette, holds at 16 px; F monogram still common | none drawn |
| C | Register | FLIER-2 page 3, C (round 2) | REDO | 3.5 | Ring + cross blob at 16/32 px; two ideas in one mark | none drawn |
| D | Dealt F | LOGO-1 r1 R1 | REDO | 3.2 | Too close to the Flipboard F | intro 760 ms, micro 280 ms |
| E | Fan deck | LOGO-1 r1 R2 | REDO | 3.4 | Stock swatch-book icon; motion scored 5 | intro 580 ms, micro 280 ms |
| F | In flight | LOGO-1 r1 R3 | REDO | 3.0 | Curl reads as a broken wedge / "J."; intro only fades | intro 580 ms, micro 280 ms |
| G | Peel | LOGO-1 r2 C2a | REDO | 3.3 | Stock folded-corner file icon at 24 px; 1.1 px gap | intro 580 ms, micro 280 ms |
| H | Lift | LOGO-1 r2 C2b | REDO | 3.1 | 36% ink at 16 px; broken-corner back | intro 580 ms, micro 280 ms |
| I | Pair | LOGO-1 r2 C2c | REDO | 3.1 | The product idea, but the back sheet smears to 1-2 px | intro 580 ms, micro 280 ms |
| X | Hire a human identity designer | `../handoff/brief.html` | | | | |

Per mark the page shows: the 512 icon, 32 px and 16 px (1x + enlarged), the header lockup on the light and the dark header, the critic verdict, and (D-I) the intro + micro played live by `@dloizides/ui-motion@1.3.0` `dist/logo` inlined (`playLogo` + `bindMicro`), with a reduced-motion toggle. R1-R3 timelines are transcribed from `../motion.md`; C2a-C2c from `../r2/motion/*.motion.json`.

Checks: scrollWidth = viewport at 360 (Galaxy S9+ descriptor) and 1280, 0 console errors, intro observed (r1 stem opacity 0.86 at 150 ms, 1 at end); captures `page-360.png`, `page-1280.png`; `check-before-after.mjs` clean for this page (`result.json`).
Critiques: `../../FLIER-2-brand-marks/critique-2026-10-28.md`, `../critique-2026-10-28-lp7.md`, `../r2/critique-2026-10-28-lp7-r2.md`.
