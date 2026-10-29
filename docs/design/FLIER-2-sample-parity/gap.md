# FLIER-2 "Flier studio follow-ups": parity with the Ismini WhatsApp sample

Owner request 2026-10-29 12:10 (task doc `BaseClient/docs/Tasks/TODO/flier-studio/FLIER-2-flier-studio-followups/FLIER-2-flier-studio-followups.md`, section "match the Ismini WhatsApp sample"). Parity copy of the source's look: no options (memory `feedback_parity_copy_source_styles_never_invent`).

- **Sample:** `KizombaWarrior/docs/event fliers/events/JimmyAndIsminiWorkshops/Ismini sample whatsapp.jpeg`, 900x1600 (9:16, JPEG, colours carry ~±6 compression noise).
- **Ours:** `.../JimmyAndIsminiWorkshops/fliers/workshop-20261031.png`, 1080x1920, theme `kizomba-classic` (= `kizombaWorkshopDocs[0]`: palette `Sand`, fonts `Classic`, background `Solid`, layout `PictureRight`, compact rows).
- **Side by side:** [side-by-side.jpg](side-by-side.jpg) (ours scaled to 900x1600, red ticks every 10% of height).

Units: y and sizes are % of canvas **height** (H), x and widths are % of canvas **width** (W). "Cap" = cap height (top of a capital to the baseline), measured from the pixel bounding box of the darkest pixels. Hex = mean of the core (non-antialiased) pixels.

## Measurements

### Page and header

| Element | Sample | Ours |
|---|---|---|
| Page background | `#fefefe` (white) | `#f5f4f2` (Sand background) |
| KIZOMBA | heavy condensed grotesque, ~Anton / Barlow Condensed 800; cap **9.4% H**; x 6.6-56.4% W; y 5.9-15.3%; `#6d645d` | Oswald bold; cap 7.2% H; x 5.5-62.1% W; y 2.4-9.7%; `#958a80` |
| Width per cap (glyph proportion) | 448 px wide / 150 px cap = 3.0 (narrower, heavier strokes) | 611 / 138 = 4.4 |
| Script date | "Saturday 31/10"; monoline semi-upright script, large x-height (~55% of cap), digits upright; digit height ~4.2% H; band y 16.0-22.4%; x 7.1-87.4% W (runs past the title edge); `#e5bb97` | "Saturday 31 October"; Sacramento, thin, small x-height; digit height ~3.0% H; band y 12.7-17.7%; x 4.9-57.2% W; `#e9b887` |
| WORKSHOP | same face; cap **11.2% H** (1.19x KIZOMBA); x 7.4-79.9% W; y 23.7-34.9%; `#6c635c` | cap 6.4% H (0.89x KIZOMBA); x 4.9-69.1% W; y 18.0-24.4%; `#958a80` |
| Header gaps | top margin 5.9%; KIZOMBA→date 0.7%; date→WORKSHOP ~1.3% (date baseline ~21.0%); WORKSHOP→1st rule 0.8% | top 2.4%; KIZOMBA→date 3.0%; date→WORKSHOP 0.3%; WORKSHOP→1st rule 5.6% |
| Logo | none | Bailemos logo x 73.3-89.4% W, y 5.5-14.7% |
| Left text edge | 5.8-7.4% W | 4.5-5.5% W |

### Body rows

| Element | Sample | Ours |
|---|---|---|
| Row structure | 5 rows: venue, Beginners, Intermediate, 5€, 20€; each row = icon + 2-line stack | venue (2 lines) + 4 one-line rows (compact) + "Party pass includes" list + footer |
| Divider lines | thin (~2 px of 1600 = **0.12% H**), `#d5bca8`, one ABOVE venue and one below every row except the last: y 35.7 / 42.6 / 53.4 / 64.4 / 77.2%; all start at x 5.8% W and stop at the picture: end x 65.7 / 53.0 / 44.4 / 36.1 / 37.0% W (drawn behind the picture) | two thick rules (~8 px of 1920 = **0.42% H**), `#e9b47f`, only above and below venue, y 30.0-30.4% and 37.4-37.9%; x 4.5-32.3% W |
| Row pitch (rule to rule) | 6.9% (venue), 10.8%, 10.9%, 12.8% | venue 7.4%; rows 2.3-6% apart, no rules |
| Venue icon | bare map pin (no circle), filled `#c89f80`, white hole; 5.3% W x 4.1% H; x 6.4% | pin cut out of a filled circle `#e9b47f`; circle 11.3% W (7.8% H); x 4.5% |
| Row icons | filled circle `#cca383`, diameter **9.8% W (5.7% H)**, x 5.8-15.6% W, vertically centred on the 2-line stack; white outline glyph (~2 px stroke): one person (Beginners), two people (Intermediate), ticket rotated -45° (both prices) | none |
| Text column | x **19.1% W** (gap icon→text 3.5% W) | 4.5% W (no icons); venue text 18.7% W |
| Venue text | "Bailemos Dance School" ONE line; semi-condensed grotesque bold (~Barlow Semi Condensed 600-700); cap **2.3% H**; `#4a3e39` | two lines "Bailemos" / "Dance School"; Oswald; cap ~2.6% / 1.9%; `#5f564f` |
| Level label | "Beginners" / "Intermediate", same face bold; cap **2.3% H**; `#433530` | "Beginners  20:00 - 21:00" one line, Fredoka bold; cap ~1.2% H; `#615851` |
| Time | own line under the label, same face regular-medium; digit height **2.1% H**; `#ad8164`; format `20.00–21.00` (periods, en dash, no spaces) | inline after label; `20:00 - 21:00` |
| Price amount | "5€" / "20€" bold; cap **2.75% H**; `#433832` | "5€ per hour" / "20€ Party pass" one line Fredoka bold; cap ~2.2% H; `#5f564f` |
| Price label | own lines under the amount, Greek, regular; x-height ~1.0% H; `#ad8164`; 2 lines each ("κάθε ώρα / μαθήματος", "το πάσο / του πάρτυ") | inline after amount |
| Includes list + footer | absent | "Party pass includes" + 3 bullets (`#e9b47f` heading/bullets), "Classes by Jimmy & Ismini" `#b3a89e` |

### Picture and backdrop

| Element | Sample | Ours |
|---|---|---|
| Couple bbox | x **35.0-99.9% W**, y **33.0-99.9% H** (67% H tall), bleeds right and bottom | x 41.2-99.9% W, y 38.6-99.9% H (61% H) |
| Scale / offset | ~1.10x ours, moved 6% W left and 5.6% H up; top of the bun sits level with WORKSHOP's baseline | anchor Bottom, scale 1 |
| Overlap with text | picture occupies x ≥35% W from y 45% down; text column ends ≤48% W, rows shorten their rules so nothing crosses | none (`nothingCoversPicture` keeps text left of 40% W) |
| Backdrop | soft dry-brush strokes behind the couple: warm grey `#cdc3b9`-`#e8ded4` stroke to the couple's left (x ~40-55% W, y ~42-65%), grey `#96918b`-`#9c8c7d` strokes bottom-left (x ~38-50% W, y ~85-100%), tan `#c4a682`-`#daae81` strokes bottom-right (x ~85-100% W, y ~75-95%) | none (Solid background); the renderer only has the `arch` backdrop shape |

## Gap table

| Element | Sample | Ours | Missing feature (poster-render or app) | Config value to apply |
|---|---|---|---|---|
| Page background | `#fefefe` | `#f5f4f2` | none (palette field) | new palette `KizombaSample`: `background: '#fefefe'` |
| Title colour | `#6d645d` | `#958a80` | none | palette `title: '#6d645d'` |
| Display face | heavy condensed grotesque, ratio 3.0 | Oswald, ratio 4.4 | poster-render: a font set with a heavier condensed display face (Anton) + the font loaded in the app | new font set `KizombaSample`: `display: '"Anton", "Oswald", "Arial Narrow", sans-serif'` |
| KIZOMBA size | cap 9.4% H | 7.2% H | poster-render: per-theme title scale (only `headerGap` / `itemDateScale` exist in `PosterTuning`) | `lineStyles.title.sizeScale: 1.31` (9.4 / 7.2) |
| WORKSHOP size | cap 11.2% H, 1.19x KIZOMBA | 6.4% H | same | `lineStyles.titleBottom.sizeScale: 1.75` (11.2 / 6.4) |
| Header top margin | 5.9% H | 2.4% H | poster-render: `PosterTuning.headerTop` | `tuning.headerTop: 0.059` (fraction of H) |
| Header line gaps | 0.7% / 1.3% / 0.8% | 3.0% / 0.3% / 5.6% | poster-render: per-gap tuning (title→script, script→titleBottom, header→body) | `tuning.headerGap` → split into `titleScriptGap: 0.007`, `scriptTitleGap: 0.013`, `bodyGap: 0.008` |
| Script face | monoline semi-upright, big x-height | Sacramento | poster-render font set script entry; face to confirm by font-ID pass (candidates in the measurement table) | font set `script:` the identified face |
| Script colour | `#e5bb97` | `#e9b887` | none | `lineStyles.script.color: '#e5bb97'` (or palette `accent` if dates and icons are split, see below) |
| Script size | digits 4.2% H, line runs to 87% W | digits 3.0% H, 57% W | none (lineStyles exists) | `lineStyles.script.sizeScale: 1.4` |
| Script text | `Saturday 31/10` | `Saturday 31 October` | content, not theme | content `script: 'Saturday 31/10'` (owner content; per flier) |
| Logo | absent | top right | none | parity look = no logo; removing it is a content removal (NOLOSS-GATE-1): leave `logo` in content, theme hides it via `showLogo: false` (poster-render: new style flag) |
| Divider lines | 0.12% H, `#d5bca8`, above venue + below every row but the last | 0.42% H, `#e9b47f`, around venue only | poster-render: rule style per theme (thickness, colour) and `rulesBetweenRows` on schedule + price groups | `rule: { height: 0.0012, color: '#d5bca8', between: 'all-rows', last: false }` |
| Divider length | from x 5.8% W to the picture's edge at that y (65.7 → 36.1% W) | fixed 4.5-32.3% W | poster-render: rule runs to the picture silhouette / region edge, drawn under the picture | `rule.extent: 'to-picture'` |
| Row icons | circle `#cca383` Ø 9.8% W, white outline glyph: person, two people, ticket (-45°) | none | poster-render: icon glyph set (`person`, `people`, `ticket`) + icon on schedule and price groups; app: an icon picker per row | `icons: { schedule: ['person', 'people'], prices: 'ticket', fill: '#cca383', glyph: '#ffffff', size: 0.098 }` |
| Venue icon | bare pin `#c89f80`, 5.3% W x 4.1% H | pin in a circle `#e9b47f`, 11.3% W | poster-render: pin variant without the circle | `icons.venue: 'pin-bare'`, colour `#c89f80` |
| Text column x | 19.1% W | 4.5% W | follows from icons (icon 5.8-15.6% W + 3.5% W gap) | `icons.gap: 0.035` |
| Venue line | one line "Bailemos Dance School", cap 2.3% H, `#4a3e39` | two lines, Oswald | content (venue as one entry) + body face | content `venue: ['Bailemos Dance School']`; palette `ink: '#45372f'` |
| Body face | semi-condensed grotesque bold (~Barlow Semi Condensed 600-700) | Fredoka | poster-render font set `body` + app font load | font set `body: '"Barlow Semi Condensed", sans-serif'` |
| Schedule rows | stacked label (cap 2.3% H, `#433530`) over time (2.1% H, `#ad8164`) | one line (compact) | none: the non-compact path already stacks label + time (`blockGroups.ts:104`) | theme `compact: false`; palette `accent: '#ad8164'` |
| Time format | `20.00–21.00` | `20:00 - 21:00` | content | content `time: '20.00–21.00'` |
| Price rows | stacked amount (cap 2.75% H, `#433832`) over a 2-line label (`#ad8164`) | one line | none: non-compact stacks (`blockGroups.ts:109`); label wrap at the column width | `compact: false`; label wraps at column width (~29% W) |
| Price labels | Greek, 2 lines each | English, inline | content | content per flier (owner text) |
| Includes + footer | absent | shown | none | parity look hides them; removal is a content decision (NOLOSS-GATE-1): theme flag `showIncludes: false`, `showFooter: false`, content kept |
| Picture box | x 35-100% W, y 33-100% H, 67% H tall | x 41-100% W, y 38.6-100% H | poster-render: picture region may start left of the text column end and above the body (`nothingCoversPicture` forbids it today); text stays clear by shortened rules, not by a hard column | `picture: { anchor: 'bottom-right', scale: 1.10, offsetX: -0.06, offsetY: -0.056 }`, `allowTextOverlap: 'rules-only'` |
| Backdrop | dry-brush strokes: grey `#cdc3b9`/`#96918b`, tan `#c4a682`/`#daae81` | none | poster-render: `BackgroundStyle.Brush` (or a backdrop asset layer drawn behind the picture); app: backdrop asset slot | `background: 'brush'`, `brush: { colors: ['#cdc3b9', '#96918b', '#daae81'], behind: 'picture' }` or a `backdrop` image asset cut from the sample |

## Palette for the new preset (measured, JPEG-corrected to round values)

| Role | Hex | Used by |
|---|---|---|
| background | `#fefefe` | page |
| title | `#6d645d` | KIZOMBA, WORKSHOP |
| ink | `#45372f` | venue, level labels, amounts |
| accent | `#ad8164` | times, price labels |
| script | `#e5bb97` | date line |
| icon | `#cca383` | row circles, `#c89f80` bare pin |
| rule | `#d5bca8` | dividers |

Contrast on `#fefefe`: ink ~11.3:1, title ~5.7:1, accent `#ad8164` ~3.4:1 (passes 3:1 for large text only; times are 2.1% H ≈ 34 px at 1600, large), script `#e5bb97` ~1.8:1 (decorative, matches the sample; legibility relies on size).

## Notes

- Four style/content splits: everything in the gap table marked "content" is per-flier text and is NOT a theme value; the theme is the look only.
- The gap rows needing poster-render work: display/body/script faces, title scales, header gaps, rule style + extent, icon glyph set, bare pin, picture overlap, brush backdrop, logo/includes/footer visibility flags. Everything else is a palette or `compact: false`.
- NOT measured: exact font identity (guessed from proportions; needs a font-ID pass), the golden-hour and list fliers (only the 31/10 event flier was compared), sub-pixel rule thickness (JPEG blur).
