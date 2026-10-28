# LP6 motion (tokens: design-tokens DEFAULT_MOTION; fast 140, base 200, slow 300 ms; standard / decelerate / accelerate)

Files: `svg/motion/r*-intro.svg`, `r*-micro.svg` (CSS keyframes inside the SVG, reduced-motion media query in the same file), strips `png/motion/r*-intro.png` (0,140,280,420,560,700,860,1200 ms), `r*-micro.png` (0..280 ms), still `r*-still.png` (rendered with reduced motion). Stagger offsets are multiples of `fast`.

| Mark | Beat | Layer | Property | From → to | Duration | Easing | Start |
|---|---|---|---|---|---|---|---|
| R1 intro | 1 | mark-stem | translateY, opacity | 10 px, 0 → 0, 1 | slow | decelerate | 0 |
| R1 intro | 2 | mark-arm-top | translateX, rotate, opacity | -12 px, -14° , 0 → rest | slow | decelerate | 280 |
| R1 intro | 3 | mark-arm-mid | translateX, rotate, opacity | -10 px, -10°, 0 → rest | base | decelerate | 560 (ends 760) |
| R1 micro (hover) | 1 | mark-arm-top / mark-arm-mid | rotate | 0 → -5° / -4° → 0 | 280 (2 x fast) | standard | 0 |
| R2 intro | 1 | mark-strip-1 | opacity | 0 → 1 | base | decelerate | 0 |
| R2 intro | 2-4 | mark-strip-2..4 | rotate about the rivet | closed (-18/-36/-54°) → open | slow | decelerate | 0 / 140 / 280 (ends 580) |
| R2 micro (loading) | 1 | mark-strip-2..4 | rotate | 0 → -4/-8/-12° → 0 | 280 | standard | 0 |
| R3 intro | 1 | mark-sheet | translate, rotate, opacity | (-10, 10) px, 12°, 0 → rest | slow | decelerate | 0 |
| R3 intro | 2 | mark-curl | rotate, scale, opacity | 28°, 0.6, 0 → rest | slow | decelerate | 280 (ends 580) |
| R3 micro (success) | 1 | mark-curl / mark-sheet | rotate / translateY | -10° / -1.5 px and back | 280 | standard | 0 |

Reduced motion: every animation off; the still is the static mark. Motion files separate fan strips with a background-coloured stroke (solid surfaces only); the static marks use true masks.
