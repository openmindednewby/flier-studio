import { BadgeSpot } from './BadgeSpot';

export interface Box { l: number; t: number; r: number; b: number }

export const BADGE_GAP_PX = 4;
export const BADGE_EDGE_PX = 2;
const GAP = BADGE_GAP_PX;
const EDGE = BADGE_EDGE_PX;

function candidates(mark: Box, w: number, h: number): [BadgeSpot, Box][] {
  const mid = (mark.t + mark.b) / 2 - h / 2;
  const left = mark.l - EDGE;
  return [
    [BadgeSpot.Left, { l: mark.l - GAP - w, t: mid, r: mark.l - GAP, b: mid + h }],
    [BadgeSpot.Right, { l: mark.r + GAP, t: mid, r: mark.r + GAP + w, b: mid + h }],
    [BadgeSpot.Below, { l: left, t: mark.b + EDGE, r: left + w, b: mark.b + EDGE + h }],
    [BadgeSpot.Above, { l: left, t: mark.t - EDGE - h, r: left + w, b: mark.t - EDGE }],
  ];
}

const within = (a: Box, outer: Box): boolean => a.l >= outer.l && a.r <= outer.r && a.t >= outer.t && a.b <= outer.b;
const meets = (a: Box, o: Box): boolean => a.l < o.r && a.r > o.l && a.t < o.b && a.b > o.t;
const withIcons = (o: Box): Box => ({ l: o.l - (o.b - o.t), t: o.t, r: o.r + (o.b - o.t), b: o.b });

/** Where a mark's badge sits: left of its line when there is room, else the first spot over no other line or icon. */
export function badgeSpot(mark: Box, badge: { w: number; h: number }, area: Box, others: readonly Box[]): BadgeSpot {
  const lines = others.map(withIcons);
  const onFlier = candidates(mark, badge.w, badge.h).filter(([, box]) => within(box, area));
  const free = onFlier.find(([spot, box]) => spot === BadgeSpot.Left || !lines.some((o) => meets(box, o)));
  return (free ?? onFlier[0])?.[0] ?? BadgeSpot.Left;
}
