# Critique 2026-10-28, build round 5: FLIER-2 "Flier Studio follow-ups", style-only (DESIGN-TIER-1)

Critic: design-critic. Re-check of the round-4 REDO (`critique-build4-2026-10-28.md`, change 2: the Replace badge hid the matched text). Before = flier-studio 0a9b96a, after = b9d5bdc. Each sha was built in its own git worktree (`vite build`), served by `vite preview` (before :4193, after :4194; Playwright `webServer` starts and stops it), and captured with the same spec (`build5/critic-build5.spec.ts.txt`: the round-4 spec narrowed to the marks, plus a second search). Viewports 360x640 (touch) and 1280x800, light and dark. Fixture as in rounds 2-4: "Beginners" rewritten to "Level 1" in `localStorage['flier-studio:fliers']`, 6 matches in 4 fliers. A second search for "Intermediates" (the e2e's word) adds 6 more matches.

Frames: `build5/<before|after>-<w>-<scheme>-<shot>.png`. Shots: `replace-marks`, `mark1-zoom` (column 1), `mark-col2-zoom`, `replace-unticked-marks`, `mark1-unticked-zoom` (match 1 unticked), `intermediates-marks`. Measurements per mark (badge rect, mark rect, overlap with its own mark and with every other mark, in-viewport): `build5/measure-<before|after>-<w>-<scheme>.json`.

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| Lost item | pass (92/92 carried) | b9d5bdc changes badge placement in `replacePanel.ts`, two CSS rules, and adds two e2e tests. No `data-testid` is added or removed. |
| FORM-ALIGN-1 | pass | No form row touched. |
| Pair parity | pass | Both shas use the same route, fixture, viewport, scheme, steps and scroll anchor (360: mini "See"; 1280: `preview-grid` top - 16). Every run records the same `pair` block. A pixel diff of each before/after pair is empty except for the 43x41 px box where badges 1 and 3 move (360 only). |
| TEXT-FIT-1 | pass | No horizontal scroll in any of the 8 runs. |

## The change: badge moves above its mark only within 30 px of the viewport's left edge

**Fixed.** Measured across 3 mark sets x 2 widths x 2 schemes (72 badges in the after build):
- **No badge covers any mark.** `coverOwnPx = 0` and `coverOtherMarksPx = 0` for every badge, ticked and unticked. "Level 1 20:00 - 21:00" reads in full in `after-360-*-mark1-zoom.png`; in round 4 only "20:00 - 21:00" was visible.
- **The move is scoped correctly.** At 360 only the column-1 marks (x = 20) get `badge-inside`. Their badge sits at x 20-42, 2 px above the mark with left edges aligned, fully on screen (before: x = -4, cut in half). Column-2 badges keep their gutter place (x 166, centred on the line, `dy = 0`), as before.
- **1280 unchanged.** Every badge keeps x 547 / 779 / 1011, 2 px left of its mark, `dy = 0`. All 12 frame pairs at 1280 are pixel-identical before and after.
- **Unticked.** The dashed, hollow badge moves the same way and stays legible on the flier paper in both schemes.

**What it costs.** At 360 the lifted badge sits on the flier's orange location pin beside "Bailemos / Dance School" (column 1, both fliers). The pin is decoration, not the match, and is covered only while Replace marks are shown. Columns 1 and 2 now place the badge differently (above vs left). The aligned left corner keeps each badge visibly tied to its mark, so this is noted, not scored down.

## Scores (1-5)

| # | Criterion | Score | Change |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | 3 → 4: the matched text is the focus again |
| 2 | Portability | 4 | = |
| 3 | Hierarchy, type, spacing, colour | 4 | 2 → 4: the badge clears the text, 2 px from the mark, in both schemes |
| 4 | Visual language | 4 | = |
| 5 | Taste ledger / fidelity to D21 | 4 | = |
| 6 | No AI tells | 4 | = |
| 7 | 360 + 1280 designed, text fits | 4 | 3 → 4: the fix stays in 360 column 1; 1280 is pixel-identical |
| 8 | Inventory k/n | 5 | = (92/92) |
| | **Mean** | **4.1** | lowest = 4 |

**Verdict: PASS.** Every criterion is ≥ 3, the mean is ≥ 4, and there is no hard fail. Round-4 change 1 (the 44 px AI link) had already passed and is not judged again.

Optional follow-up (not blocking): if the covered pin bothers the owner, move the lifted badge 4 px left (`left: -6px`). It would overhang the pin's edge rather than its centre and still sit on screen (x 16).

## NOT COVERED

- `badge-below` (a mark within 24 px of the flier's top) never triggered, because neither fixture has a match on a flier's first line.
- Widths between 360 and 1280 (e.g. 390, 768), where the 30 px threshold may catch a different column.
- Real touch device: 360 used Playwright `isMobile` + `hasTouch`. Re-layout on resize was not judged from stills.
- Keyboard focus ring on the padded AI link (carried from round 4).
