import { describe, expect, it } from 'vitest';
import { BadgeSpot } from './BadgeSpot';
import { badgeSpot } from './badgePlacement';

const BADGE = { w: 22, h: 22 };
const TRIM = { l: 0, t: 0, r: 360, b: 600 };

describe('badgeSpot', () => {
  it('with room left of the mark, keeps the badge on the left', () => {
    const mark = { l: 100, t: 200, r: 260, b: 220 };

    const spot = badgeSpot(mark, BADGE, TRIM, []);

    expect(spot).toBe(BadgeSpot.Left);
  });

  it('with a full-width mark under a line, puts the badge below rather than over the line above', () => {
    const mark = { l: 10, t: 100, r: 350, b: 120 };
    const lineAbove = { l: 40, t: 70, r: 320, b: 96 };

    const spot = badgeSpot(mark, BADGE, TRIM, [lineAbove]);

    expect(spot).toBe(BadgeSpot.Below);
  });

  it('with an icon left of the short line below, keeps the badge off the icon and raises it', () => {
    const mark = { l: 10, t: 100, r: 350, b: 120 };
    const lineBelow = { l: 40, t: 126, r: 200, b: 146 };

    const spot = badgeSpot(mark, BADGE, TRIM, [lineBelow]);

    expect(spot).toBe(BadgeSpot.Above);
  });

  it('with a match on the first line of the flier, never raises the badge off the flier', () => {
    const mark = { l: 10, t: 6, r: 350, b: 26 };
    const lineBelow = { l: 40, t: 60, r: 320, b: 80 };

    const spot = badgeSpot(mark, BADGE, TRIM, [lineBelow]);

    expect(spot).toBe(BadgeSpot.Below);
  });

  it('with a short first line and room on its right, puts the badge right of the mark', () => {
    const mark = { l: 10, t: 6, r: 200, b: 26 };
    const lineBelow = { l: 0, t: 28, r: 360, b: 48 };

    const spot = badgeSpot(mark, BADGE, TRIM, [lineBelow]);

    expect(spot).toBe(BadgeSpot.Right);
  });
});
