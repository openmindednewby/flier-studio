# design-critic: FLIER-2 "Flier Studio follow-ups" AC-18..23 as built (2026-10-28, build 6b62213)

Judged on the rendered build (`npm run build` + check-scoped `vite preview`, Tilt down), captured with Playwright `Galaxy S5` (360x640, DPR 3) and `Desktop Chrome` 1280x800, light and dark, fresh storage, Kizomba preset (4 fliers), service worker blocked. Captures: `build/<state>-<360|1280>-<light|dark>.png`. States: `default` (full page), `default-fold` (first screen), `selected` (single click on flier 2), `enlarged` (double-click flier 2), `drafts` + `drafts-card` + `drafts-fav` (3 drafts, draft 2 starred, Favourites filter), `collapsed` (All fliers + Drafts folded), `sticky-scrolled` / `sticky-inner` (1280 only). Compared with option A in `index.html` / `A-*.png` and `critique-2026-10-28.md` round 2 (A 4.0 PASS) plus the D13 addendum in `taste-ledger.md` (cards foldable, "Preview" heading removed).

## Verdict: PASS, mean 4.0, lowest 3 (#2, #3)

## Hard fails (checked first): none

| Check | Result | Evidence |
|---|---|---|
| Lost item (inventory, 63 rows, Visitor) | pass, 52/52 first-load items | Every first-load id is visible in the default state at its viewport (360: 62 visible testids, 1280: 58; phone bar 4 ids are phone-only by design). `pick-theme`, `pick-scope`, `add-flier` drawn in All fliers; `pick-theme-scope` dropped by D11. Folded state hides `pick-theme`, `pick-scope`, `add-flier` and the drafts rows behind a visible 44+ px toggle the viewer chose (path: All fliers ▸ open); `download-all` stays visible folded and after reload. |
| Form rows (FORM-ALIGN-1, top and height within 1px, every side-by-side control pair in one card/dialog) | pass | 0 pairs off at 1280 in every state. At 360 the one pair reported is the phone bar thumbnail (72 px) beside "See all 4" (44 px): not a form row, unchanged from the live build (inventory rows 56-59). Theme / Shared text edits, Restore / Star / Starred, Config name / Save, Share link / Make share link all share top and height. |
| TEXT-FIT-1 | pass | No element wider than its box, no horizontal page scroll, in all 8 viewport x scheme x state probes. One wrap is ugly (fix 1) but not clipped. |
| Pair parity | n/a | Build vs mockup comparison, no before/after pair published in this round. |

## What the build does against option A

- **Sticky previews column (1280):** `position: sticky; top: 16px; max-height: calc(100dvh - 32px)` measured: after a page scroll the column sits at y 16-784 and stays there while the form scrolls (`sticky-scrolled-*`); it scrolls inside (scrollHeight 1639 vs 768, wheel over it moved scrollTop to 871, `sticky-inner-*`). This fixes A's round 2 weakness: the fliers no longer leave the view while editing the Text fields. Two costs: at page top the column starts at y 176 so its lowest 143 px are under the fold until the page scrolls 160 px; and folding Drafts while the column is scrolled to the end leaves it at scrollTop 556, which pushes the folded All fliers toggle and "Download all PNGs" out of the column's view (`collapsed-1280-*`).
- **"Preview" heading removed:** done; "Download all PNGs" now floats alone, right-aligned above the All fliers card with nothing labelling the column (`default-fold-1280-*`).
- **Foldable cards:** 294x46 (360) / 658x46 (1280) heading toggles with a chevron, state remembered after reload (both folded after reload in every run).
- **Select on click:** crop marks move from flier 1 to flier 2 and "Editing flier 2 of 4" updates (`selected-1280-light`). The mark is thin; readable in light and dark.
- **Enlarge:** 360 sheet 26-614 inside 640, canvas 42-542, Close focused and filled; 1280 sheet 26-774 inside 800. Dark theme renders the sheet with the light-fill Close.
- **Drafts:** All (3) / Favourites (1) chips, selected chip heavier outline, Starred button heavier outline; Favourites filter shows the one starred draft.
- **First flier y at 1280:** 516 (A mockup ~485, live before 232). The All fliers card is 264 px tall above the grid; A's round 2 fix 1 (one-line All fliers row at 1280) was not built.

## Score sheet

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point in one second | 4 | First row of fliers visible at 1280 under the All fliers card (cut at the fold, y 516-800); sticky column keeps them in view through the whole form. 360 keeps the live phone bar thumbnail. |
| 2 | Portability | 3 | Generic cards, selects and outlined buttons; identity comes from the fliers and the "In flight" mark only. |
| 3 | Hierarchy, type, spacing, colour | 3 | Orphan "Download all PNGs" above the card with no heading; drafts date breaks as "28/10/2026 / , 16:37" at 360 (`drafts-card-360-*`); Restore buttons jump left on the starred row because "Starred" is wider than "Star". |
| 4 | Visual language | 4 | No new colour, chrome or shape; one dark primary per area; dark theme consistent. |
| 5 | Taste ledger | 4 | D13 row honoured: fliers the centre, foldable cards, Preview text gone, calm chevron motion only. |
| 6 | No AI-default tells | 5 | None. |
| 7 | Mobile + desktop, text fits | 4 | Both designed, enlarge fits both, dark rendered; fold-scroll side effect at 1280 (above). |
| 8 | Inventory on the picture | 5 | 52/52, moved items in All fliers. |
| 9 | Games | n/a | |

Mean 32/8 = **4.0**. Every criterion >= 3: **PASS**.

## Top fixes (none removes an inventory item)

1. Drafts row at 360: stop the ", 16:37" orphan. Render date and time as two spans ("28/10/2026" over "16:37") in `src/ui/draftsPanel.ts:21` / `:38`, and drop `overflow-wrap: anywhere` on `.draft-when` (`src/ui/styles.css:134`); give the Star/Starred button one fixed width (`min-width: 6.5em`, `styles.css:133`) so the Restore column lines up across rows.
2. Give "Download all PNGs" a home instead of floating: put it on the All fliers card's heading line, right of the toggle, at 1280 (`src/main.ts:187`), and at 1280 lay Theme, Shared text edits and Add flier on one row (A round 2 fix 1) so the first flier starts near y 400 instead of 516.
3. When a fold toggle closes a card, keep the toggle in view: `toggle.scrollIntoView({ block: 'nearest' })` after `set(open)` in `src/ui/collapsible.ts:43`, so folding Drafts at the end of the sticky column does not hide the All fliers toggle and Download all.

## Not covered

Real device and touch double-tap not used (Playwright emulation only); motion of the fold chevron and sticky behaviour judged from stills plus measured offsets; selection crop-mark contrast not measured numerically; list-hint, render-error, import and cutout dialogs not opened; 1024-1279 widths not captured; theme switching and Restore result not captured.
