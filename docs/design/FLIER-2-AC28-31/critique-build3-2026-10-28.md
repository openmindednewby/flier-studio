# Critique 2026-10-28, build round 3: FLIER-2 "Flier Studio follow-ups" AC-28..34, option B "Sidebar switches the panel" (D21)

Critic: design-critic. Style-only round (DESIGN-TIER-1): re-checks ONLY the three fixes owed by `critique-build2-2026-10-28.md` (PASS, mean 4.0, lowest #3 = 3). Judged from captures of the BUILD at flier-studio 70e71f4 (`npm run build`, then `vite preview :4192` started and stopped by Playwright `webServer`), in `build3/` beside this file. Viewports 360x640 (touch) and 1280x800, light and dark.

Frames: `build3/build3-<w>-<scheme>-<shot>.png`. Shots: top; replace-list; mini-bar, mini-see (360); replace-marks; replace-unticked, replace-unticked-marks (match 1 unticked); fliers-tap (All fliers, then Fliers, with replace active); mini-see-unticked (360); after-apply; after-apply-fliers.

Fixture: as in round 2, "Beginners" rewritten to "Level 1" in `localStorage['flier-studio:fliers']` and reloaded: 6 matches in 4 fliers.

## The three owed fixes

| # | Owed fix | Landed? | Evidence |
|---|---|---|---|
| 1 | Mark outline in fixed dark ink + white halo; ticked vs unticked distinct in light AND dark | **yes** | Computed in all four runs: border `rgb(74,66,60)` 2px, `box-shadow 0 0 0 1px rgb(255,255,255)`, the same in light and dark. Ticked: solid border, solid ink badge with white digit. Unticked: dashed border, hollow badge (white fill, dashed ink border, ink digit). In dark the outlines now read on the cream paper, and mark 1 (dashed, hollow badge) is clearly not marks 2-6 (`build3-1280-dark-replace-unticked-marks`, `build3-360-dark-mini-see-unticked`). |
| 2 | 360: See and Fliers land below the sticky rail | **yes** | Sticky rail bottom = 63 px. After See: first flier top = 72 px; after Fliers: 72 px; after See with match 1 unticked: 72 px, in both schemes. The full "KIZOMBA WORKSHOP" title and the marks 1-2 are in view under the rail (`build3-360-*-mini-see`, `build3-360-*-fliers-tap`). |
| 3 | 1280 replace list: no half-cut row; plural copy | **yes** | `replace-matches` has `max-height: none`, `overflow: visible`, clientHeight = scrollHeight = 701 px: no inner scroll, 0 rows cut. All 6 rows show whole (`build3-1280-light-replace-unticked`). After apply the count reads "1 match in 1 flier, 0 ticked" (was "1 matches in 1 fliers"). |

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| Lost item | pass (92/92 carried) | The fix commit 70e71f4 removes no `data-testid` from `src/` (`git diff 19debe0 70e71f4 -- src`). Every panel was walked in round 2 (92/92); this round re-walked the replace flow only. |
| FORM-ALIGN-1 | pass | Find / Replace with at 1280 unchanged (round 2: dTop 0, dH 0). |
| Pair parity | n/a | Build sighting, no before/after pair. |
| TEXT-FIT-1 | pass | 0 overflow or spill findings and no horizontal scroll in 40 measured frames. |

No hard fail. No pick page carries this build; nothing withdrawn.

## Scores (1-5)

| # | Criterion | Score | Change |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | = |
| 2 | Portability | 4 | = |
| 3 | Hierarchy, type, spacing, colour | 4 | 3 → 4: the three defects behind the 3 are gone (dark marks visible and distinct, no flier under the rail, no cut row). |
| 4 | Visual language | 4 | = (unticked still shown by shape: dash + hollow badge) |
| 5 | Taste ledger / fidelity to D21 | 4 | = |
| 6 | No AI tells | 4 | = |
| 7 | 360 + 1280 designed, text fits | 4 | = |
| 8 | Inventory k/n | 5 | = (92/92) |
| | **Mean** | **4.1** | lowest = 4 |
| | **Verdict** | **PASS** | All three owed fixes landed; every criterion ≥ 4. |

## Notes for later (not owed)

- With the inner scroll gone, a long match list pushes "Replace N ticked" down the page: at 1280 with 6 matches it sits at the bottom edge (y ≈ 760-800). With 10+ matches it falls below the fold. A sticky Apply bar at the panel foot would keep it one glance away; judge when a larger fixture exists.

## Not covered

Only the replace flow was walked (other panels carried from round 2). Motion of marks and scroll jumps not judged (stills). No real phone. Contrast of the white halo against the flier paper judged by eye, not as a WCAG ratio. "Level 1" exists only through the seeded fixture. Keyboard/pad walk not run.
