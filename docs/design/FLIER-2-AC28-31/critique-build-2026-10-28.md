# Critique 2026-10-28, build round 1: FLIER-2 "Flier Studio follow-ups" AC-28..34, option B "Sidebar switches the panel" (D21)

Critic: design-critic. Judged from captures of the BUILD at flier-studio 8742acb (`npm run build` + check-scoped `vite preview :4191`, killed after), in `build/` beside this file: 360x640 (touch) and 1280x800, light + dark. Compared with the picked mockup `B-*-highlight.png` / `B-*-replace.png` and `critique-2026-10-28.md` (options round, B PASS 4.1).

Frames: `build/build-<w>-<scheme>-<shot>.png`; shots: top, panel-{form,all,drafts,ai,configs,previews} (light), rail-collapsed (1280 light), replace-list, replace-marks (Find "Intermediates", Replace with "Improvers", before apply), replace-unticked, replace-unticked-marks (match 1 unticked), after-apply, after-apply-fliers.

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| Lost item (inventory 92, role Visitor) | **92/92 pass** | 86 rows seen visible in at least one frame by `data-testid` (all six rail panels opened); `prompt-status`, `mini-sheet` in the DOM; `lead` seen in `build-1280-light-top` (no testid, `src/main.ts:223`); `pick-theme-scope` absent-live as in the inventory; dark captured; rows 75 (fliers beside the form, 1280 top) and 76 (Generate heading + on-device wording, panel-ai: `generate`, `ai-note`, `prompt-text`, `prompt-generate` in view) on the picture. State rows not triggered on a picture: 53 list-hint, 54 invalid, 55 render-pending, 61 import-dialog, 62 cutout-dialog (code paths present: `previews.ts:23`, `importDialog.ts:33`, `cutoutDialog.ts:89`; the build did not touch them). |
| FORM-ALIGN-1 | pass | 1280: Find + Replace with dTop 0 / dHeight 0; Config name + Save 0 / 0. 360: Find and Replace with stacked (not a side-by-side row), Config name + Save 0 / 0. |
| TEXT-FIT-1 | pass | no element with text wider than its box or spilling its parent in any of 42 frames; no horizontal scroll; "Saved configs" wraps to two lines inside its rail cell at both widths. |
| FOCUS-1 | pass (as in the option) | 1280: `field-title` focused at y 263, in view, not destructive. 360: BODY (no field focused, so no keyboard pops on a phone); same as the picked mockup, which round 1 passed. |
| Highlight visible before apply | pass, with a defect (see #3) | 6 numbered marks drawn on the fliers before "Replace 6 ticked"; unticked match 1 drawn dashed (`build-1280-light-replace-unticked-marks`). The marks are numbered badges stacked at each flier's top-left corner, not over the matched word. |
| Pair parity | n/a | build sighting, no before/after pair produced in this round. |

No hard fail. No pick page carries this build, nothing to withdraw.

## Scores (1-5)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | 1280: three fliers across, Title focused; the rail reads as the app's six sections. |
| 2 | Portability | 4 | icon + caption rail tied to this app's sections; the replace list names flier and field. |
| 3 | Hierarchy, type, spacing, colour | 3 | marks sit on the flier titles: badge 1 covers the "K" of KIZOMBA, badges 4-5-6 cover "UP" of UPCOMING (`replace-marks` 1280 + 360); in dark at 360 the badges are pale grey circles on the cream flier and barely read. The replace list box at 1280 scrolls inside a fixed height and cuts row 4 mid-line. |
| 4 | Visual language | 4 | one chrome language, 3 px accent bar on the active rail item (left at 1280, bottom at 360) reads in greyscale. |
| 5 | Taste ledger / fidelity to the pick (D21) | 3 | the owner picked B from a picture where each mark sits on the matched line ("Intermediates" row); the build puts all marks in a corner, so flier 4's three matches show as "4 5 6" with no link to which row. "Fliers stay the visual centre" (D13/D18) is weakened: the badges now damage the title of the very preview the owner checks. |
| 6 | No AI tells | 4 | none seen. |
| 7 | 360 + 1280 designed, text fits | 4 | both designed; at 360 the list and the marks are never on one screen and the Live preview bar still says only "Flier 1 of 4" (round 1 fix #2 for B not applied). |
| 8 | Inventory k/n true on picture | 5 | 92/92. |
| | **Mean** | **3.9** | lowest #3 = 3, #5 = 3 |
| | **Verdict** | **REDO** | mean < 4 (taste/fidelity, not a hard fail; round 1 of 2 before ESCALATE) |

## Top fixes

1. `src/ui/replacePanel.ts:23-24`: draw each mark at the matched text's rectangle on the canvas (the fillText positions the mockup recorded): a 2 px accent outline round the matched line with its number badge just left of it, dashed when unticked. Never stack the badges in the flier's top-left corner over the title.
2. 360 Live preview bar (`src/ui/miniPreview.ts`): while Replace has matches, show "6 highlighted" with a "See" link that scrolls to the first marked flier, so the marks are one tap from the list (round 1 fix #2).
3. Mark contrast in dark mode: give `.replace-mark` a solid accent fill with the on-accent text token in both schemes (today it fades to grey on the cream flier at 360 dark). Smaller: "Fliers" in the rail never takes `aria-current` (`src/ui/sectionNav.ts:50`): after tapping it, "Saved configs" stays highlighted (`build-1280-light-panel-previews`, `build-360-light-panel-previews`).

Not changed from round 1 and still open (not scored down): the collapsed rail at 1280 is 64 px with captions hidden (round 1 fix #3 for B).

## Not covered

Motion of rail open/collapse and mark appearance not judged (stills only); keyboard / pad walk of the rail not run; state rows 53, 54, 55, 61, 62 not triggered on a picture; Whole word only toggle not captured; real phone not used; dark mode captured for top + replace frames only, not each panel.
