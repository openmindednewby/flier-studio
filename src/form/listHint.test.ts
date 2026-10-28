import { LayoutId, kizombaWorkshopDocs } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { FM } from '../i18n/fm';
import { listHint } from './listHint';

describe('listHint', () => {
  it('with the list layout and no items, points at the List rows field', () => {
    const doc = { ...kizombaWorkshopDocs[0], layout: LayoutId.List, items: [] };

    const hint = listHint(doc);

    expect(hint).toBe(FM('form.listEmpty', FM('form.itemsShort')));
  });

  it('with the list layout and one item, returns null', () => {
    const doc = { ...kizombaWorkshopDocs[0], layout: LayoutId.List, items: [{ date: 'Sat 14', schedule: [] }] };

    const hint = listHint(doc);

    expect(hint).toBeNull();
  });

  it('with a picture layout and no items, returns null', () => {
    const doc = { ...kizombaWorkshopDocs[0], layout: LayoutId.PictureRight, items: [] };

    const hint = listHint(doc);

    expect(hint).toBeNull();
  });
});
