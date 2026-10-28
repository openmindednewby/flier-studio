# Critique: Kizomba preset dialog (FLIER-2 "Flier Studio follow-ups" AC-35, D23), 2026-10-28

Build under review: `6bafd4a` (after) vs `e2c17b4` (before, the preset swaps at once). Both built from
scratchpad worktrees with `vite build`, served by `vite preview` under Playwright, captured at 360x640
(isMobile, touch) and 1280x800, light and dark, deviceScaleFactor 1. Captures: `preset/`.

**Verdict: REDO** (mean 3.9, lowest #3 = 2). No hard fail.

## Hard fails (checked first)

| Gate | Result | Evidence |
|---|---|---|
| Lost item | pass, 1/1 | "Load Kizomba preset" stays in Saved configs, same label, same place (`*-trigger.png`). The dialog adds controls; it removes none. |
| Form row alignment | pass | Button row: 1280 Add/Replace/Cancel top 439.8, height 44 each; 360 Add/Replace top 345.8, height 44 (Cancel wraps to its own row, see #3). |
| Pair parity | pass | Before/after `trigger` and `tapped`/`dialog-tap`: route `/`, same fixture (default 4 fliers, first title "MINE ONLY"), same viewport, anchor scroll on `config-preset` (scrollY 538 at 360, 152 at 1280 in both builds). Only the build differs. |

## What changed (before -> after)

- Before (`before-*-tapped-settled.png`): one tap replaces all 4 fliers with the samples; the status line stays empty (measured `status=""`). That is the silent wipe from D16.
- After (`after-*-dialog-tap.png`, `-dialog-key.png`): a modal asks "Load the Kizomba sample fliers?" with Add (primary) / Replace / Cancel. After Replace the status reads "Swapped in the 4 sample fliers. Drafts can undo it." (`after-*-after-replace.png`).

## Scores

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | Add is the only filled button; the question title states the purpose. |
| 2 | Portability | 3 | A generic confirm modal, but the copy names Kizomba, Drafts and the count. |
| 3 | Hierarchy, type, colour | **2** | Replace is pixel-identical to Cancel (light: white fill, 1px rgb(140,130,121) border, weight 400; dark: rgb(44,40,36) fill, same border). Nothing says it is the destructive choice. At 360 the row wraps 2+1: Cancel is 297x44, twice the width of Add (145x44), so the no-op is the largest target on the dialog. |
| 4 | Visual language | 4 | Same `.import-dialog` class: surface, 1px border, radius, 72% backdrop, 1.15rem title and muted body all match the import dialog in both schemes (`after-*-import-dialog.png`). |
| 5 | Taste ledger | 4 | No ledger row rejected this pattern; "fliers stay the visual centre" (D13) holds: the dialog is short and the fliers show around it at 1280. |
| 6 | No AI-default tells | 5 | No gradient, icon or violet; warm tokens only. |
| 7 | Mobile + desktop, text fit | 4 | 0 overflow, no horizontal scroll, every button 44 px tall and ≥143 px wide, dialog inside the viewport in all 4 states (360: 331x278 at y 181; 1280: 480x202). Body copy is 4 lines / 45 words at 360. |
| 8 | Inventory | 5 | 1/1, see hard fails. |

Mean 31/8 = 3.9; #3 below 3. **REDO.**

## Focus

Add has focus on open in every capture (`document.activeElement` = `preset-add`). Opened by keyboard it shows the 3 px focus ring (`-dialog-key.png`); opened by tap the ring is hidden (`:focus-visible` false), which is the expected browser behaviour, not a defect. ArrowRight moves the ring to Replace (`-dialog-key-replace.png`).

## Copy

The count is shown, but only in the body: "You have 4 fliers on screen. Add puts the 4 sample fliers after yours. Replace swaps your fliers for the samples; a draft is saved first, so Drafts can undo it." With the default set both numbers are 4, so "4 fliers ... 4 sample fliers" asks the reader to tell two equal numbers apart, and the cost of Replace is not on the button that pays it.

## Top fixes (at most 3; none removes an item)

1. **Replace reads destructive, calmly:** label it "Replace all {{n}}" (n = fliers on screen, new FM key) and set its text colour to `var(--error)`, keeping the neutral fill, 1px border, weight 400, no icon, no red fill. Check the text against `--surface-elevated` at ≥ 4.5:1 in light and dark.
2. **360 button row:** below 400 px stack the three buttons full width in the order Add, Replace, Cancel (each 44 px), so Cancel is no longer the widest target; keep the one-row layout at 1280. Dialog grows about 52 px and still fits 640 (about 330 px tall).
3. **Body copy to 3 lines at 360:** "You have {{n}} fliers. Add keeps them and puts the {{m}} samples after them. Replace swaps all {{n}} for the samples; Drafts keeps a copy first."

## NOT COVERED

- The open animation (`dialog-enter`, 8 px rise) judged from stills only.
- Controller and Escape paths judged from the e2e spec, not from captures.
- The 0-flier direct load (unit-tested only; the UI never reaches 0 fliers).
- Hover state of Replace at 1280; a real phone; the storage-full error status.
