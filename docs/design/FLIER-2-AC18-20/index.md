# FLIER-2 "Flier Studio follow-ups" AC-18..23 options: where the settings for all fliers live

Status: **Withdrawn — do not pick.** design-critic 2026-10-28: A REDO (taste #1 = 2), B REDO + C REDO (hard fail: form row at 360); `critique-2026-10-28.md`. Page: index.html (published artifact, link in the task doc). Before = live https://fliers.dloizides.com at 98ca2bc; after = the same build with the option drawn in by `mockups.ts`. Pairs: same route, steps, fixture, viewport, anchor (`result.json`, `pairMethod: same-steps`). Inventory 63 items, role Visitor: `BaseClient/docs/Tasks/TODO/flier-studio/FLIER-2-flier-studio-followups/FLIER-2-AC18-20-inventory.md`.

| Option | Inventory | Aligned | All fliers section | Drafts + Favourites | Enlarge (double-click) | Focus on enlarge |
|---|---|---|---|---|---|---|
| A | 63/63 | pass | card on top of the previews: Theme + shared-edits scope, Add flier | open disclosure in the same card, Favourites only toggle | existing full-size sheet (mini-sheet) | Close |
| B | 63/63 | pass | card first in the controls: Theme + scope, Add flier + Download all, share link | inside Saved sets, All drafts / Favourites | new dialog, Previous / Next / Download / Close | Next flier |
| C | 63/63 | pass | sticky bar over the previews: theme chips, scope, Add flier + Download all | thumbnail strip under the previews, All / Favourites chips | full-size sheet + "Flier x of y" + Download | Close |

All options: click anywhere on a flier selects it (Edit flier n stays as the keyboard path), "Theme applies to" dropped by D11 (theme is global only). Frames: `before-*.png`, `A|B|C-*.png`, `frames/*.json`. Re-run: `npx playwright test -c docs/design/FLIER-2-AC18-20/capture.config.ts && node docs/design/FLIER-2-AC18-20/build-result.mjs`.

Q1 Which layout should Flier Studio build? A / B / C. Answer: pending (critic first).
