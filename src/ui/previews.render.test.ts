import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { renderPreviews } from './previews';

describe('renderPreviews', () => {
  it('with three fliers, hands the main thread back before drawing each one', async () => {
    const docs = kizombaPreset().slice(0, 3);
    let pauses = 0;
    const view = { selected: 0, select: (): void => undefined, enlarge: (): void => undefined, fonts: { load: (): Promise<unknown> => Promise.resolve() }, pause: (): Promise<void> => { pauses += 1; return Promise.resolve(); } };

    await renderPreviews(document.createElement('div'), docs, {}, view);

    expect(pauses).toBe(3);
  });
});
