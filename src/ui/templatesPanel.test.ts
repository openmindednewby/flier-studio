import { describe, expect, it, vi } from 'vitest';
import { builtInTemplates } from '../templates/builtInTemplates';
import type { TemplatesActions } from '../templates/templateActions';
import { templatesPanel } from './templatesPanel';

const actions = (): TemplatesActions => ({ use: vi.fn(), save: vi.fn(), create: vi.fn(), rename: vi.fn(), remove: vi.fn() });

describe('templatesPanel', () => {
  it('with the built-ins, marks Use on the first built-in as the control focused on open', () => {
    const panel = templatesPanel(builtInTemplates(), actions());

    const focused = panel.card.querySelector('[data-autofocus]');

    expect(focused?.getAttribute('data-testid')).toBe('template-builtin-use-1');
  });

  it('with Use on the second built-in pressed, uses that template once', () => {
    const builtIns = builtInTemplates();
    const wired = actions();
    const panel = templatesPanel(builtIns, wired);

    panel.card.querySelector<HTMLButtonElement>('[data-testid="template-builtin-use-2"]')?.click();

    expect(vi.mocked(wired.use).mock.calls).toEqual([[builtIns[1].name, builtIns[1].flier]]);
  });

  it('with a typed name and Save pressed, saves under that name and clears the box', () => {
    const wired = actions();
    const panel = templatesPanel([], wired);
    const name = panel.card.querySelector<HTMLInputElement>('[data-testid="templates-save-name"]');
    if (name !== null) name.value = 'Autumn';

    panel.card.querySelector<HTMLButtonElement>('[data-testid="templates-save"]')?.click();

    expect([vi.mocked(wired.save).mock.calls, name?.value]).toEqual([[['Autumn']], '']);
  });

  it('with My templates shown, hides the empty note and lists one row each', () => {
    const panel = templatesPanel([], actions());
    const [built] = builtInTemplates();

    panel.show([{ id: 1, at: 1, name: 'Mine', flier: built.flier, thumb: '' }]);

    expect([panel.card.querySelectorAll('[data-testid="templates-mine"] li').length, panel.card.querySelector<HTMLElement>('[data-testid="templates-empty"]')?.hidden]).toEqual([1, true]);
  });
});
