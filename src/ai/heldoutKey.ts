import type { KeyRow } from './gradedKey';

const PHONE_LAYOUTS = ['phone-clock-safe', 'phone-arch'];
const DESKTOP_LAYOUTS = ['desktop-safe', 'desktop-arch'];

/** D31 held-out prompts: written and keyed before either tier ran on them; no rule was tuned against them. */
export const HELDOUT_KEY: readonly KeyRow[] = [
  { prompt: 'Bachata night this Friday 13 November from 21:30, dark vibe, insta post', expect: { title: ['BACHATA'], format: ['post'], palette: ['night'], date: ['Friday 13 November'], time: ['21:30'] } },
  { prompt: 'Βραδιά σάλσα το Σάββατο, story για Instagram', expect: { title: ['SALSA', 'ΣΑΛΣΑ'], format: ['story'] } },
  { prompt: 'Μαθήματα κιζόμπα για αρχάριους, τετράγωνη αφίσα', expect: { title: ['KIZOMBA', 'ΚΙΖΟΜΠΑ'], format: ['square'] } },
  { prompt: 'Wallpaper for my iPhone with ocean blues, kizomba', expect: { title: ['KIZOMBA'], format: ['phone'], palette: ['sea'], layout: PHONE_LAYOUTS } },
  { prompt: 'Monthly timetable of our tango classes', expect: { title: ['TANGO'], layout: ['list'] } },
  { prompt: 'Flamenco show, Saturday 28 November 20:30, warm golden sunset tones', expect: { title: ['FLAMENCO'], palette: ['golden-horizon'], date: ['Saturday 28 November'], time: ['20:30'] } },
  { prompt: 'Zumba fitness class, modern clean font, square', expect: { title: ['ZUMBA'], fonts: ['modern'], format: ['square'] } },
  { prompt: 'Ταπετσαρία για υπολογιστή με θέμα τάνγκο', expect: { title: ['TANGO', 'ΤΑΝΓΚΟ'], format: ['desktop'], layout: DESKTOP_LAYOUTS } },
  { prompt: 'West coast swing weekend festival, put the photo on the left', expect: { title: ['SWING', 'WEST COAST SWING'], layout: ['picture-left'] } },
  { prompt: 'Ballet recital for kids on Sunday 6 December at 17:00', expect: { title: ['BALLET'], date: ['Sunday 6 December'], time: ['17:00'] } },
  { prompt: 'salsa+bachata party tonight!! pink & romantic', expect: { title: ['SALSA', 'BACHATA', 'SALSA & BACHATA', 'SALSA AND BACHATA'], palette: ['rose'] } },
  { prompt: 'Pilates mat class, beige neutral look, feed post', expect: { title: ['PILATES'], palette: ['sand'], format: ['post'] } },
  { prompt: 'Lindy hop social with the photo underneath the heading', expect: { title: ['LINDY HOP', 'SWING'], layout: ['picture-bottom'] } },
  { prompt: 'Ζουκ πάρτι με σκούρα χρώματα', expect: { title: ['ZOUK', 'ΖΟΥΚ'], palette: ['night'] } },
  { prompt: 'Calendar of all upcoming bachata socials in December, vertical story', expect: { title: ['BACHATA'], layout: ['list'], format: ['story'] } },
  { prompt: 'Homescreen background for a samba fan', expect: { title: ['SAMBA'], format: ['phone'], layout: PHONE_LAYOUTS } },
  { prompt: 'Kizomba intensive with classy refined lettering', expect: { title: ['KIZOMBA'], fonts: ['elegant'] } },
  { prompt: 'Afro house workshop Thursday 19 November 19:00 - 20:30', expect: { title: ['AFRO HOUSE', 'AFRO'], date: ['Thursday 19 November'], time: ['19:00 - 20:30'] } },
  { prompt: 'Big screen background, turquoise seaside, salsa', expect: { title: ['SALSA'], format: ['desktop'], palette: ['sea'], layout: DESKTOP_LAYOUTS } },
  { prompt: 'Πρόγραμμα σεμιναρίων μπατσάτα για τον Νοέμβριο', expect: { title: ['BACHATA', 'ΜΠΑΤΣΑΤΑ'], layout: ['list'] } },
];
