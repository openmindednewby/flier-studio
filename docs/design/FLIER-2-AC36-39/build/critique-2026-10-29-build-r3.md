# Critique: FLIER-2 "Flier Studio follow-ups" build of D29 option B "One menu per row" (AC-36..40), round 3

- Critic: design-critic, 2026-10-29, round: build 3. Earlier rounds: `critique-2026-10-29-build.md` (r1: REDO on hard fails, rail PASS) and `critique-2026-10-29-build-r2.md` (r2: REDO, mean 3.875, rename input below its row).
- This round I re-viewed `B-*-rename.png`, `B-*-toast.png` and the new `B-*-fonts-open.png`, at 360x640 and 1280x800, light and dark (12 frames of the 64).
- The walk frames (top, form, form-mid, form-end, flier, size, drafts, drafts-end, drafts-empty) were not re-viewed. The inventory count is carried over from r2.
- The 12 `rail-*` frames are unchanged, so the item 8 rail caption verdict carries over: **PASS 4.0**.

## Verdict: B **PASS**, mean 4.0 (bar met exactly), lowest #2 = 3

## Hard fails (checked first)

| Check | Result |
|---|---|
| 1 Lost item | pass: **65/65 + 15/15** (counted in r2; the rename and toast changes do not touch any item) |
| 2 Misaligned form row | pass. The rename input has its own line, the first line of the row, with nothing beside it. The style panel rows are unchanged (0 px, measured in r1) |
| 3 Text overflow | pass. The rename input shows "Zouk workshop weekend, 6:35 PM" whole at 360 and 1280, light and dark. The "Barlow Semi Conden…" cut in `fonts-open` comes from the capture-only `select.size` expansion (coordinator's note), not from the app |
| 4 Done on the 360 style sheet | pass, light and dark |

## r2 fixes: did they land?

| r2 fix | Result |
|---|---|
| 1 Rename input in the name's place | **landed** at both widths and in both schemes. The input is the first line of the row, above "10/29 6:35 PM · 4 fliers", with Restore / Star / More below it. The next row's name has a clear gap above it |
| 2 Shorter 360 toast (not blocking) | partly. The text is smaller but still wraps to four lines ("Deleted “Zouk / workshop / weekend, 6:35 / PM”") beside Undo. It fits. At 1280 it is one line |

## New: per-text font list

The open list shows Theme font, Oswald, Anton, Fraunces, Jost, Fredoka and Barlow Semi Condensed, then the six new fonts (Sofia, Satisfy, Montez, Style Script, Dancing Script, Sacramento) and Allura. All the names are drawn in the UI font. So at 360 the owner picks a script face from its name alone; nothing in the frames shows what it looks like.

## Score sheet (1-5)

| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 4 | The name leads each row, including while it is being renamed |
| 2 | Portability | 3 | Generic list rows |
| 3 | Hierarchy, type, spacing | 4 | The rename sits in the name slot; groups are clearly spaced |
| 4 | Visual language | 4 | One ink, warm paper, red only on the confirm |
| 5 | Taste ledger | 4 | Fewest labels, controls beside the fliers (D13, D18) |
| 6 | AI-default tells | 4 | None |
| 7 | 360 + 1280, light + dark, text fits | 4 | Every state captured and fits |
| 8 | Inventory k/n true on the picture | 5 | 65/65 + 15/15 |
| | **Mean** | **4.0** | **PASS** |

## Top fixes (not blocking)

1. Draw each name in the font list in its own face (or add a one-line sample under the Font select), so a script font can be judged before it is picked.
2. At 360, make the toast one line: "Deleted" plus the name cut to one line with an ellipsis, then Undo. The full name is already on the row being undone.

## Not covered

- The walk frames were not re-viewed this round; the inventory count rests on r2.
- No frame shows a field set in one of the new fonts on the canvas, so the canvas fit of the script faces was not judged.
- Motion was not judged from stills, and no real device was used (Playwright, DPR 2).
- `/impeccable`, `/taste-skill` and `vf_measure.py` were not run.
