# Critique: FLIER-2 "Flier Studio follow-ups", Theme row stacks below 480 px

Date: 2026-10-28 · Round: 1 (style-only tier, DESIGN-TIER-1 "Two-tier design process") · Build: flier-studio `ecf614c`
Captures: `before-mobile.png`, `after-mobile.png` (360x640 @4.5x), `before-desktop.png`, `after-desktop.png` (1280x800).
Change under review: `.row.stack-narrow > * { flex-basis: 100% }` under `max-width: 479px`, applied to the Theme row only.

**Verdict: PASS** (mean 4.4, lowest #2 = 3).

## Hard fails (OPTION-GATE-1 "No option reaches the owner if it loses a field or misaligns a form row")

| Check | Result | Evidence |
|---|---|---|
| Lost item | pass, 5/5 | Flier card: "Editing flier 1 of 4", Theme, Theme applies to, Shared text edits apply to, Layout all visible in after-mobile; Format/Colours and below move under the fold by the added height, reached by scroll, not removed. Bottom bar (thumbnail, "Flier 1 of 4", "See all 4") unchanged. |
| Misaligned form row | pass | Mobile: Theme row no longer side by side (two full-width rows), so FORM-ALIGN-1 does not apply to it; both selects are the same height (136 px at 4.5x). Desktop: pixel-identical before/after (`ImageChops.difference` bbox = None), Theme / Theme applies to share top edge and height as before. |
| Pair parity | pass on the pixels | Same route, flier 1 of 4, same fixture fliers, same 360x640 viewport and crop. Scroll is anchored on the Theme row: its centre sits at display y 846 before and 842 after (1125x2000 display), so the shift of everything above is the row growing, not a different scroll step. No `result.json` `pair` records exist for this folder (style-only round, no options page); see Not covered. |

## Scores

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | Flier card heading and the Theme select read first; purpose clear. |
| 2 | Portability | 3 | A form tweak; neutral by nature. Product identity lives in the poster previews, not this row. |
| 3 | Hierarchy, type, spacing | 4 | Labels and values unchanged; "Kizomba classic" now shows in full (before: "Kizomba class" clipped behind the chevron). Gap select-to-next-label inside the stacked row ~10 css px vs ~13 css px between rows: a small rhythm mismatch. |
| 4 | Visual-language rules | 5 | No colour, value or shape change; same chrome. |
| 5 | Taste ledger | 4 | No `docs/design/taste-ledger.md` in flier-studio; nothing to contradict. Calm, plain form matches `user_design_taste.md`. |
| 6 | No AI-default tells | 5 | None. |
| 7 | Mobile + desktop, text fits | 5 | TEXT-FIT-1 "UI text never overflows its box": the clipped option value is fixed at 360; desktop untouched and "Kizomba classic" fits in its 50% column there. |
| 8 | Inventory true on the picture | 5 | 5/5 visible; nothing moved off-screen without scroll. |

Mean 4.4; every criterion >= 3.

## Top fixes (optional, not blocking)

1. Match the stacked Theme row's vertical gap to the gap between form groups (row-gap so "Theme applies to" sits as far below the Theme select as "Shared text edits apply to" sits below its select, ~13 css px).
2. Consider adding `stack-narrow` to Format/Colours and Fonts/Background only if a longer option value lands there; today "story", "sand", "classic", "solid" fit at 360.

## Not covered

- 480-1023 px widths (row side by side in a narrow column) not captured; the 479 px breakpoint edge not seen.
- Open dropdown list state and longer theme names (e.g. "Golden hour") not captured.
- No `pair` records in a `result.json` for this pair; parity judged from pixels only.
- Dark mode and real device not seen.
