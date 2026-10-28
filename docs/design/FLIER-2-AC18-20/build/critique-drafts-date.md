# Critique: Drafts row date fix (FLIER-2 "Flier Studio follow-ups")

Date: 2026-10-28 · Round 1 · Tier: DESIGN-TIER-1 style-only (one critic round)
Captures: `drafts-before-360.png`, `drafts-after-360.png`, `drafts-before-1280.png`, `drafts-after-1280.png`

## Verdict: REDO (hard fail: pair drafts-before/after)

The change itself reads correctly. The pair cannot pass PAIR-PARITY-1 "Before and after show the same
screen in the same state" as captured, so it is not scored.

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| 1. Lost item (NOLOSS-GATE-1) | pass on pixels | Both rows keep thumbnail, date, time, "4 fliers", Restore, Star, filter chips (All (2), Favourites (0)) and the collapse chevron. Year is dropped from the visible text by design; the brief says the full date stays in the accessibility label, which cannot be seen on a capture (NOT COVERED). |
| 2. Misaligned row / Restore (FORM-ALIGN-1) | pass | 360: Restore and Star share one top edge (~y424 row 1, ~y634 row 2 at 2.7x) and one height, centred on the text block. 1280: Restore and Star share top/height in both rows. No visible offset; measured by eye on the capture, PIL not installed so no pixel-row script ran. |
| 3. Text overflow (TEXT-FIT-1) | before FAIL, after pass | Before 360: "28/10/2026" runs past its column into the Restore button's left border. After 360: "28/10" / "17:00" wrap inside the column with a clear gap before Restore. 1280: one line, no overflow in either. |
| 4. Pair parity (PAIR-PARITY-1) | **FAIL** | (a) Fixture data differs: before shows 16:58, after shows 17:00, so the drafts were saved at different times, not from one fixture. (b) `result.json` has no `pair` record for the drafts-before/after shot, and per the critic contract a pair with no record is a hard fail. |

## What to redo (concrete)

1. Capture both builds from one seeded drafts fixture with a frozen clock (fixed `savedAt`, e.g. `2026-10-28T16:58`), so only the date format differs.
2. Write the `pair` record (route, state "drafts expanded, All", fixture id, viewport, anchor `drafts-list`, crop) for this shot into `result.json` with `pairMethod "same-steps"`.
3. Keep the layout as is: the after frames already fix the overflow and keep Restore aligned; no design change is asked.

## Notes for the re-round (not scored now)

- After 360 wraps date and time onto two lines; the row stays the same height as before (thumbnail sets it), so no layout jump.
- Desktop 1280 after is unchanged apart from the shorter date; bounded card, no stretch.

## NOT COVERED

- The a11y label carrying the full date (`28/10/2026 17:00`) is not visible on pixels; needs a DOM/a11y read.
- Older-year drafts (should still show the year) and favourites/empty states were not in this pair.
- Dark mode not in this pair. Alignment judged by eye, not a pixel script.

---

# Round 2: 2026-10-28 (recapture at 9888b9e)

Captures: the same four files, recaptured with a frozen clock (2026-10-28T16:58 Asia/Nicosia, en-GB).

## Verdict: PASS (mean 4.3, lowest #2 = 3)

## Hard fails (checked first)

| Check | Result | Evidence |
|---|---|---|
| 1. Lost item (NOLOSS-GATE-1) | pass (9/9 visible per viewport) | Both rows keep thumbnail, date, time, "4 fliers", Restore and Star. The filter chips All (2) and Favourites (0), the title and the collapse chevron are kept too. In the current year only the year is hidden; the brief keeps it in the a11y label (not visible on pixels). |
| 2. Misaligned row (FORM-ALIGN-1) | pass | 360: Restore and Star share top edge ~y424/~y634 and one height in both frames. 1280: they share top edge ~y141/~y212. Judged by eye; no pixel script was run. |
| 3. Pair parity (PAIR-PARITY-1) | **pass** | `result.json` frames 16/18 (360x640) and 17/19 (1280x800) have identical `pair` records: route `/`, "drafts panel expanded, All filter, 2 drafts", fixture "kizomba preset, fresh storage, clock fixed 16:58, title edit 'Text fit check'", anchor `drafts-panel`, crop `element drafts-panel`. On the pixels: same rows, same thumbnails, same time 16:58, same crop size. Only the date text differs: `28/10/2026` before, `28/10` after. |
| TEXT-FIT-1 | before FAIL, after pass | Before 360: "28/10/2026" runs under the left border of Restore. After 360: "28/10" fits its column with ~100px clear before Restore. 1280: both fit. |

## Scores (after frames)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | Date + time bold, the first thing read in each row; "Restore" is the clear action. |
| 2 | Portability | 3 | Generic list row; the flier thumbnails are the only product-specific element. That is fine for a utility panel. |
| 3 | Hierarchy, type, spacing | 4 | Bold date/time over a muted count. The 360 text column now has space on both sides. |
| 4 | Visual language | 4 | Warm paper surface, one outline-button language; no new colour. |
| 5 | Taste ledger | 4 | Calm and unadorned; it repeats nothing the ledger rejected. |
| 6 | AI-default tells | 5 | None. |
| 7 | 360 + 1280, text fits | 5 | Both viewports were designed; the overflow is gone at 360. |
| 8 | Inventory true on picture | 5 | 9/9 kept; nothing moved. |

## Top fixes (optional, not blocking)

1. 360: put the date and time on one line ("28/10 16:58") if they fit in the ~110px column. The row would then read like the desktop one.

## NOT COVERED

- The a11y label still carrying the full date was not read from the DOM.
- Older-year drafts (they should show the year, and might overflow again at 360) were not captured.
- Dark mode was not in this pair. Alignment was judged by eye, with no pixel-row script.
