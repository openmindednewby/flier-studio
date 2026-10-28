# Critique 2026-10-28, build round 2: FLIER-2 "Flier Studio follow-ups" AC-28..34, option B "Sidebar switches the panel" (D21)

Critic: design-critic. Judged from captures of the BUILD at flier-studio 60b5d71 (`npm run build`, then `vite preview :4192` started and stopped by Playwright `webServer`), in `build2/` beside this file. Viewports: 360x640 (touch) and 1280x800, light and dark, **every rail panel in both schemes**. Compared with round 1 `critique-build-2026-10-28.md` (REDO, mean 3.9) and its three top fixes.

Frames: `build2/build2-<w>-<scheme>-<shot>.png`. Shots: top; panel-{form,all,drafts,ai,configs,previews}; fliers-after-tap (All fliers, then Fliers); rail-collapsed (1280); replace-list, replace-marks (Find "Level 1", Replace with "Beginners", before apply); mini-bar and mini-see (360: bar, then tap See); replace-unticked and replace-unticked-marks (match 1 unticked); after-apply and after-apply-fliers.

Fixture note: the shipped preset renames "Level 1" to "Beginners" on load (`src/presets/kizomba.ts:9`), so the default fliers contain no "Level 1". For each run the critic rewrote "Beginners" to "Level 1" in `localStorage['flier-studio:fliers']` and reloaded. That gave 6 matches in 4 fliers: 3 Schedule rows and 3 List rows on flier 4.

## Round-1 fixes: did they land?

| # | Round-1 fix | Landed? | Evidence |
|---|---|---|---|
| 1 | Mark on the matched line, numbered, dashed when unticked | **yes** | Each mark outlines the "Level 1 20:00 - 21:00" line on its flier, with its number badge just left of the line. Flier 4's 4/5/6 sit on their own rows. Match 1 unticked shows a dashed border (`build2-1280-light-replace-unticked-marks`). No badge covers a title. |
| 2 | 360 Live preview bar shows "N highlighted" + See | **yes** | The bar reads "Flier 1 of 4 / Live preview / 6 highlighted" with **See** (44 px) beside "See all 4" (`build2-360-light-mini-bar`). Tapping See scrolls to flier 1 with marks 1-4 in view (`build2-360-*-mini-see`). After apply it reads "1 highlighted" (the unticked match left). |
| 3a | Marks keep a solid fill in dark mode | **badge yes, outline no** | The badge is solid in both schemes: light `rgb(74,66,60)` with white text; dark `rgb(232,220,203)` with `rgb(28,26,23)` text. The outline uses `--brand-fill`, which in dark is the same cream as the flier paper, so the outline is invisible on the flier. The unticked dashed mark 1 then looks the same as the ticked marks (`build2-1280-dark-replace-unticked-marks`, `build2-360-dark-mini-see`). |
| 3b | Tapping "Fliers" makes it the active rail item | **yes** | After tapping All fliers and then Fliers, `aria-current="true"` is on `nav-previews` and the accent bar moves to Fliers at both widths and in both schemes (`build2-*-fliers-after-tap`). |

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| Lost item (inventory 92, role Visitor) | **92/92 pass** | Every `data-testid` seen visible in round 1 (117) is visible again in round 2 (121 seen; new: `mini-highlighted`, `mini-see-marks`, `draft-restore-2`, `draft-star-2`). No testid present in the round-1 DOM is missing. `lead` is unchanged in the header (`src/main.ts:223`). State rows 53, 54, 55, 61 and 62 have the same code paths as round 1 and were not triggered on a picture. |
| FORM-ALIGN-1 | pass | At 1280, Find and Replace with: dTop 0, dHeight 0. Config name and Save: 0 / 0 at both widths. At 360, Find and Replace with are stacked (dTop -80.4, not one row). |
| Pair parity | n/a | Build sighting only, no before/after pair. |
| TEXT-FIT-1 | pass | 0 text-overflow or parent-spill findings in 76 measured frames, and no horizontal scroll. |

No hard fail. No pick page carries this build, so nothing is withdrawn.

## Scores (1-5)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | At 1280 the three fliers sit across the top, the Title field has focus, and the rail reads as the app's six sections. |
| 2 | Portability | 4 | The rail and the replace list name this app's fliers and fields. |
| 3 | Hierarchy, type, spacing, colour | 3 | Light is clean and the marks now point at the line, not the title. In dark, the cream outline on cream paper disappears, so "ticked" and "excluded" read the same on the fliers. The See and Fliers jumps at 360 park the flier's top 40-60 px under the sticky rail ("WORKSHOP" is cut). The 1280 replace list still clips row 4 mid-line inside its fixed height. |
| 4 | Visual language | 4 | One chrome language. The 3 px accent bar on the active rail item reads in greyscale. The unticked state uses shape (dash), not colour alone. |
| 5 | Taste ledger / fidelity to the pick (D21) | 4 | Marks sit on the matched line as in the picked mockup, and the fliers stay the visual centre (D13/D18), with no badge on a title. |
| 6 | No AI tells | 4 | None seen. |
| 7 | 360 + 1280 designed, text fits | 4 | At 360 the marks are one tap from the list (See), and both widths are designed. |
| 8 | Inventory k/n true on picture | 5 | 92/92. |
| | **Mean** | **4.0** | lowest #3 = 3 |
| | **Verdict** | **PASS** | Every criterion is ≥ 3, the mean is ≥ 4, there is no hard fail and the inventory count is true. Fixes 1 and 2 below are owed before ship. |

## Top fixes

1. `src/ui/sidebar.css` `.replace-mark`: the outline must not follow the app scheme, because the flier paper is the same in both schemes. Draw it in a fixed dark ink (light `--brand-fill`, `rgb(74,66,60)`) with a 1 px white outer halo (`box-shadow: 0 0 0 1px #fff`, through a token) in both schemes. Give `.replace-mark.off > b` a hollow badge (surface fill, dashed border) so the excluded state also shows on the badge.
2. At 360, Fliers and See scroll to the figure with no offset for the sticky rail (`miniPreview.ts` See handler, `sectionNav.ts` `show` for Fliers). Add `scroll-margin-top` equal to the rail height (the `72px` already used for `.controls > .card`) to `.preview-grid` and its figures, so each flier's title lands below the rail.
3. 1280 replace list: drop the fixed-height inner scroll, or size it to whole rows, so row 4 is never cut mid-line. Also fix the plural in `replace.count`: it reads "1 matches in 1 fliers" after apply.

## Not covered

Motion of the rail and of the marks appearing was not judged (stills only). The keyboard and pad walk of the rail was not run. State rows 53, 54, 55, 61 and 62 were not triggered. Whole word only was not captured. No real phone was used. "Level 1" exists only through the seeded fixture: the shipped preset has no "Level 1". Contrast was judged by eye, not measured as a WCAG ratio.
