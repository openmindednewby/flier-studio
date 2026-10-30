import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { TextRole } from './TextRole';
import { ROLE_LINES, withRoleStyles } from './textRoles';

const doc = kizombaPreset()[0];

describe('withRoleStyles', () => {
  it('with a Venue face, puts it on every venue line', () => {
    const roles = { [TextRole.Venue]: { font: 'Anton' } };

    const styled = withRoleStyles(doc, roles);

    expect(ROLE_LINES[TextRole.Venue].every((k) => styled.lineStyles?.[k]?.font === 'Anton')).toBe(true);
  });

  it('with a flier font on the title and a role font and weight, keeps the flier font and adds the role weight', () => {
    const own = { ...doc, lineStyles: { title: { font: 'Oswald' } } };

    const styled = withRoleStyles(own, { [TextRole.Title]: { font: 'Anton', weight: 700 } });

    expect(styled.lineStyles?.title).toEqual({ font: 'Oswald', weight: 700 });
  });

  it('with no role styles, returns the doc unchanged', () => {
    const plain = { ...doc, lineStyles: undefined };

    const styled = withRoleStyles(plain, {});

    expect(styled).toBe(plain);
  });

  it('with an empty role style, sets nothing on its lines', () => {
    const plain = { ...doc, lineStyles: undefined };

    const styled = withRoleStyles(plain, { [TextRole.Footer]: {} });

    expect(styled.lineStyles).toBeUndefined();
  });
});
