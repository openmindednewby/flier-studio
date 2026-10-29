import { describe, expect, it, vi } from 'vitest';
import { PanelKey } from './PanelKey';
import { sectionRail } from './sectionNav';

const store = { read: (): string | null => null, write: (): boolean => true };

describe('sectionRail show', () => {
  it('when revealing a panel, focuses the control it names to focus on open', () => {
    Element.prototype.scrollIntoView = vi.fn();
    const panel = document.createElement('section');
    const field = document.createElement('textarea');
    field.setAttribute('data-autofocus', 'true');
    panel.append(document.createElement('button'), field);
    document.body.replaceChildren(panel);
    const rail = sectionRail({ [PanelKey.Ai]: panel }, document.createElement('div'), store);

    rail.show(PanelKey.Ai, true);

    expect(document.activeElement).toBe(field);
  });
});
