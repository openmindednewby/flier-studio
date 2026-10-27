import { kizombaWorkshopDocs, validateFlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { DocPicker, schemaOptions } from './schemaOptions';
import { applyText, blocksToText, textToItems } from './docEdit';

describe('applyText', () => {
  it('with the text of a preset flier, rebuilds an equal, valid doc', () => {
    const doc = kizombaWorkshopDocs[3];

    const rebuilt = applyText(doc, blocksToText(doc));

    expect(rebuilt).toEqual(doc);
    expect(validateFlierDoc(rebuilt).ok).toBe(true);
  });

  it('with an emptied footer, drops the field instead of sending an empty string', () => {
    const doc = kizombaWorkshopDocs[0];

    const rebuilt = applyText(doc, { ...blocksToText(doc), footer: '  ' });

    expect('footer' in rebuilt.blocks).toBe(false);
  });
});

describe('textToItems', () => {
  it('with a row "date | price | label = time", returns one list item', () => {
    const text = 'Sat 5 Dec | 10€ | Level 1 = 20:00';

    const items = textToItems(text);

    expect(items).toEqual([{ date: 'Sat 5 Dec', price: '10€', schedule: [{ label: 'Level 1', time: '20:00' }] }]);
  });
});

describe('schemaOptions', () => {
  it('with the format picker, lists the five formats from the schema', () => {
    const formats = schemaOptions(DocPicker.Format);

    expect(formats).toEqual(['story', 'post', 'square', 'phone', 'desktop']);
  });
});
