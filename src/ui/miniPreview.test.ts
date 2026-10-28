import { describe, expect, it, vi } from 'vitest';
import { createMiniPreview, thumbSize } from './miniPreview';

describe('thumbSize', () => {
  it('with a 1080x1350 post, fits it 54 wide and keeps the ratio', () => {
    const source = { width: 1080, height: 1350 };

    const size = thumbSize(source);

    expect(size).toEqual({ width: 54, height: 68 });
  });

  it('with a 1080x1920 story, fits it 70 high and keeps the ratio', () => {
    const source = { width: 1080, height: 1920 };

    const size = thumbSize(source);

    expect(size).toEqual({ width: 39, height: 70 });
  });

  it('with an empty source, returns the whole box', () => {
    const source = { width: 0, height: 0 };

    const size = thumbSize(source, { width: 54, height: 70 });

    expect(size).toEqual({ width: 54, height: 70 });
  });
});

describe('createMiniPreview', () => {
  it('with flier 2 of 4 selected, names the position and the see-all count', () => {
    const mini = createMiniPreview({ seeAll: () => undefined });

    mini.update(undefined, 1, 4);

    expect(mini.bar.querySelector('[data-testid="mini-position"]')?.textContent).toBe('Flier 2 of 4');
    expect(mini.bar.querySelector('[data-testid="mini-see-all"]')?.textContent).toBe('See all 4');
  });

  it('with a tap on see all, calls the see-all action', () => {
    const seeAll = vi.fn();
    const mini = createMiniPreview({ seeAll });
    mini.update(undefined, 0, 4);

    mini.bar.querySelector<HTMLButtonElement>('[data-testid="mini-see-all"]')?.click();

    expect(seeAll).toHaveBeenCalledTimes(1);
  });

  it('with a 1080x1920 flier canvas, sizes the thumbnail to 39x70', () => {
    const mini = createMiniPreview({ seeAll: () => undefined });
    const source = Object.assign(document.createElement('canvas'), { width: 1080, height: 1920 });

    mini.update(source, 0, 1);

    const thumb = mini.bar.querySelector<HTMLCanvasElement>('[data-testid="mini-open"] canvas');
    expect([thumb?.style.width, thumb?.style.height]).toEqual(['39px', '70px']);
  });
});
