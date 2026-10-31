import type { ListItem } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { columnsToItems, itemsToColumns } from './listText';

const ownerRows: ListItem[] = [
  { date: 'Sat 31 Oct', price: '20€', schedule: [{ label: 'Beginners', time: '20:00 - 21:00' }, { label: 'Intermediates', time: '21:00 - 22:00' }] },
  { date: 'Sat 7 Nov', price: '15€', schedule: [{ label: 'Beginners', time: '20:00 - 21:00' }] },
  { date: 'Sun 29 Nov', price: '10€', schedule: [{ label: 'Beginners', time: '17:00-18:00' }, { label: 'Intermediates', time: '18:00-19:00' }] },
];

describe('itemsToColumns', () => {
  it('with the owner three rows, puts each row on the same line of dates, passes and times', () => {
    const rows = ownerRows;

    const columns = itemsToColumns(rows);

    expect(columns).toEqual({
      itemDates: 'Sat 31 Oct\nSat 7 Nov\nSun 29 Nov',
      itemPasses: '20€\n15€\n10€',
      itemTimes: 'Beginners = 20:00 - 21:00 ; Intermediates = 21:00 - 22:00\nBeginners = 20:00 - 21:00\nBeginners = 17:00-18:00 ; Intermediates = 18:00-19:00',
    });
  });
});

describe('columnsToItems', () => {
  it('with the owner three rows written out, rebuilds the same rows', () => {
    const columns = itemsToColumns(ownerRows);

    const items = columnsToItems(columns);

    expect(items).toEqual(ownerRows);
  });

  it('with a row that has no pass and no times, keeps the next row on its own line', () => {
    const rows: ListItem[] = [{ date: 'Fri 1', schedule: [] }, { date: 'Sat 2', price: '5€', schedule: [{ label: 'All', time: '20:00' }] }];

    const items = columnsToItems(itemsToColumns(rows));

    expect(items).toEqual(rows);
  });

  it('with empty dates, returns no rows', () => {
    const columns = { itemDates: ' ', itemPasses: '20€', itemTimes: 'All = 20:00' };

    const items = columnsToItems(columns);

    expect(items).toBeUndefined();
  });
});
