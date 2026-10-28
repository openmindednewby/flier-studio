# Critique: Flier Studio landing card refit (2026-10-28, round 1, Tier 1 style-only)

LOGO-1 "A logo pipeline that makes beautiful, animatable marks". Judged from pixels only: before/after-360.png,
before/after-1280.png, before/after.json, sibling covers `dloizidesLandingPage/images/pathfinder.png` and
`ui-showcase.png`, approved marks `../sheet-1280.png`, taste ledger `docs/design/taste-ledger.md`.

## Hard fails (checked first)
| Gate | Result |
|---|---|
| Lost item | 3/3 on the picture at both widths: mark, wordmark "Flier Studio", tagline "Event fliers and wallpapers from one form". Before lost the mark's left half, the "F" and the tagline's first word at 360, and half the mark at 1280. |
| Form row alignment | N/A, no form rows. |
| Pair parity | Pass. Same route, device, anchor (card scrollIntoView center), card box, image box and crop in both JSON files; only the PNG differs. |

## Score (logo card: rows 3 and 8 scored on the /logo-pipeline rubric)
| # | Criterion | Score | Evidence |
|---|---|---|---|
| 1 | Focal point / purpose | 5 | The mark is the first read; name and promise follow in order. |
| 2 | Portability | 4 | The curling sheet is product-specific; the warm paper + serif could be any print brand, the mark carries it. |
| 3 | Craft / fidelity (rubric) | 4 | Matches the approved stacked lockup: mark left edge on the wordmark's left edge, Fraunces weight contrast kept, one ink. Tagline is centred while the lockup is left-aligned: two alignment axes. |
| 4 | Visual language | 4 | One ink on the warm surface, no new colour, clear space well beyond 1c. |
| 5 | Taste ledger | 5 | Uses mark F "In flight", the owner's D4/D5 pick; nothing rejected reappears. |
| 6 | AI-default tells | 5 | None. |
| 7 | 360 and 1280 | 5 | Whole block inside the visible crop at both; tagline ends ~40 px (image px) above the white info header at 1280, ~50 px at 360. Top/bottom margins within 5 px of each other at both widths. |
| 8 | Appropriateness (rubric) | 4 | Sibling covers are dense app screenshots with a ~13 px title; this card shows the brand at ~27 px cap height. It reads louder but calm, and it is a different card type, not a scale mismatch. |

Mean 4.5, lowest 4. **PASS.**

## Top fixes (optional, none blocks)
1. Set the tagline flush-left on the wordmark's left edge (source x ~391; it then spans ~391..993, inside the 230..1050 safe area) so the block has one alignment axis, as in the approved stacked lockup.
2. The circular thumb reuses the PNG: the tagline renders ~2 px tall there and reads as a grey line. Log a follow-up for a mark-only thumb asset (the tagline stays in the cover; no item is removed).

NOT COVERED: dark mode, the live deployed page (captures used page.route), other widths (320 handled only by the safe-area maths), motion.
