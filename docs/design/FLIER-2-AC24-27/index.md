# FLIER-2 "Flier Studio follow-ups": AC-24..27 layout options

Status: **critic pending, do not pick.** Page: https://claude.ai/artifact/XoqXmByeJrjKobHJqnx9WA (v1, in-page pick q1-q3, db key `flier2-ac24-27`).
Live ff3b43d with each option applied by moving the real nodes (`mockups.ts`). Galaxy S5 360x640 + Desktop Chrome 1280x800, light + dark, clock frozen 2026-10-28 15:00Z, same steps before/after (`capture.spec.ts`, `frames/*.json`, `result.json`). `check-before-after.mjs`: clean.

| Option | Inventory | Aligned | What | 360 page / first flier y (before 4615 / 3418) |
|---|---|---|---|---|
| A | 76/76 | pass | Contents rail: numbered sticky rail, three zones at desktop; wrapped list at 360; heading "Generate with on-device AI" | 4860 / 3334 |
| B | 76/76 | pass | Sticky section bar: pills pinned on top of the editing column (scrolls sideways at 360); heading "Write it with AI, on your device" | 4769 / 3243 |
| C | 76/76 | pass | Contents card "On this page", fliers first on the right, Generate under them; heading "Generate from prompt" + badge "On-device AI" | 4925 / 2995 |

All: left = nav, All fliers, Flier (foldable), Drafts; right (sticky at >= 1024) = Generate, fliers, Saved configs; Layout/Pictures/Text headers fold (44 px); Download all PNGs on the header row (probe pass 360 + 1280). Probes per option: previews beside the form while editing a lower field (1280 preview-1, 360 mini-preview) pass; Drafts by page scroll pass; no sideways page scroll; text fit pass.
Inventory: 63 rows of `FLIER-2-AC18-20-inventory.md` + 11 items re-sighted on live ff3b43d (All fliers card, Drafts) + 2 new rows (previews stay beside the form; Generate heading). Counted visible-in-frame over 8 anchored shots per viewport.
Pair-content check: narrowed to the header mark (`options.*.items`), because AC-25 moves every other item between columns; `frames[]` lists the 6 shown pairs.
Initial focus (FOCUS-1): Title field at >= 1024, now the first row of the Flier card so it is in the 1280x800 first viewport; Flier card folded = the Flier header toggle; none at 360 (`src/main.ts:205`, `src/ui/formView.ts` `focusInitial`). Build round 2 captures + focus records: `build-r2/`.
dloizides.com card line proposed: "Describe your event and on-device AI writes the flier; then pick a layout and download PNGs for posts, stories and wallpapers. Your text never leaves the browser."

Re-run (from apps/flier-studio): `npx playwright test -c docs/design/FLIER-2-AC24-27/capture.config.ts && node docs/design/FLIER-2-AC24-27/build-result.mjs && (cd docs/design/FLIER-2-AC24-27 && python -I build_page.py && python -I ../../../../../.claude/skills/report-standards/apply-answer-ui.py index.html flier2-ac24-27 "Flier Studio Layout")`.

Q1 layout A/B/C · Q2 Generate heading wording · Q3 card line. Answers: pending (critic first).
