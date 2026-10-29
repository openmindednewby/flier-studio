import type { AiSettings } from './aiSettings';

export type KeyFields = Partial<Record<keyof AiSettings, readonly string[]>>;

export interface KeyRow {
  readonly prompt: string;
  readonly expect: KeyFields;
}

const PHONE_LAYOUTS = ['phone-clock-safe', 'phone-arch'];
const DESKTOP_LAYOUTS = ['desktop-safe', 'desktop-arch'];
const PICTURE_LAYOUTS = ['picture-right', 'picture-left', 'picture-bottom', 'arch'];

/** The human-picked answer for each AC-07 prompt; a field not listed is not graded (the prompt does not ask for it). */
export const GRADED_KEY: readonly KeyRow[] = [
  { prompt: 'Kizomba workshop on Saturday 31 October, Level 1 20:00 - 21:00, party pass 20€', expect: { title: ['KIZOMBA'], layout: PICTURE_LAYOUTS, date: ['Saturday 31 October'], time: ['20:00 - 21:00'] } },
  { prompt: 'Salsa social night, Instagram post, dark colours', expect: { title: ['SALSA'], format: ['post'], palette: ['night'] } },
  { prompt: 'Bachata beginners class every Tuesday at 19:30, story', expect: { title: ['BACHATA'], format: ['story'], time: ['19:30'] } },
  { prompt: 'Upcoming kizomba workshops list for November', expect: { title: ['KIZOMBA'], layout: ['list'] } },
  { prompt: 'Desktop wallpaper with a night kizomba theme', expect: { title: ['KIZOMBA'], format: ['desktop'], palette: ['night'], layout: DESKTOP_LAYOUTS } },
  { prompt: 'Phone wallpaper, rose colours, tango', expect: { title: ['TANGO'], format: ['phone'], palette: ['rose'], layout: PHONE_LAYOUTS } },
  { prompt: 'Square flier for a zouk party on Friday 6 November', expect: { title: ['ZOUK'], format: ['square'], date: ['Friday 6 November'] } },
  { prompt: 'Summer beach salsa party, sea colours, post', expect: { title: ['SALSA'], format: ['post'], palette: ['sea'] } },
  { prompt: 'Valentine bachata night with a pink palette', expect: { title: ['BACHATA'], palette: ['rose'] } },
  { prompt: 'Swing dance taster class on Sunday 15 November at 18:00', expect: { title: ['SWING'], date: ['Sunday 15 November'], time: ['18:00'] } },
  { prompt: 'List of upcoming salsa and bachata workshops, Instagram post', expect: { title: ['SALSA', 'BACHATA', 'SALSA & BACHATA', 'SALSA AND BACHATA'], format: ['post'], layout: ['list'] } },
  { prompt: 'Kizomba bootcamp weekend, elegant fonts, story', expect: { title: ['KIZOMBA'], format: ['story'], fonts: ['elegant'] } },
  { prompt: 'Tango milonga on Saturday 21 November 21:00 - 01:00', expect: { title: ['TANGO', 'MILONGA'], date: ['Saturday 21 November'], time: ['21:00 - 01:00'] } },
  { prompt: 'Lock screen wallpaper for kizomba lovers', expect: { title: ['KIZOMBA'], format: ['phone'], layout: PHONE_LAYOUTS } },
  { prompt: 'Hip hop open class for teens, square', expect: { title: ['HIP HOP'], format: ['square'] } },
  { prompt: 'Yoga morning session on Sunday 22 November at 09:00', expect: { title: ['YOGA'], date: ['Sunday 22 November'], time: ['09:00'] } },
  { prompt: 'Bachata sensual masterclass with the picture on the left', expect: { title: ['BACHATA'], layout: ['picture-left'] } },
  { prompt: 'Salsa workshop with text on top and the picture at the bottom', expect: { title: ['SALSA'], layout: ['picture-bottom'] } },
  { prompt: 'Laptop wallpaper, calm sand colours', expect: { format: ['desktop'], palette: ['sand'], layout: DESKTOP_LAYOUTS } },
  { prompt: 'Upcoming zouk socials schedule, story', expect: { title: ['ZOUK'], format: ['story'], layout: ['list'] } },
];

export interface Grade {
  right: boolean;
  misses: string[];
}

const norm = (v: string): string => v.trim().toLowerCase();

/** A prompt is right only when every keyed field holds one of its accepted values. */
export function gradeSettings(key: KeyFields, got: AiSettings): Grade {
  const misses = Object.entries(key)
    .filter(([field, accepted]) => !(accepted ?? []).map(norm).includes(norm(String(got[field as keyof AiSettings]))))
    .map(([field]) => field);
  return { right: misses.length === 0, misses };
}
