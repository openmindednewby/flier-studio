# Critique 2026-10-28, build round 4: FLIER-2 "Flier Studio follow-ups", style-only (DESIGN-TIER-1)

Critic: design-critic. Before = flier-studio 0a9b96a, after = 8152a2b. Each sha was built in its own git worktree (`vite build`), served by `vite preview` (before :4193, after :4194; Playwright `webServer` starts and stops it), and captured with the same spec (`build4/critic-build4.spec.ts.txt`, adapted from the round-2 critic spec). Viewports 360x640 (touch) and 1280x800, light and dark. Fixture as in rounds 2-3: "Beginners" rewritten to "Level 1" in `localStorage['flier-studio:fliers']`, giving 6 matches in 4 fliers.

Frames: `build4/<before|after>-<w>-<scheme>-<shot>.png`. Shots: `ai-line` (All fliers panel, AI line centred), `ai-zoom` (180 px strip around the link), `replace-marks` (360: after See; 1280: grid top), `mark-zoom`, `replace-unticked-marks`, `mark-unticked-zoom` (match 1 unticked). Measurements: `build4/measure-<before|after>-<w>-<scheme>.json`.

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| Lost item | pass (92/92 carried) | 8152a2b adds one class and one CSS rule; no `data-testid` is removed from `src/`. |
| FORM-ALIGN-1 | pass | No form row touched. |
| Pair parity | pass | Same route, fixture, viewport, scheme and steps for both shas. Scroll anchor: `all-ai-line` centred, the `preview-grid` top or mini "See". Only the `ai-zoom` strip is anchored on the link box, which grew by 13 px, so that crop sits 13 px lower in the after frame. The page underneath does not move (below). |
| TEXT-FIT-1 | pass | No horizontal scroll in any of the 8 runs. |

## Change 1: AI link hit box ("describe the look in Generate")

**Landed, layout unchanged.** In all four runs the `.ai-line` paragraph is 43.2 px tall before and after, with a line-height of 21.6 px. The gaps to its siblings are 12 px above and 20 px below in both builds, and the next block starts at the same y (360: 309.6; 1280: 441.7). Inline `padding-block` grows only the link box:
- 360: the link sits alone on its line. The box grows from 192x20 to 192x46, and all four hit probes (top+2, top+8, bottom-8, bottom-2) land on the link. It overlaps no neighbour (previous block ends at 234, link 255-301, next starts at 309.6).
- 1280: the link wraps ("describe the look in" / "Generate", as it already did before). Each fragment grows from 20 to 46 px tall. The first fragment's padding reaches 1.5 px past the 12 px gap into the block above. This is invisible and harmless because the padding has no background.

The before and after frames match pixel for pixel apart from the crop offset (`build4/*-ai-line.png`).

## Change 2: badge inside the mark when the mark starts within 30 px of the flier's edge

**Not acceptable. It hides the very text the mark points at.**
- **Scope is wider than intended.** `left` is measured against the flier card (`canvas.offsetLeft + line.x`), not the screen. Every title-line mark starts about 7 px into its card, so all 6 marks get `badge-inside` at **both 360 and 1280**, in both schemes.
- **What it covers.** The badge is 22x22 px. The marks are 54-80 px wide and 11-14 px tall. The badge sits 4 px inside the left edge, so it covers the first 22 px of the line. That is 28-30 % of the mark at 1280 and 37-41 % at 360, at a height 1.6-2x the text. The covered 22 px is exactly "Level 1": what remains readable is "20:00 - 21:00", the part that is NOT being replaced (`build4/after-1280-light-mark-zoom.png`, `build4/after-360-*-mark-zoom.png`). The unticked (hollow, dashed) badge hides it the same way.
- **What it fixed.** Before, at 360, the badges of column-1 fliers were cut in half at the screen edge (badge x = -4). Column-2 badges sat in the 6 px gutter over the right edge of the flier beside them. At 1280 the badges sat whole in the gutter at x 547 / 779 / 1011 and did not need fixing.
- **Net effect.** One half-cut badge at 360 was traded for a hidden match on every flier at every width. That is a regression in the mark's one job: showing which text will change.

**Exact fix (both parts):**
1. Trigger the move only where the outside badge would be clipped. Measure against the grid's scroll box, not the card: `badge-inside` when `mark.getBoundingClientRect().left - grid.getBoundingClientRect().left < BADGE_ROOM`. If you keep `offsetLeft`, add the card's own `offsetLeft` inside the grid. At 1280 every badge then stays outside in the gutter, as in 0a9b96a. At 360 only column 1 moves.
2. Where it does move, put the badge **above** the mark's left corner instead of over the text: `.replace-mark.badge-inside > b { right: auto; left: -2px; top: auto; bottom: 100%; margin: 0 0 2px; transform: none; }`. If `mark.offsetTop - trim.offsetTop < 24`, add a `badge-below` variant (`top: 100%; bottom: auto; margin: 2px 0 0`). The badge then covers the start of a neighbouring line (the orange rule / "Dance School" on this fixture), never the match. Add an e2e assertion that the badge rect does not intersect its mark rect.

## Scores (1-5), carried from round 3 except where marked

| # | Criterion | Score | Change |
|---|---|---|---|
| 1 | Focal point / purpose | 3 | 4 → 3: the mark's focal point, the matched text, is under the badge |
| 2 | Portability | 4 | = |
| 3 | Hierarchy, type, spacing, colour | 2 | 4 → 2: a 22 px badge on 11-14 px text hides 28-41 % of every mark; the link change itself is clean |
| 4 | Visual language | 4 | = |
| 5 | Taste ledger / fidelity to D21 | 4 | = |
| 6 | No AI tells | 4 | = |
| 7 | 360 + 1280 designed, text fits | 3 | 4 → 3: a 360-only fix leaks to 1280, where nothing was wrong |
| 8 | Inventory k/n | 5 | = (92/92) |
| | **Mean** | **3.6** | lowest #3 = 2 |

**Verdict: REDO.** #3 is below 3 and the mean is below 4. Change 1 (AI link 44 px) passes and needs no further work. Change 2 needs the two-part fix above, then one more style-only round on the `mark-zoom` frames at 360 and 1280.

## NOT COVERED

- Keyboard focus ring on the padded link (with 13 px padding a focus outline would now draw a 46 px box); not captured.
- Real touch device; 360 used Playwright `isMobile` + `hasTouch`.
- Only the "Level 1" fixture (title-line matches). A match in the first line of a flier (needed for the `badge-below` case) was not exercised.
- The before build's clipped-badge state was only checked with measurements and the 360 zoom; no wider 360 frame shows column-2 badges overlapping the neighbouring card.
