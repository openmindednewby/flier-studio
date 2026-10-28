import { FM } from '../i18n/fm';
import { THEMES, type FlierTheme } from '../theme/themes';
import { el, labelled } from './dom';

export interface ThemeActions {
  theme(): string;
  setTheme(id: string): void;
}

/** The Theme picker; a change puts every flier on the theme. */
export function themePicker(actions: ThemeActions, themes: readonly FlierTheme[] = THEMES): { label: HTMLLabelElement; pick: HTMLSelectElement } {
  const pick = el('select', { 'data-testid': 'pick-theme' });
  pick.append(...themes.map((t) => el('option', { value: t.id, text: FM(t.nameKey) })));
  pick.value = actions.theme();
  pick.addEventListener('change', () => actions.setTheme(pick.value));
  const label = labelled('form.theme', pick);
  label.dataset.testid = 'theme-row';
  return { label, pick };
}
