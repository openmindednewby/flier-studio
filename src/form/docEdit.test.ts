import { kizombaWorkshopDocs, validateFlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { DocPicker, schemaOptions } from './schemaOptions';
import { applyText, blocksToText } from './docEdit';

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

  it('with the owner three list rows, rebuilds them unchanged through the three list fields', () => {
    const doc = { ...kizombaWorkshopDocs[0], items: [
      { date: 'Sat 31 Oct', price: '20€', schedule: [{ label: 'Beginners', time: '20:00 - 21:00' }] },
      { date: 'Sat 7 Nov', price: '15€', schedule: [{ label: 'Beginners', time: '20:00 - 21:00' }] },
      { date: 'Sun 29 Nov', price: '10€', schedule: [{ label: 'Beginners', time: '17:00-18:00' }, { label: 'Intermediates', time: '18:00-19:00' }] },
    ] };

    const rebuilt = applyText(doc, blocksToText(doc));

    expect(rebuilt.items).toEqual(doc.items);
  });
});

describe('schemaOptions', () => {
  it('with the format picker, lists the five formats from the schema', () => {
    const formats = schemaOptions(DocPicker.Format);

    expect(formats).toEqual(['story', 'post', 'square', 'phone', 'desktop']);
  });
});
