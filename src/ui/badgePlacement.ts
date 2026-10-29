import { BadgeSpot } from './BadgeSpot';

export interface Box { l: number; t: number; r: number; b: number }

export const BADGE_GAP_PX = 4;
export const BADGE_EDGE_PX = 2;

function candidates(mark: Box, w: number, h: number): [BadgeSpot, Box][] {
  const mid = (mark.t + mark.b) / 2 - h / 2;
  const left = mark.l - BADGE_EDGE_PX;
  return [
    [BadgeSpot.Left, { l: mark.l - BADGE_GAP_PX - w, t: mid, r: mark.l - BADGE_GAP_PX, b: mid + h }],
    [BadgeSpot.Right, { l: mark.r + BADGE_GAP_PX, t: mid, r: mark.r + BADGE_GAP_PX + w, b: mid + h }],
    [BadgeSpot.Below, { l: left, t: mark.b + BADGE_EDGE_PX, r: left + w, b: mark.b + BADGE_EDGE_PX + h }],
    [BadgeSpot.Above, { l: left, t: mark.t - BADGE_EDGE_PX - h, r: left + w, b: mark.t - BADGE_EDGE_PX }],
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
