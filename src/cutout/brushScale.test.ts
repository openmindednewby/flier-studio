import { describe, expect, it } from 'vitest';
import { brushRadiusPx, nextZoom } from './brushScale';

describe('brushRadiusPx', () => {
  it('with a 3896 px photo shown 974 px wide, scales 2 screen px to 8 mask px', () => {
    const radius = brushRadiusPx(2, 3896, 974);

    expect(radius).toBe(8);
  });

  it('with a 1 px brush on a photo shown at 4x, never goes below 4 mask px', () => {
    const radius = brushRadiusPx(1, 3896, 2640);

    expect(radius).toBe(4);
  });

  it('with a canvas not laid out yet (0 px wide), stays finite', () => {
    const radius = brushRadiusPx(16, 600, 0);

    expect(radius).toBe(9600);
  });
});

describe('nextZoom', () => {
  it('from 1x one step in, returns 2x', () => {
    const zoom = nextZoom(1, 1);

    expect(zoom).toBe(2);
  });

  it('at 4x one step in, stays at 4x', () => {
    const zoom = nextZoom(4, 1);

    expect(zoom).toBe(4);
  });

  it('at 1x one step out, stays at 1x', () => {
    const zoom = nextZoom(1, -1);

    expect(zoom).toBe(1);
  });
});
