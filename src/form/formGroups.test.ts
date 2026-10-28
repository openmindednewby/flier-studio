import { describe, expect, it } from 'vitest';
import { FM } from '../i18n/fm';
import { FORM_GROUPS, groupedControls } from './formGroups';

describe('groupedControls', () => {
  it('across the three groups, keeps every form control exactly once', () => {
    const inventory = ['layout', 'format', 'palette', 'fonts', 'background', 'picture', 'logo', 'cutout', 'anchor', 'scale',
      'title', 'titleBottom', 'script', 'includesHeading', 'footer', 'venue', 'schedule', 'prices', 'includesItems', 'items'];

    const controls = groupedControls();

    expect([...controls].sort()).toEqual([...inventory].sort());
  });
});

describe('FORM_GROUPS', () => {
  it('in order, names the groups Layout, Pictures and Text', () => {
    const headings = FORM_GROUPS.map((g) => FM(`form.groups.${g.group}`));

    expect(headings).toEqual(['Layout', 'Pictures', 'Text']);
  });

  it('for the layout picker, keeps it on a row of its own', () => {
    const layoutRow = FORM_GROUPS.flatMap((g) => g.rows).find((row) => row.includes('layout'));

    expect(layoutRow).toEqual(['layout']);
  });
});
