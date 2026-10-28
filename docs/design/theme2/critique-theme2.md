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

---

# Round 2: option A "Horizon" as built, minus the sea band (2026-10-28)

The owner picked A without the sea band. I judged the 4 built PNGs in `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/fliers/*-golden-hour.png` (1080x1920). The theme-1 PNGs beside them are the before frames.

## Verdict: ESCALATE (A, second taste REDO). No hard fail. Mean 3.9, lowest #5 = 3

This is A's second round below the bar on a taste/craft criterion (#5), so under the two-round rule it goes to the owner rather than a third loop. The one remaining defect is small and concrete (fix 1 below). The designer should apply it before the owner sees the fliers.

## Hard fails (checked first)

| Check | Result | How measured |
|---|---|---|
| Lost text item | none, 4/4 fliers | Each golden-hour flier checked by eye against its theme-1 before: title, date/"Kizomba" script, WORKSHOP(S), logo, venue, each level + time, 5€ per hour, party pass price(s), "Party pass includes" + 3 items, "Classes by Jimmy & Ismini". Every one is present. |
| Text over the picture | none | Workshop text column ends at x≈385 and the cut-out starts at x≈470. On Upcoming the column ends at x≈490 and the shirt edge is at x≈545. |
| Text contrast < 4.5:1 | none | Glyph core (p0.5 darkest) vs ground (p90) per text block. 31 Oct: title 5.11, date 4.81, venue 9.76, level 9.97, time 5.15, per hour 5.25, includes 5.29, list 10.40, classes 4.90. Upcoming: date 5.09, schedule 10.35, party pass 5.31, 5€ per hour 10.41, list 10.48, classes 4.93. |
| Form rows | n/a | Posters have no form controls. |

## Round 1 fixes for A

| r1 fix | Status | Evidence |
|---|---|---|
| 1 Remove the painted sea band | done | The ground is now one sky-to-sand gradient, and nothing crosses the legs. The light geometry no longer disagrees. |
| 2 Clean matte, no wall remnant between legs/fingers | **partly done** | The jeans and shirt edges are clean, with no white fringe, and the gap between the legs is clean ground. The **fingertips of his left hand** (the hand resting at the crotch, full frame x≈700-820, y≈1660-1700, the same on all 4 fliers) are still wrong: a stair-step matte cuts the tips flat, there are light specks between the fingers, and an ochre wall remnant sits beside the index fingertip (x≈716, y≈1682). |
| 3 Keep "Classes by" ≥ 4.5:1 | done | 4.90 / 4.93. |

## Scores (1-5)

| # | Criterion | A r2 |
|---|---|---|
| 1 | Focal point / purpose | 4: the title, then the couple; it reads as a workshop at once |
| 2 | Portability | 3: a cut-out on a gradient is a common template; the sky colours come from the photo |
| 3 | Hierarchy, type, spacing | 4: the schedule steps cleanly. There is a dead gap of ≈150 px between WORKSHOP and the venue rule (y≈430-575) |
| 4 | Visual language | 4: one warm low light, and the ground now agrees with it |
| 5 | Owner's taste | 3: the owner "spots physical errors in mockups" (`user_design_taste.md`). The clipped, specked fingertips are such an error on an otherwise clean cut-out |
| 6 | AI-default tells | 4: none |
| 7 | Text fits | 4: no overflow or clipping on any of the 4 fliers |
| 8 | Inventory true | 5: every item kept |
| | **Mean** | **3.9** |

## Top fixes (every item kept)

1. Re-matte his left hand's fingertips: restore the full fingertip shapes from the source photo, delete the ochre wall pixels and the light specks between the fingers, then erode 1-2 px and feather 1 px on that edge only.
2. Close the dead gap under WORKSHOP: move the venue block up ≈80 px, or give that height to the date script.
3. Upcoming: the date scripts ("Sat 31 Oct" ...) are the thinnest strokes on the page. Increase them ≈15% so they read at phone-story size.

## NOT COVERED

- Story 1080x1920 only. Square, A4/print and the in-app preview at 360x640 and 1280x800 were not seen.
- No greyscale/CVD pass was run on the built PNGs, and print CMYK was not checked.
- `result.json` `pair` records for the built golden-hour PNGs were not read. Pair parity was judged by eye only: same size, same text and same layout slots as theme 1.
- Contrast comes from a pixel-percentile probe, not a per-glyph measurement.

---

# Round 3: option A "Horizon" rebuilt at flier-studio 1e7b674 (2026-10-28)

I judged the same 4 PNGs, rebuilt (`*-golden-hour.png`, 1080x1920), with the theme-1 PNGs beside them as the before frames.

## Verdict: ESCALATE stands (A, third round below the bar on #5). No hard fail. Mean 3.9, lowest #5 = 3

Two of the three round-2 fixes landed. The fingertip matte, the only defect left, is not fixed in the picture. The commit says "fingertip wall, pinholes and ochre speck cleaned", but the rendered flier still shows all three defects. This is the same craft finding for the third round, so it stays with the owner, as the two-round rule says. The designer should still re-matte the hand before the owner sees the fliers.

## Hard fails (checked first)

| Check | Result | How measured |
|---|---|---|
| Lost text item | none, 4/4 | Checked by eye against theme 1, same list as round 2. Every item is present on all 4. |
| Text over the picture | none | 31 Oct: the text column ends at x≈385 and the hand starts at x≈555. Upcoming: the column ends at x≈490 and the arm starts at x≈615. |
| Form rows | n/a | Posters have no form controls. |
| Pair parity | pass by eye | Same 1080x1920 frame, same text and same slots as theme 1. The `result.json` pair records were not read. |

## Round 2 fixes

| r2 fix | Status | Evidence |
|---|---|---|
| 1 Re-matte his left hand's fingertips | **not done** | 31 Oct at 8x, x 690-850, y 1650-1710 (the same on all 4): the matte still cuts the fingertips with a flat, stair-stepped bottom edge. A dark rectangular block of the old background sits left of the index fingertip (x≈700-715, y≈1680-1695). A grey-olive stone strip still fills the gap between the index and middle fingers (251 low-saturation mid-grey px in the box). The ochre speck at x≈714, y≈1680 is still visible as 2-3 orange px. |
| 2 Close the gap under WORKSHOP | done | WORKSHOP ink ends at y=416 and the venue rule starts at y=522: a gap of 106 px (round 2: ≈158). The same holds on 7 and 29 Nov (411→517, 410→516). `headerGap: 64`. |
| 3 Upcoming date scripts +15% | done | `itemDateScale: 1.15`. The "Sat 31 Oct" row is now 48 px of ink (y 761-809) and reads at story size. |

## Scores (1-5)

| # | Criterion | A r3 |
|---|---|---|
| 1 | Focal point / purpose | 4 |
| 2 | Portability | 3: a cut-out on a gradient; the colours come from the photo |
| 3 | Hierarchy, type, spacing | 4: the dead gap is gone; the header, venue and schedule now read as one column |
| 4 | Visual language | 4 |
| 5 | Owner's taste | 3: the fingertip matte is the kind of physical error the owner spots (`user_design_taste.md`). It is unchanged on the picture |
| 6 | AI-default tells | 4 |
| 7 | Text fits | 4: no overflow on any of the 4 |
| 8 | Inventory true | 5 |
| | **Mean** | **3.9** |

## Top fix (every item kept)

1. Re-matte the left-hand fingertips by hand from the source photo, not by a threshold pass. Paint the alpha so each fingertip ends in a round tip with no straight cut. Set alpha 0 on the background block left of the index finger and on the stone strip between the index and middle fingers, and remove the ochre px at (714, 1680). Feather that edge 1 px. Then verify on the rendered PNG at 8x, not on `couple.png` alone. The commit message said this was fixed, but the PNG does not show it.

## NOT COVERED

- Story 1080x1920 only. Square, A4/print and the in-app preview at 360x640 and 1280x800 were not seen.
- No greyscale/CVD or contrast re-run on the rebuilt PNGs. Text colours look unchanged from round 2, but this was not re-measured.
- `result.json` `pair` records were not read; pair parity was judged by eye.
- `couple.png` itself was not opened. The defect is judged on the rendered flier.
