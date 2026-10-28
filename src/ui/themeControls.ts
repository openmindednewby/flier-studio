import { EditScope } from '../form/EditScope';
import { FM } from '../i18n/fm';
import { THEMES, type FlierTheme } from '../theme/themes';
import { el, labelled } from './dom';

export interface ThemeActions {
  theme(): string;
  setTheme(id: string): void;
  themeScope(): EditScope;
  setThemeScope(scope: EditScope): void;
}

function options(node: HTMLSelectElement, entries: readonly [string, string][], value: string): HTMLSelectElement {
  node.append(...entries.map(([v, text]) => el('option', { value: v, text })));
  node.value = value;
  return node;
}

/** The Theme picker and its this flier / all fliers scope, side by side in one form row. */
export function themeRow(actions: ThemeActions, themes: readonly FlierTheme[] = THEMES): HTMLElement {
  const pick = options(el('select', { 'data-testid': 'pick-theme' }), themes.map((t) => [t.id, FM(t.nameKey)]), actions.theme());
  const scopes = [EditScope.This, EditScope.All].map((s): [string, string] => [s, FM(`form.themeScopes.${s}`)]);
  const scope = options(el('select', { 'data-testid': 'pick-theme-scope' }), scopes, actions.themeScope());
  pick.addEventListener('change', () => actions.setTheme(pick.value));
  scope.addEventListener('change', () => actions.setThemeScope(scope.value as EditScope));
  return el('div', { class: 'row stack-narrow', 'data-testid': 'theme-row' }, [labelled('form.theme', pick), labelled('form.themeScope', scope)]);
}
