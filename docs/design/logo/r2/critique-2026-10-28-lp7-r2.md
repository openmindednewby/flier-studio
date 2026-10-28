# LP7 critique: Flier Studio marks, round 2 (2026-10-28)

Task: LOGO-1 "A logo pipeline that makes beautiful, animatable marks", stage LP7 round 2 (kill-rule round). Critic: design-critic.
Rubric: `.claude/skills/logo-pipeline/reference/rubric.md` (Rand's seven qualities + craft, appropriate, motion fit);
S1/S6/S7 bands from `reference/stress-tests.md` (S1 ink 20-35% of the 16 px box, no stroke or gap under 2 px at 16 px).
Judged blind from rendered pixels: `png/refined/c2{a,b,c}.png`, `png/stress/*` (16/32 px light and dark, one colour,
reversed, lineup32, stock24; upscaled nearest-neighbour to read 1x pixels), `png/surf/*` (header 360/1280, icon512-safe,
OG, home), `png/construction-c2b.png`, the numbers in `stress.json`, the keyframes in `motion/c2*.motion.json`, and the
live pick page https://claude.ai/artifact/5zbMwp6ALeSZs3KTTmAfq7 (intro replayed, end state and reduced-motion still seen).
Previous round: `../critique-2026-10-28-lp7.md`.

## Hard fails (option gate), checked first

- Lost item: none. Each `data-option` carries `data-inventory="5/5"` and all five owned surfaces (tab, home-screen,
  header, OG card, landing card) are drawn for every variant on the live page.
- Form rows: none on this page; `data-aligned="pass"` is vacuous and true.
- Pair parity: the round 1 vs round 2 pairs show the same five surfaces in the same frames; only the mark differs. But the
  page has **no `data-result` and no `pair` records**, so `check-before-after.mjs` cannot verify it. Add them before this
  page is ever republished as a pick page. Not scored as a mark hard fail (the pair is mark-vs-mark on identical frames).

## Verdict

| Mark | 1 Dist. | 2 Vis. | 3 Use. | 4 Mem. | 5 Univ. | 6 Time. | 7 Craft | 8 Appr. | 9 Motion | Mean | Result |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C2a Peel | **2** | 3 | 4 | 3 | 4 | 4 | 4 | 3 | 3 | 3.3 | **REDO** (crit 1 at 2: stock file glyph) |
| C2b Lift | 3 | 3 | 4 | 3 | 4 | 3 | **2** | 3 | 3 | 3.1 | **REDO** (craft 2, mean < 4) |
| C2c Pair | 3 | **2** | 4 | 3 | 4 | 3 | **2** | 4 | 3 | 3.1 | **REDO** (crit 2 at 2, craft 2, mean < 4) |

No variant reaches the bar (every criterion ≥ 3 and mean ≥ 4). **Second round with no candidate at the bar: the LOGO-1
kill rule applies.** The parent stops the loop, writes the handoff page and asks the owner whether to hire a human
identity designer. The pick page stays held; nothing here goes to the owner as a pick.

Ranking (for the designer / handoff only): Pair > Peel > Lift. Pair carries the product's job (a set of fliers); Peel is
the best drawn but is a stock icon; Lift repeats round 1's broken-corner read.

Round 1 fixes applied: sheet straightened with straight edges and tilted as a whole (yes, all three); corner attached at
the fold (Peel yes; Lift and Pair no, see craft); corner ≥ 30% of sheet height at 16 px (41%, yes); intro travels and
opens from the fold instead of fading (yes, partly: 5 px travel, not 10).

## S6 lineup (32 px) and S7 stock read

- S6 `c2*-lineup32.png`: the four stand-ins are letters in a circle or square (C, A, P, F). All three candidates are a
  figurative tilted sheet and none shares a competitor's outline. Cold read at 32: Peel "a document", Lift "a tag or
  a luggage label", Pair "two cards / a deck". S6 passes for all three; only Pair's read names the product.
- S7 `c2*-stock24.png` (frame holds file, sticky-note, send): **Peel at 24 px is the folded-corner file glyph** (Lucide
  `file`, Material Symbols `draft`/`description`, SF Symbols `doc.fill`): same silhouette, a sheet with its top-right
  corner turned down, only tilted. Lift's lifted flap breaks the dog-ear outline and does not match a stock glyph. Pair is
  closest to the two-sheet "copy/files" glyphs (Lucide `files`, `copy`; Material `file_copy`), which **the S7 frame does
  not include**: it was not checked against its nearest stock neighbour.

## C2a Peel

- **1 Distinctiveness 2.** S7: at 24 px it is the stock file icon in the same frame, one place to its left. Cover the name
  and it is any app's "document" button. Rubric: crit 1 at 2 is REDO whatever the mean.
- 2 Visibility 3: ink 30.2% at 16 px light (in band), 30.0% dark; the fold reads at 32. At 16 px the curl gap is 1.1 px
  (`stress.json` `gap_px_at_16`), under the 2 px floor: in the upscaled 16-light frame the curl merges with the sheet.
- 3 Useability 4: one colour 29.9%, reversed 30.2%, 0 px outside the maskable circle, header 360/1280 and OG legible.
- 4 Memorability 3: recalled as "a page with a curled corner", which is the generic object.
- 5 Universality 4: no gradient, no trend tell; ink-on-paper in one colour.
- 6 Timelessness 4: two pieces, one idea.
- 7 Craft 4: curl continuous with the fold, even gap, straight sheet edges; mark bottom sits on the wordmark baseline in
  `header360`.
- 8 Appropriate 3: paper, square, radius 0 (R6) respected; but the drawing says "file", not "flier" or "print shop".
- 9 Motion 3: sheet travels 5 px up-right and settles, corner collapses then curl unrolls from the fold line, ends on the
  still at 580 ms, micro 280 ms, reduced-motion still present (seen live). But the curl keyframe overshoots to
  `scaleY(1.08)` at 70%, against visual-language R10 "no overshoot".

Top fixes:
1. Leave the dog-ear family: a corner turned down onto the face is the stock file glyph and no tilt rescues it at 24 px.
2. Widen the curl gap to ≥ 2 px at 16 px (today 1.1 px), or drop the gap at 16 px and use a dedicated small-size glyph.
3. Curl keyframe `scaleY(1.08)` → `scaleY(1)` (no overshoot, R10).

## C2b Lift

- 1 Distinctiveness 3: no lineup or stock match; but its cold read at 32 is "a tag", not paper in flight.
- 2 Visibility 3: **ink 36.4% at 16 px, over the 35% band (S1)**; 41.2% for the full mark. At 16 px the full-length gap
  reads as a white diagonal slash, so the glyph splits into a pentagon plus a blob (upscaled 16-light/dark frames).
- 3 Useability 4: one colour 35.3%, reversed 35.6%, 0 px outside the safe circle.
- 4 Memorability 3: "a sheet with a leaf on its corner".
- 5 Universality 4: no trend tell.
- 6 Timelessness 3: the rounded half-lemon flap brings a curve family into a radius-0 paper mark (R6 shape families).
- **7 Craft 2.** The lifted corner is drawn larger than the corner cut from the sheet and with a round outer edge: a
  lifted corner of paper is the same straight-edged triangle as the cut, rotated about the fold. The gap runs the whole
  fold, so the flap reads detached: the round 1 "corner broke off" read is back (`construction-c2b.png`). The
  construction sheet's notes are clipped at the right edge again ("no free pi…"), the same defect flagged in round 1.
- 8 Appropriate 3: paper idea present; the flap reads as a leaf or beak, not print.
- 9 Motion 3: same structure and timings as Peel, same `scaleY(1.08)` overshoot.

Top fixes:
1. Draw the flap as the cut triangle itself, straight edges, rotated about the fold line; no round outer edge.
2. Join the flap to the sheet at the fold for at least half its length so it reads hinged, not detached; bring ink to ≤ 35%.
3. Fix the construction sheet so its notes are not clipped (wrap the text column or widen the canvas).

## C2c Pair

- 1 Distinctiveness 3: S6 clean, and two sheets read as "a set"; but S7 never put it beside the two-sheet copy/files
  glyphs, its nearest stock neighbours.
- **2 Visibility 2.** Ink 37.6% at 16 px, over the 35% band (45.6% full mark, the highest of the three). The back sheet is
  a tapered 1-2 px sliver at 16 px and smears into a grey edge on both light and dark (upscaled 16 px frames); three pieces
  separated by 1.4 px gaps do not survive 1x. Rubric: crit 2 at 2 is REDO whatever the mean.
- 3 Useability 4: one colour 39.2%, reversed 39.5%, 0 px outside the safe circle; legible in header and OG.
- 4 Memorability 3: "two sheets, the front one lifting a corner".
- 5 Universality 4: no trend tell.
- 6 Timelessness 3: three pieces, two ideas (a pair and a lift) in one mark.
- **7 Craft 2.** Same oversized round flap as Lift; the back sheet is a wedge (wider at the top than the bottom), not a
  sheet of paper in 1:1.414 proportion, so it reads as a shadow or a shard.
- 8 Appropriate 4: the only mark that says the product's job, a set of fliers from one form.
- 9 Motion 3: the back sheet swings in from 17° behind the front one, a good use of its own parts; but three layers move
  at once between 140 and 300 ms and the curl overshoots to `scaleY(1.08)` (R10: no overshoot).

Top fixes:
1. Drop the lift from Pair: two straight-edged sheets in true 1:1.414 proportion, the back one offset by ≥ 2 px at 16 px
   on two sides (not a sliver), so one idea carries the mark.
2. Bring 16 px ink to ≤ 35%: thin the front sheet or give the 16 px size its own two-sheet glyph without the gap.
3. Add Lucide `files`/`copy` and Material `file_copy` to its S7 frame and show the outline differs at 24 px.

## Kill rule

Round 1 (`../critique-2026-10-28-lp7.md`) and this round 2 both end with no candidate at the bar. Per the rubric's kill
rule the loop stops here: the designer writes the handoff page and the parent asks the owner, one question, whether to
hire a human identity designer. The best brief material to hand over: Pair's idea (a set of sheets), Peel's drawing
discipline, round 1 B's fan motion (parts opening about one pivot).

NOT COVERED: intro mid-flight not captured live (screenshot latency > 580 ms; mid-flight judged from the keyframes in
`motion/*.motion.json`, end state and reduced-motion still seen live); micro (hover/focus, 280 ms) judged from keyframes,
not watched; the live page froze twice on load before rendering; dark-mode page not rendered (dark 16/32 px frames were);
no real-device home screen; CVD frames not opened (one-colour marks); competitor marks are the pipeline's stand-ins;
S7 for Pair lacks its nearest stock glyphs; taste ledger `apps/flier-studio/docs/design/taste-ledger.md` does not exist,
so no ledger-row check was possible.
