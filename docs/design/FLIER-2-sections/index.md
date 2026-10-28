# FLIER-2 "Flier Studio follow-ups": the All fliers card in sections

Status: **critic pending, do not pick.** Page: https://claude.ai/artifact/TWoFYMHWoor5Mq386h3Fu1 (v1, in-page pick q1, db).
Live build 00f0f12 with each mockup applied to the live page (`mockups.ts`). Galaxy S5 360x640 and Desktop Chrome 1280x800, light and dark, clock frozen at 2026-10-28 15:00Z, same steps before and after (`capture.spec.ts`, `frames/*.json`, `result.json`). `check-before-after.mjs`: clean.

| Option | Inventory | Aligned | What | Card height 1280 / 360 | Drafts at desktop |
|---|---|---|---|---|---|
| A | 13/13 | pass | three titled sections side by side (Theme, Shared text edits, Fliers) | 208 / 466 | page scroll (inner scroller removed) |
| B | 13/13 | pass | settings list: one 48 px row per setting showing its value, tap to open | 303 / 385 | moved to the bottom of the controls column |
| C | 13/13 | pass | one toolbar strip split by thin rules, labels unchanged | 204 / 449 | page scroll (inner scroller removed) |

Before: card 264 / 368, plus the Download all row (60). Every option moves Download all onto the card heading line, so it stays visible when the card is folded.
Drafts probe: the page is scrolled to the Drafts card. Before at 1280, Drafts stays off screen (top 1369 in an 800 px viewport, `frames/before-1280-light-drafts.json`), because the previews column scrolls inside itself. That is the likely cause of "I only see 1 draft". In A, B and C, Drafts is on screen.
Initial focus (FOCUS-1): unchanged. Title field at 1280, none at 360 (`src/main.ts:189`). In B, opening a row focuses its picker.

Re-run: `npx playwright test -c docs/design/FLIER-2-sections/critique.config.ts && node docs/design/FLIER-2-sections/build-result.mjs && python -I docs/design/FLIER-2-sections/build_page.py` (then `apply-answer-ui.py index.html flier2-sections`).

Q1 How should the All fliers card be split into sections? A / B / C. Answer: pending (critic first).
