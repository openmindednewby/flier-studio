import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { renderPreviews } from './previews';
import { renderGate } from './renderGate';

const SLOW_PAUSE_MS = 20;
const OLDER_FLIERS = 3;
const NEWER_FLIERS = 1;

const baseView = { selected: 0, select: (): void => undefined, enlarge: (): void => undefined, fonts: { load: (): Promise<unknown> => Promise.resolve() } };

describe('renderPreviews', () => {
  it('with three fliers, hands the main thread back before drawing each one', async () => {
    const docs = kizombaPreset().slice(0, 3);
    let pauses = 0;
    const view = { ...baseView, pause: (): Promise<void> => { pauses += 1; return Promise.resolve(); } };

    await renderPreviews(document.createElement('div'), docs, {}, view);

    expect(pauses).toBe(3);
  });

  it('with zero fliers and a newer render already started, returns null and leaves the grid as it was', async () => {
    const grid = document.createElement('div');
    grid.append(document.createElement('figure'));
    const nextRender = renderGate();
    const stale = { ...baseView, current: nextRender() };
    nextRender();

    const result = await renderPreviews(grid, [], {}, stale);

    expect({ result, figures: grid.querySelectorAll('figure').length }).toEqual({ result: null, figures: 1 });
  });

  it('with a newer render finishing before an older one, leaves the grid showing the newer render', async () => {
    const grid = document.createElement('div');
    const docs = kizombaPreset();
    const nextRender = renderGate();
    const slow = (): Promise<void> => new Promise((resolve) => { setTimeout(resolve, SLOW_PAUSE_MS); });
    const older = { ...baseView, pause: slow, current: nextRender() };
    const newer = { ...baseView, pause: (): Promise<void> => Promise.resolve(), current: nextRender() };

    await Promise.all([renderPreviews(grid, docs.slice(0, OLDER_FLIERS), {}, older), renderPreviews(grid, docs.slice(0, NEWER_FLIERS), {}, newer)]);

    expect(grid.querySelectorAll('figure').length).toBe(NEWER_FLIERS);
  });
});
