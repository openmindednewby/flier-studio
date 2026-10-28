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
