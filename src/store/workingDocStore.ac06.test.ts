import { kizombaWorkshopDocs, type FlierDoc } from '@dloizides/poster-render';
import { MemoryKeyValueStore } from '@dloizides/save-state';
import { describe, expect, it } from 'vitest';
import { WorkingDocStore } from './workingDocStore';

describe('WorkingDocStore', () => {
  it('with edited docs autosaved, reads them back from a new store (reload without Save)', () => {
    const kv = new MemoryKeyValueStore();
    const edited: FlierDoc[] = [{ ...kizombaWorkshopDocs[0], blocks: { ...kizombaWorkshopDocs[0].blocks, title: 'SALSA' }, picture: { anchor: 'bottom' as never, scale: 1, imageId: 'picture-123' } }];
    new WorkingDocStore(kv).save(edited);

    const restored = new WorkingDocStore(kv).load();

    expect(restored?.[0].blocks.title).toBe('SALSA');
    expect(restored?.[0].picture?.imageId).toBe('picture-123');
  });

  it('with nothing autosaved, returns null', () => {
    const kv = new MemoryKeyValueStore();

    const restored = new WorkingDocStore(kv).load();

    expect(restored).toBeNull();
  });

  it('with a stored doc that fails the schema, returns null', () => {
    const kv = new MemoryKeyValueStore();
    new WorkingDocStore(kv).save([{ ...kizombaWorkshopDocs[0], layout: 'zigzag' as never }]);

    const restored = new WorkingDocStore(kv).load();

    expect(restored).toBeNull();
  });
});
