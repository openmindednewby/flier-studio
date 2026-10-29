# Critique: FLIER-2 "Flier Studio follow-ups" build of D29 option B "One menu per row" (AC-36..40), round 2

- Critic: design-critic, 2026-10-29, round: build 2. Round 1: `critique-2026-10-29-build.md` (B REDO on hard fails, rail PASS 4.0).
- Judged from the 60 `B-*` PNGs in this folder: 15 states (top, form, form-mid, form-end, flier, size, drafts with 6 drafts, drafts-end, drafts-empty, menu, rename, toast, confirm, lines, style), each at 360x640 and 1280x800, light and dark, DPR 2.
- The 12 `rail-*` frames are unchanged, so the rail verdict carries over: **PASS 4.0**.

## Verdict: B **REDO** (no hard fail; mean 3.875, below the 4.0 bar)

## Hard fails (checked first)

| Check | Result |
|---|---|
| 1 Lost item | **pass: 65/65 + 15/15** counted on the frames (list below) |
| 2 Misaligned form row | pass. The 1280 rename input has its own line now, with nothing beside it. The style panel rows are unchanged from build r1 (0 px measured). Format/Colours, Fonts/Background and Upload picture/Upload logo look level by eye at 360 and 1280 |
| 3 Text overflow | pass. The full name "Zouk workshop weekend, 6:28 PM" shows in the rename input at both widths. Every other state fits |
| 4 Done on the 360 style sheet | pass, light and dark (sticky foot, bottom right) |
| Pair parity | n/a for B (after-only build states). Rail pair unchanged, passes |

Count of the 27 rows missing in r1, now seen:
- **Header and form fields:** download-all (`top`); field-title, flier-form, flier-form-toggle (`form`); field-footer, field-venue, field-schedule, field-prices, field-includesItems, field-items (`form-mid`, `form-end`).
- **Layout group:** group-toggle-layout, pick-layout, pick-format, pick-palette, pick-fonts, pick-background (1280 `form`, 360 `form`/`form-mid`).
- **Pictures group:** group-toggle-pictures, upload-picture, upload-logo, remove-background (1280 `form`).
- **Size:** pick-anchor, pick-scale, pick-scale-value ("Picture alignment", "Picture size 100%" in `size`).
- **Drafts:** draft-restore-5/6 and draft-star-5/6 (6 drafts in `drafts`, `drafts-end`); drafts-empty ("No favourites yet. Star a draft to keep it." in `drafts-empty`).

Style buttons on all 10 text fields are visible across `form`, `form-mid`, `form-end` and `size`, which brings the new items to 15/15.

## Round 1 fixes: did they land?

| r1 fix | Result |
|---|---|
| 1 Full walk recaptured | landed. All sections at both widths and in both schemes |
| 2 1280 rename row aligned, name not clipped | **half landed.** The name is no longer clipped and nothing sits beside the input. But the input now renders **below its own row's buttons**, at both widths: thumbnail, date line, Restore/Star/More, then the input. It sits about 8 CSS px above the next row's name ("Salsa on the beach") at 360, about as close as it is to its own buttons, so it reads as part of the next row. The name slot at the top of the edited row is empty. Build r1 and approved option B drew the input in the name's place |
| 3 1280 draft name on one line | landed. Names span the card width with the buttons below; "KIZOMBA NIGHT, 6:28 PM" and "Zouk workshop weekend, 6:28 PM" each stay on one line |

## Score sheet (1-5)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | The name leads each row. The style card opens under the field it styles |
| 2 | Portability | 3 | Generic list rows, as in r3 |
| 3 | Hierarchy, type, spacing | 3 | The rename input is detached from its row and nearer the next one (above). Everything else is tidy, with even two-column rows |
| 4 | Visual language | 4 | Warm paper palette, one ink. The dark confirm keeps red off the rows |
| 5 | Taste ledger | 4 | Fewest labels, controls beside the fliers (D13, D18) |
| 6 | AI-default tells | 4 | None |
| 7 | 360 + 1280, light + dark, text fits | 4 | Every state captured and fits. The 360 toast still wraps to four lines (fits) |
| 8 | Inventory k/n true on the picture | 5 | 65/65 + 15/15 |
| | **Mean** | **3.875** | **REDO** (bar is a mean of 4.0) |

This is the first REDO on a taste criterion for the build, so no ESCALATE.

## Top fixes

1. Render the rename input in the name's place: first line of the row, above "10/29 6:28 PM · 4 fliers", left edge on the name column, full width of that column. Do this at 360 and 1280. Recapture `rename` in light and dark.
2. (Not blocking) Shorten the 360 toast to "Deleted · Undo" with the name truncated to one line, so it covers less of a row.

## Not covered

- The new per-text fonts (Sofia, Satisfy, Montez, Style Script, Dancing Script, Sacramento): no frame shows the Font list open or a field set in one of them. The font choice and how it fits on the canvas were not judged.
- Alignment of Format/Colours, Fonts/Background and Upload picture/logo was judged by eye on the walk frames, not measured in pixels.
- Motion (toast timing, sheet and menu open, rename keyboard flow) not judged from stills; no real device (Playwright DPR 2).
- `/impeccable`, `/taste-skill` and `vf_measure.py` were not run.
