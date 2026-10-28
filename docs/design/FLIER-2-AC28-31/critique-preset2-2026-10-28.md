# Critique round 2: Kizomba preset dialog (FLIER-2 "Flier Studio follow-ups" AC-35, D23), 2026-10-28

Build under review: `7e7185c` (after) vs `e2c17b4` (before, the preset swaps at once). Same method as round 1
(`critique-preset-2026-10-28.md`): scratchpad worktrees, node_modules junctioned from the main clone
(`@dloizides/design-tokens` 1.18.0), `vite build`, served by `vite preview` under Playwright, the round-1 critic
spec reused with two additions (hover on Replace at 1280, computed contrast of the Replace text). 360x640 (isMobile,
touch) and 1280x800, light and dark, deviceScaleFactor 1. Captures: `preset2/`.

**Verdict: PASS** (mean 4.1, lowest #2 = 3). No hard fail.

## Hard fails (checked first)

| Gate | Result | Evidence |
|---|---|---|
| Lost item | pass, 1/1 | "Load Kizomba preset" stays in Saved configs, same label and place (`*-trigger.png`). The dialog removes nothing. |
| Form row alignment | pass | 1280: Add / Replace all 4 / Cancel top 427.8, height 44 each. 360: stacked by design (one control per row), each 297.2x44 at x 31.4. |
| Pair parity | pass | Before/after `trigger` and `tapped`/`dialog-tap`: route `/`, default 4 fliers with first title "MINE ONLY", same viewport, anchor scroll on `config-preset` (scrollY 538 at 360, 152 at 1280 in both builds). Only the build differs. |

## Round-1 fixes re-checked

| Fix | Result | Measured |
|---|---|---|
| 1. Replace reads destructive, calmly | done | Label "Replace all 4"; text `var(--error)`: light `#b3261e` on white = 6.54:1, dark `#e8826f` on `rgb(44,40,36)` = 5.47:1 (5.92:1 on the dialog surface). Fill, 1px border and weight 400 match Cancel; no icon, no red fill. |
| 2. 360 button row stacks | done | Below 400 px: Add, Replace all 4, Cancel, each full width 297.2x44, gap 8. Dialog 331x306 at y 167, inside 640, no internal scroll. Cancel is no longer the widest target. 1280 keeps one row of three 143x44. |
| 3. Body copy 3 lines or fewer at 360 | done | "Add keeps your 4 fliers and puts the 4 samples after them. Replace swaps all 4; Drafts keeps a copy." 3 lines (72 px) at 360, 2 lines at 1280. The round-2 copy rendered as written ({{p3}} = the bare count). |

## Scores

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | Add is the only filled button; the title states the question. |
| 2 | Portability | 3 | Still a standard confirm pattern; the copy names Kizomba, Drafts and the count. |
| 3 | Hierarchy, type, colour | 4 | Three distinct roles now: filled Add, red-text Replace all 4, neutral Cancel. Up from 2. |
| 4 | Visual language | 4 | Same `.import-dialog` surface, border, radius, backdrop and type as the import dialog (`after-*-import-dialog.png`). Error red is the existing token, no new hue. |
| 5 | Taste ledger | 4 | No ledger row rejects this; the dialog is short and the fliers stay visible around it at 1280 (D13). |
| 6 | No AI-default tells | 5 | No gradient, icon or violet; warm tokens only. |
| 7 | Mobile + desktop, text fit | 4 | 0 overflow, no horizontal scroll in all 4 states; every button 44 px tall. |
| 8 | Inventory | 5 | 1/1. |

Mean 33/8 = 4.1; every criterion ≥ 3. **PASS.**

## Focus

Add is focused on open (`preset-add`); by keyboard it shows the 3 px ring, by tap the ring is hidden
(`:focus-visible` false). ArrowRight moves the ring to Replace all 4 (`-dialog-key-replace.png`). After Replace
the status reads "Swapped in the 4 sample fliers. Drafts can undo it." and focus returns to `config-preset`.

## Notes, not fixes

- Hover on Replace all 4 at 1280 changes nothing (same fill, text and border as at rest, `-dialog-hover-replace.png`); the same is true of Cancel and the import dialog's Dismiss, so it is consistent, not a regression.
- With the default set both numbers are still 4 ("your 4 fliers ... the 4 samples"); the button now carries the cost, so this no longer hides what Replace does.

## NOT COVERED

- Open animation (`dialog-enter`) judged from stills only.
- Controller and Escape paths: e2e spec only, not captured.
- Counts other than 4/4 (for example 1 flier: "Replace 1" singular) not rendered; body measured at 4/4 only this round (round 1 measured 12/12 offline).
- A real phone; widths between 360 and 400 other than 360; forced-colors / high-contrast mode.
