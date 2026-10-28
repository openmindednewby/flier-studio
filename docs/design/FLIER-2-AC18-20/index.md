# FLIER-2 "Flier Studio follow-ups" AC-18..23 options: where the settings for all fliers live

Status: **design-critic round 2: B PASS 4.1, A PASS 4.0 (rank B, A); C REDO 3.8, withdrawn from the pick.** Round 2 (2026-10-28) applies every fix in `critique-2026-10-28.md` (round 1: A REDO taste #1 = 2, B/C REDO form row at 360, C text-fit and enlarge). Probes now fail the capture run on a miss: form rows compare top + height, the enlarged flier must fit 360x640 and 1280x800, no text outside its card.

| Option | Inventory | Aligned | All fliers section | Drafts + Favourites | Enlarge (double-click) | Focus on enlarge |
|---|---|---|---|---|---|---|
| A | 52/52 | pass | card on top of the previews: Theme + shared-edits scope, Add flier | own card under the previews, All / Favourites chips | existing full-size sheet (mini-sheet) | Close |
| B | 52/52 | pass | card first in the controls: Theme + scope, Add flier + Download all, share link | own card under Saved configs, All / Favourites chips | new dialog, Previous / Next / Download / Close | Next flier |
| C | 52/52 | pass | sticky bar over the previews: theme chips, scope, Add flier + Download all | wrapping tiles under the previews, All / Favourites chips | full-size sheet + "Flier x of y" + Download | Close |

All options: click anywhere on a flier selects it (Edit flier n stays as the keyboard path), "Theme applies to" dropped by D11 (theme is global only). Frames: `before-*.png`, `A|B|C-*.png`, `frames/*.json`. Re-run: `npx playwright test -c docs/design/FLIER-2-AC18-20/capture.config.ts && node docs/design/FLIER-2-AC18-20/build-result.mjs`.

Q1 Which layout should Flier Studio build? A / B (C withdrawn). Answer: pending (critic first).
