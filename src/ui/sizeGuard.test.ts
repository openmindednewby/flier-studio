import type { FlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { neverShrinks } from './sizeGuard';

const before = { format: 'a' } as unknown as FlierDoc;
const after = { format: 'b' } as unknown as FlierDoc;

describe('neverShrinks', () => {
  it('with a step that draws 52 px as 46 px, returns false', () => {
    const measure = (d: FlierDoc): number => (d === before ? 52 : 46);

    const ok = neverShrinks(before, after, ['title'], measure);

    expect(ok).toBe(false);
  });

  it('with a step that draws 52 px as 57 px, returns true', () => {
    const measure = (d: FlierDoc): number => (d === before ? 52 : 57);

    const ok = neverShrinks(before, after, ['title'], measure);

    expect(ok).toBe(true);
  });

  it('with lines not drawn now, returns true', () => {
    const measure = (d: FlierDoc): number => (d === before ? 0 : 10);

    const ok = neverShrinks(before, after, ['title'], measure);

    expect(ok).toBe(true);
  });
});
