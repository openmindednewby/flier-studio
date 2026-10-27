import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { ImageStore } from './imageStore';

describe('ImageStore', () => {
  it('with an uploaded picture, reads it back from a new connection (reload)', async () => {
    await new ImageStore('t-reload').put('picture-1', new Blob(['abc'], { type: 'image/png' }));

    const blob = await new ImageStore('t-reload').get('picture-1');

    expect(blob?.size).toBe(3);
  });

  it('with a deleted picture, returns undefined and drops it from the list', async () => {
    const store = new ImageStore('t-delete');
    await store.put('logo-1', new Blob(['x']));

    await store.remove('logo-1');

    expect(await store.get('logo-1')).toBeUndefined();
    expect(await store.ids()).toEqual([]);
  });
});
