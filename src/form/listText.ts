import type { ListItem, ScheduleRow } from '@dloizides/poster-render';

const NL = '\n';
const ROW_SEP = ' ; ';
const TIME_SEP = '=';

export interface ListColumns {
  itemDates: string;
  itemPasses: string;
  itemTimes: string;
}

const timesToText = (rows: readonly ScheduleRow[]): string => rows.map((s) => `${s.label} ${TIME_SEP} ${s.time}`).join(ROW_SEP);

function textToTimes(line: string): ScheduleRow[] {
  return line.split(';').map((r) => r.trim()).filter((r) => r !== '').map((r) => {
    const at = r.indexOf(TIME_SEP);
    return at === -1 ? { label: r, time: '' } : { label: r.slice(0, at).trim(), time: r.slice(at + 1).trim() };
  });
}

function rowsOf(text: string): string[] {
  const all = text.split(NL).map((l) => l.trim());
  while (all.length > 0 && all[all.length - 1] === '') all.pop();
  return all;
}

/** The list rows as three texts: line N of dates, passes and times is row N. */
export function itemsToColumns(items: readonly ListItem[] | undefined): ListColumns {
  const list = items ?? [];
  return {
    itemDates: list.map((i) => i.date).join(NL),
    itemPasses: list.map((i) => i.price ?? '').join(NL),
    itemTimes: list.map((i) => timesToText(i.schedule)).join(NL),
  };
}

/** Rebuilds the list rows from the three texts; the dates decide how many rows there are. */
export function columnsToItems(columns: ListColumns): ListItem[] | undefined {
  const dates = rowsOf(columns.itemDates);
  const passes = rowsOf(columns.itemPasses);
  const times = rowsOf(columns.itemTimes);
  const items = dates.map((date, n): ListItem => {
    const item: ListItem = { date, schedule: textToTimes(times[n] ?? '') };
    const price = passes[n] ?? '';
    if (price !== '') item.price = price;
    return item;
  });
  return items.length > 0 ? items : undefined;
}
