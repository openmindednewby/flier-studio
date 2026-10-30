import { sectionOrderOf } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { moveSection, resetSections } from './sectionOrder';
import { TextRole } from './TextRole';
import { TEXT_ROLES, rolesInFlierOrder } from './textRoles';

describe('moveSection', () => {
  it('with the last block moved up, draws it one place higher', () => {
    const doc = kizombaPreset()[0];
    const before = sectionOrderOf(doc);
    const last = before[before.length - 1];

    const moved = moveSection(doc, last, -1);

    expect(sectionOrderOf(moved).indexOf(last)).toBe(before.length - 2);
  });

  it('with the first block moved up, returns the same doc', () => {
    const doc = kizombaPreset()[0];
    const first = sectionOrderOf(doc)[0];

    const moved = moveSection(doc, first, -1);

    expect(moved).toBe(doc);
  });
});

describe('resetSections', () => {
  it('with a stored order, drops it so the layout order draws', () => {
    const doc = kizombaPreset()[0];
    const order = sectionOrderOf(doc);
    const moved = moveSection(doc, order[order.length - 1], -1);

    const reset = resetSections(moved);

    expect(reset.sectionOrder).toBeUndefined();
  });
});

describe('rolesInFlierOrder', () => {
  it('with the footer drawn above the venue, lists Footer, Venue, Title first', () => {
    const drawn = ['footer', 'venue', 'title'];

    const roles = rolesInFlierOrder(drawn);

    expect(roles.slice(0, 3)).toEqual([TextRole.Footer, TextRole.Venue, TextRole.Title]);
  });

  it('with nothing drawn yet, keeps the default role order', () => {
    const drawn: string[] = [];

    const roles = rolesInFlierOrder(drawn);

    expect(roles).toEqual(TEXT_ROLES);
  });
});
