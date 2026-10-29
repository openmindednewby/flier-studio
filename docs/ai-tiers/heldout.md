# FLIER-2 D31 "AI tiers: fair re-test on 20 held-out prompts": prompts and grading key

Written and committed 2026-10-29 before keyword or embedding ran on any of them. After this commit no keyword rule (`src/llm/promptFallback.ts`) or embedding example/threshold (`src/ai/embedTier.ts`) changes. Source of truth: `src/ai/heldoutKey.ts`. A blank field is not graded; a prompt is right only when every keyed field matches one accepted value. Greek prompts accept the English or Greek title. Phone layouts = phone-clock-safe / phone-arch; desktop layouts = desktop-safe / desktop-arch.

| # | Prompt | Key |
|---|---|---|
| 1 | Bachata night this Friday 13 November from 21:30, dark vibe, insta post | title: ['BACHATA'], format: ['post'], palette: ['night'], date: ['Friday 13 November'], time: ['21:30'] |
| 2 | Βραδιά σάλσα το Σάββατο, story για Instagram | title: ['SALSA', 'ΣΑΛΣΑ'], format: ['story'] |
| 3 | Μαθήματα κιζόμπα για αρχάριους, τετράγωνη αφίσα | title: ['KIZOMBA', 'ΚΙΖΟΜΠΑ'], format: ['square'] |
| 4 | Wallpaper for my iPhone with ocean blues, kizomba | title: ['KIZOMBA'], format: ['phone'], palette: ['sea'], layout: phone layouts |
| 5 | Monthly timetable of our tango classes | title: ['TANGO'], layout: ['list'] |
| 6 | Flamenco show, Saturday 28 November 20:30, warm golden sunset tones | title: ['FLAMENCO'], palette: ['golden-horizon'], date: ['Saturday 28 November'], time: ['20:30'] |
| 7 | Zumba fitness class, modern clean font, square | title: ['ZUMBA'], fonts: ['modern'], format: ['square'] |
| 8 | Ταπετσαρία για υπολογιστή με θέμα τάνγκο | title: ['TANGO', 'ΤΑΝΓΚΟ'], format: ['desktop'], layout: desktop layouts |
| 9 | West coast swing weekend festival, put the photo on the left | title: ['SWING', 'WEST COAST SWING'], layout: ['picture-left'] |
| 10 | Ballet recital for kids on Sunday 6 December at 17:00 | title: ['BALLET'], date: ['Sunday 6 December'], time: ['17:00'] |
| 11 | salsa+bachata party tonight!! pink & romantic | title: ['SALSA', 'BACHATA', 'SALSA & BACHATA', 'SALSA AND BACHATA'], palette: ['rose'] |
| 12 | Pilates mat class, beige neutral look, feed post | title: ['PILATES'], palette: ['sand'], format: ['post'] |
| 13 | Lindy hop social with the photo underneath the heading | title: ['LINDY HOP', 'SWING'], layout: ['picture-bottom'] |
| 14 | Ζουκ πάρτι με σκούρα χρώματα | title: ['ZOUK', 'ΖΟΥΚ'], palette: ['night'] |
| 15 | Calendar of all upcoming bachata socials in December, vertical story | title: ['BACHATA'], layout: ['list'], format: ['story'] |
| 16 | Homescreen background for a samba fan | title: ['SAMBA'], format: ['phone'], layout: phone layouts |
| 17 | Kizomba intensive with classy refined lettering | title: ['KIZOMBA'], fonts: ['elegant'] |
| 18 | Afro house workshop Thursday 19 November 19:00 - 20:30 | title: ['AFRO HOUSE', 'AFRO'], date: ['Thursday 19 November'], time: ['19:00 - 20:30'] |
| 19 | Big screen background, turquoise seaside, salsa | title: ['SALSA'], format: ['desktop'], palette: ['sea'], layout: desktop layouts |
| 20 | Πρόγραμμα σεμιναρίων μπατσάτα για τον Νοέμβριο | title: ['BACHATA', 'ΜΠΑΤΣΑΤΑ'], layout: ['list'] |
