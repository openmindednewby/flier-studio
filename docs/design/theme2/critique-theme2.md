# Critique: FLIER-2 "Flier Studio follow-ups" AC-16 theme 2 "Golden hour" (round 1, 2026-10-28)

Blind review by design-critic. I judged the rendered frames only: `frames/*.jpg`, `full/*.png` (1080x1920 story, 4 fliers per option), the source photo `KizombaWarrior/docs/event fliers/models/jimmyAndIsmini/jimmyAndIsmini2.png` and `vf/views-greyscale-cvd-squint.jpg`. Pick page: https://claude.ai/artifact/1eYZRXKCX3AUcH4764GP2y. Before = theme 1 "Kizomba classic".

## Verdict

| Option | Hard fails | Mean | Lowest | Verdict |
|---|---|---|---|---|
| C Sea window | none | 4.0 | #3 = 3 | **PASS** (rank 1) |
| A Horizon | none | 3.6 | #5 = 2 | **REDO** (rank 2) |
| B Blue hour | none | 3.4 | #4 = 2, #5 = 2 | **REDO** (rank 3) |

A and B are REDO on taste and craft, not on a hard fail. If the published pick page offers them as pickable, withdraw them there until round 2.

## Hard fails (checked first)

| Check | A | B | C | How measured |
|---|---|---|---|---|
| Lost text item | 40/40 | 40/40 | 40/40 | `result.json` `visibleItems` per frame, then each frame checked by eye. There are 11 item kinds, but each flier carries 10 of them: the workshops have `schedule`, Upcoming has `listItems`. So 40 is the true total, not 44. |
| Text over the picture | 0 | 0 | 0 | `textUnderPicture` = 0 in all 24 frames (text box vs picture-rect intersection, `render-options.mjs:101`). The eye check agrees. |
| Text contrast < 4.5:1 | none | none | none | I sampled rendered pixels in the text-only regions: each text colour (tolerance 8) against the median of its non-text pixels within 14 px. 1st-percentile values: A title 5.09, accent 4.76, ink 9.74, soft 4.91 · B title 4.37*, accent 5.91, ink 13.02, soft 7.05 · C title 4.96, accent 5.18, ink 10.50, soft 5.20. |
| Form rows | n/a | n/a | n/a | Posters have no form controls. |
| Pair parity | pass | pass | pass | All 24 frames carry 4 distinct `pair` records, one per shot, and each before/after pair shares it: same preset, same 1080x1920, same origin, same crop. |

\* B title p1 4.37 is a probe artefact. The heavy condensed title's anti-aliased edge pixels are the "background" median in that window. The real pair is #F2CBAA on #1C2830 = 9.96:1. The few min values below 4.5 for accent in A and C sit on the map-pin disc (accent disc with a white pin), which is an icon, not text.

**Stale evidence.** The top lines of `vf/contrast.txt` still list superseded failing pairs (A accent 4.41/4.29, C accent 3.98, C soft 3.97). The palette in `options.json` (#8A4325, #8F4A29, #4E5F6A) is what rendered and it passes. Delete the stale lines so the owner does not read a fail that no longer exists.

## Scores (1-5)

Criterion 7 is judged on the 1080x1920 poster, the only size rendered. Criterion 9 does not apply (not a game).

| # | Criterion | A Horizon | B Blue hour | C Sea window |
|---|---|---|---|---|
| 1 | Focal point / purpose | 4: the couple on the right and the big title; it reads as a workshop in under 5 s | 4: the arch frames the couple, the strongest single focal shape of the three | 4: the photo window and the title; the date is the weak beat (see #3) |
| 2 | Portability | 3: sky gradient plus cut-out couple is a common template; the colour is taken from this photo | 3: dark poster with an arch is a stock look | 4: the real photo with its real sea and wall: this flier could only be these two people at this beach |
| 3 | Hierarchy, type, spacing | 4: the schedule and prices are large and step cleanly; one text column | 3: party pass "20€" (bottom right) is separated from "Party pass includes" (top right) by the whole arch; venue switches to condensed caps; "per hour" / "Party pass" labels are small beside the arch | 3: the date script "Saturday 31 October" is about 0.35x the title cap height, the smallest line in the block although it is the key fact; the whole text block is packed into the top 40% |
| 4 | Visual language / harmony with the photo | 3: sky colours sampled from the photo, but the painted sea starts at the couple's knees while the photo's horizon is at shoulder height, so the light and geometry disagree | 2: night palette (#1C2830) behind a couple lit by low warm daylight. One light is broken, and it contradicts both the theme name "Golden hour" and the brief's "in harmony with the photo" | 4: the palette is sampled from the photo (sky #C4D2D4, sea #537993, skin #B76D50 → accent) and the photo keeps its own light |
| 5 | Owner's taste | 2: the owner "spots physical errors in mockups (unjoined depth, wrong light path)" (`user_design_taste.md`). There is a jagged white matte halo around the jeans and the leftover wall between the legs against the painted sea (full frame x 440-1080, y 1650-1920), and the horizon sits in the wrong place | 2: the same memory: colour "taken from the world's own art" and "wrong light path". A sunlit cut-out on a night ground is that error | 4: calm, colour from the photo, nothing pasted |
| 6 | AI-default tells | 4: none; no violet, no 135deg gradient | 4: none | 4: mild box-in-box (tinted panel inside a paper page) |
| 7 | Text fits | 4: no overflow, no clipping on the 4 fliers | 4: no overflow | 4: no overflow; the Upcoming column sits close to the photo edge but clears it |
| 8 | Inventory true | 5: 40/40 | 5: 40/40 | 5: 40/40 |
| | **Mean** | **3.6** | **3.4** | **4.0** |

There is no taste ledger at `apps/flier-studio/docs/design/taste-ledger.md`, so criterion 5 cites the owner-taste memory and the FLIER-1 picks page (`docs/design/FLIER-1-app-picks/index.md`).

## Top fixes (every item kept; none removes an inventory item)

**C Sea window (PASS, before the owner picks):**
1. Make the date script about 2x larger (cap height about 0.6x the title, like A), and give the text block the extra height by starting the photo window about 90 px lower.
2. Upcoming: draw one tinted panel for title and list at the same width (today the title panel is full width and the list panel is narrower), or drop the tint and keep paper.
3. Workshop: align the right column ("5€ per hour" ...) to the baseline of "Bailemos Dance School" so the two columns share one top edge.

**A Horizon (REDO):**
1. Remove the painted sea band, or move it to the photo's horizon (the couple's shoulder line) so that sea and figures agree.
2. Clean the cut-out matte: no white fringe and no leftover wall pixels between the legs (erode about 2 px, feather 1 px). Or end the picture on the sea/sky without the seated legs crossing the band.
3. Keep the warm-sky stop low behind "Classes by Jimmy & Ismini" (soft text is at 4.91:1 there, the thinnest margin in the set).

**B Blue hour (REDO):**
1. Replace the night ground with the photo's own dusk sky values (top #C0D4D8 → #97AAB9, or the sea #507894 for a dark variant), so the background light matches the light on the couple.
2. Put "20€ Party pass" directly above "Party pass includes" so a price and what it buys sit together.
3. Set the venue in the same face as the schedule (not condensed caps).

## NOT COVERED

- Posters only at story 1080x1920. The other export sizes (square, A4/print) and the in-app preview at 360x640 and 1280x800 were not rendered or seen.
- `vf/views-greyscale-cvd-squint.jpg` may predate the final frames (layouts differ slightly). I did not re-run greyscale or CVD on the final frames.
- The contrast probe is a pixel-colour heuristic. Gradient-sky lines were not checked glyph by glyph, and print colour (CMYK) was not checked.
- Pick-page markup (`data-inventory`, `data-aligned`) was not opened.
