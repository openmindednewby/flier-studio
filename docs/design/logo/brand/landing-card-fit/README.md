# LOGO-1 "A logo pipeline that makes beautiful, animatable marks" -- landing card refit (Tier 1, DESIGN-TIER-1)

Defect: dloizides.com Flier Studio card cropped by `object-fit: cover` (dloizidesLandingPage/styles.css:81); report
BaseClient/docs/Tasks/TODO/flier-studio/FLIER-2-flier-studio-followups/qa-2026-10-28-live-8a0e88c.md. Shared CSS untouched.

## Measured (before.json, live https://dloizides.com/)
| View | Card | Image box | Visible source crop (of 1280x800) | Info header covers image from |
|---|---|---|---|---|
| 360 Galaxy S5 | 360x373 | 360x306 (1.18:1), scale 0.3825 | x 169..1111 | img y ~258 = source y ~675 (sighted in capture) |
| 1280 Desktop Chrome | 400x373 | 400x306 (1.31:1), scale 0.3825 | x 117..1163 | img y 258 = source y 675 (elementFromPoint) |

Safe area used (gen_card.py): x 230..1050, y 60..620 (covers a 320 px card too: x 222..1059). Art block
lands at x 339..941, y 129..551: stacked lockup (mark 210 px) + tagline 34 px, all outlined paths, 0 live text.

## Pair (PAIR-PARITY-1)
Same script, same steps (capture.cjs): device descriptor, goto, wait image complete, card scrollIntoView center,
page clip of the card +8 px. Only difference: `after` serves the new PNG via page.route for images/flier-studio.png.
before-360.png / after-360.png, before-1280.png / after-1280.png; frame data in before.json / after.json.

## Inventory (3/3): mark kept, wordmark "Flier Studio" kept, tagline kept. Nothing moved out of the card.

## For design-critic
Check: full wordmark + mark visible at 360 and 1280; tagline clear of the white info header; optical centring of a
left-aligned stacked lockup over a centred tagline; the circular thumb (same PNG) still reads.
