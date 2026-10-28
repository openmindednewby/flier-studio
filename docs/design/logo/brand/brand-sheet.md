# Flier Studio brand

Mark R3 "In flight": a sheet leaving the press, its corner curling as it lifts. Picked by the owner on 2026-10-28 (LOGO-1 "A logo pipeline that makes beautiful, animatable marks", decision D5). Two parts, one colour, no live type. Page: `brand-sheet.html` (built by `gen_sheet.py`; exports by `gen_brand.py` + `render_brand.cjs`).

## 1. Mark and lockups

- Mark: `exports/mark.svg` (named groups `mark-sheet` / `mark-curl`, `data-motion-layer` sheet / curl).
- Horizontal lockup: `exports/lockup-header-light.svg`, `exports/lockup-header-dark.svg`. Wordmark baseline = mark bottom.
- Stacked lockup: `exports/lockup-stacked-light.svg`, `exports/lockup-stacked-dark.svg`. Wordmark ink left = mark left.
- Wordmark: Fraunces, "Flier" 560 / "Studio" 380, outlined to paths (0 live `<text>`).
- Small glyph (24 px and below): same two parts, curl enlarged, wider gap (`FLY_SMALL` in `../gen.py`).

## 2. Construction

`../svg/construction-r3.svg`: 64-unit grid, straight top and bottom edges, curved long edges, curl 3 units from the sheet, left edge overshoots the bottom by 1 unit.

## 3. Clear space and minimum sizes

Clear space: 1 c on every side, c = the curl's height = 20% of the mark's height (mark and both lockups).

| Use | Screen | Print |
|---|---|---|
| Mark | 16 px (small glyph at 24 px and below) | 6 mm |
| Horizontal lockup | mark 24 px tall | 30 mm wide |
| Stacked lockup | mark 64 px tall | 20 mm wide |

## 4. Colour (`@dloizides/design-tokens` preset `flier`; no new colour, no token change)

| Role | Value | On | Contrast |
|---|---|---|---|
| primary (light mark) | #4a423c | surface #fbfaf8 | 9.43:1 |
| text (lockup, light) | #2f2925 | surface #fbfaf8 | 13.74:1 |
| text on page (OG, card) | #2f2925 | page #ebe8e3 | 11.73:1 |
| dark.brandFill (dark mark + lockup) | #e8dccb | dark.background #1c1a17 | 12.84:1 |
| dark.brandFill | #e8dccb | dark.surface #25221e | 11.71:1 |
| dark.brandFill (app icon) | #e8dccb | primary #4a423c | 7.27:1 |

## 5. Do not

Stretch or squash · recolour with the accent #e9b47f · outline it · add shadows, glows or bevels · rotate or rearrange the parts · use primary on a dark surface (1.61:1; use brandFill) · place it on a busy image.

## 6. Motion (`exports/motion.json`, played by `@dloizides/ui-motion/logo` `playLogo` + `bindMicro`)

| Beat | Layer | Property | From → to | Duration | Easing | Start |
|---|---|---|---|---|---|---|
| Intro 1 | sheet | translate, rotate, opacity | (-10, 10) px, 12°, 0 → rest | slow 300 | decelerate | 0 |
| Intro 2 | curl | rotate, scale, opacity | 28°, 0.6, 0 → rest | slow 300 | decelerate | 280 |
| Micro | curl / sheet | rotate / translateY | -10° / -1.5 px and back | 280 (2 x fast) | standard | 0 |

Intro ends at 580 ms, once per session. Micro on hover, focus, loading. No overshoot (R10). Reduced motion: no animation, the static mark at once. `exports/mark-animated.svg` carries the intro as CSS keyframes with the reduced-motion query inside.

## 7. Exports (`exports/`)

| File | Checked |
|---|---|
| favicon.svg | small glyph; primary, brandFill under `prefers-color-scheme: dark` |
| favicon.ico | 16 + 32 + 48 |
| favicon-16.png, favicon-32.png | transparent; ink 33.9% / 33.6% (band 20-35%) |
| apple-touch-icon.png | 180x180, RGB, opaque |
| icon-192.png, icon-512.png | PWA `any`, brandFill mark on primary |
| icon-512-maskable.png | PWA `maskable`; mark 62% tall, 0 px outside the 80% circle |
| og-image.png | 1200x630, stacked lockup + tagline on one left edge |
| landing-card-1280x800.png | dloizides.com app card |
| lockup-header-light.svg, lockup-header-dark.svg | outlined, 0 live text |
| lockup-stacked-light.svg, lockup-stacked-dark.svg | outlined |
| mark.svg, mark-mono.svg, mark-reversed.svg | named layers / one colour / reversed |
| mark-animated.svg | intro keyframes, reduced-motion query inside |
| motion.json | intro + micro beats |

Wiring the manifest, `<link rel="icon">` tags and the header (`index.html:14-16`) is frontend-dev's change.
