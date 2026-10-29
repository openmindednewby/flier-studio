# FLIER-2 AC-42 "Pick the lightest that works": three AI tiers on the 20 prompts

Headless Chromium (Playwright) on the dev PC, not the owner's GPU. AC-43 limits: download <= 150 MB, p50 < 5 s, main-thread task <= 200 ms, >= 18/20.


## Read this before the table

- Not the owner's GPU: headless Chromium on the dev PC (24 cores), WebGPU not available, so tier 1 ran with `n_gpu_layers: 0` (CPU, multi-thread wasm). On a WebGPU machine tier 1 asks for `n_gpu_layers: 99`; that path is not measured here.
- Tier 1 = `unsloth/SmolLM2-135M-Instruct-GGUF`; `@dloizides/llm-run` 0.3.0 picked Q4_K_M (100.6 MB) under the 145 MB cap; GBNF grammar from `src/ai/settingsGrammar.ts`, temperature 0, one worked example.
- Tier 2 = `second-state/All-MiniLM-L6-v2-Embedding-GGUF` Q8_0 in wllama (mean pooling), labelled examples in `src/ai/embedTier.ts`, threshold 0.5 picked before the run, not tuned on these prompts; date/time come from the same regex as tier 3.
- Tier 3 bias: the keyword fallback was written against these same 20 prompts, so its 18/20 is an upper bound, not a fair test of unseen prompts.
- The "mobile" project is Playwright's Galaxy S5 (360x640 device); the measure page reported a 387x688 layout viewport, so its wide JSON output zooms the page out. The page is a dev harness, not a user screen.
- Load s of tier 1 includes the download (fresh browser profile each project).
- Rerun: `AI_TIERS=1 npx playwright test e2e/aiTiers.measure.spec.ts --workers=1`, then `npx vite-node scripts/aiTiersReport.ts`.
- Verdict per AC-43: no AI tier beats the keyword fallback on these 20; nothing ships until the owner reads this table.

## mobile 387x688 (WebGPU false, cross-origin isolated true, 24 cores, 2026-10-29T10:15:36.770Z)

| Tier | Download MB | Load s | p50 s/prompt | Longest main-thread task ms | Graded | n_gpu_layers | AC-43 |
|---|---|---|---|---|---|---|---|
| keyword | 0 | 0.0 | 0.00 | 0 | 18/20 | - | pass |
| embed | 23.8 | 10.2 | 0.03 | 0 | 15/20 | - | fail |
| llm | 100.6 | 118.0 | 1.81 | 0 | 2/20 | 0 | fail |

## desktop 1280x800 (WebGPU false, cross-origin isolated true, 24 cores, 2026-10-29T10:17:19.861Z)

| Tier | Download MB | Load s | p50 s/prompt | Longest main-thread task ms | Graded | n_gpu_layers | AC-43 |
|---|---|---|---|---|---|---|---|
| keyword | 0 | 0.0 | 0.00 | 0 | 18/20 | - | pass |
| embed | 23.8 | 16.7 | 0.02 | 0 | 15/20 | - | fail |
| llm | 100.6 | 40.7 | 1.85 | 0 | 2/20 | 0 | fail |

## Graded key (human-picked; a blank field is not graded) and each tier's grade

| # | Prompt | format | layout | palette | fonts | title | date | time | keyword | embed | llm |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kizomba workshop on Saturday 31 October, Level 1 20:00 - 21:00, party pass 20€ |  | picture-right / picture-left / picture-bottom / arch |  |  | KIZOMBA | Saturday 31 October | 20:00 - 21:00 | right | right | wrong (time) |
| 2 | Salsa social night, Instagram post, dark colours | post |  | night |  | SALSA |  |  | right | right | wrong (title, format, palette) |
| 3 | Bachata beginners class every Tuesday at 19:30, story | story |  |  |  | BACHATA |  | 19:30 | right | right | right |
| 4 | Upcoming kizomba workshops list for November |  | list |  |  | KIZOMBA |  |  | right | wrong (layout) | wrong (layout) |
| 5 | Desktop wallpaper with a night kizomba theme | desktop | desktop-safe / desktop-arch | night |  | KIZOMBA |  |  | right | wrong (format, layout) | wrong (title, palette) |
| 6 | Phone wallpaper, rose colours, tango | phone | phone-clock-safe / phone-arch | rose |  | TANGO |  |  | right | right | wrong (title, format, palette, layout) |
| 7 | Square flier for a zouk party on Friday 6 November | square |  |  |  | ZOUK | Friday 6 November |  | right | right | wrong (title) |
| 8 | Summer beach salsa party, sea colours, post | post |  | sea |  | SALSA |  |  | right | right | wrong (palette) |
| 9 | Valentine bachata night with a pink palette |  |  | rose |  | BACHATA |  |  | wrong (palette) | right | wrong (title, palette) |
| 10 | Swing dance taster class on Sunday 15 November at 18:00 |  |  |  |  | SWING | Sunday 15 November | 18:00 | right | right | wrong (title) |
| 11 | List of upcoming salsa and bachata workshops, Instagram post | post | list |  |  | SALSA / BACHATA / SALSA & BACHATA / SALSA AND BACHATA |  |  | right | wrong (layout) | wrong (layout) |
| 12 | Kizomba bootcamp weekend, elegant fonts, story | story |  |  | elegant | KIZOMBA |  |  | wrong (fonts) | right | wrong (format, fonts) |
| 13 | Tango milonga on Saturday 21 November 21:00 - 01:00 |  |  |  |  | TANGO / MILONGA | Saturday 21 November | 21:00 - 01:00 | right | right | wrong (title, date, time) |
| 14 | Lock screen wallpaper for kizomba lovers | phone | phone-clock-safe / phone-arch |  |  | KIZOMBA |  |  | right | right | wrong (title, format, layout) |
| 15 | Hip hop open class for teens, square | square |  |  |  | HIP HOP |  |  | right | right | wrong (title) |
| 16 | Yoga morning session on Sunday 22 November at 09:00 |  |  |  |  | YOGA | Sunday 22 November | 09:00 | right | right | right |
| 17 | Bachata sensual masterclass with the picture on the left |  | picture-left |  |  | BACHATA |  |  | right | right | wrong (layout) |
| 18 | Salsa workshop with text on top and the picture at the bottom |  | picture-bottom |  |  | SALSA |  |  | right | right | wrong (layout) |
| 19 | Laptop wallpaper, calm sand colours | desktop | desktop-safe / desktop-arch | sand |  |  |  |  | right | wrong (format, layout) | wrong (format, layout) |
| 20 | Upcoming zouk socials schedule, story | story | list |  |  | ZOUK |  |  | right | wrong (layout) | wrong (title, layout) |
