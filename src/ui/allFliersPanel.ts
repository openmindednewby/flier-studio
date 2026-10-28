import { EditScope } from '../form/EditScope';
import { FM } from '../i18n/fm';
import { foldableCard } from './collapsible';
import { button, el, labelled } from './dom';
import { themePicker, type ThemeActions } from './themeControls';

export interface AllFliersActions extends ThemeActions {
  scope(): EditScope;
  setScope(scope: EditScope): void;
  add(): void;
}

export interface AllFliersCard {
  readonly card: HTMLElement;
  update(count: number): void;
}

/** The All fliers card: the theme of every flier, the shared-edits scope and Add flier. */
export function allFliersCard(actions: AllFliersActions): AllFliersCard {
  const theme = themePicker(actions);
  const scope = el('select', { 'data-testid': 'pick-scope' });
  scope.append(...[EditScope.This, EditScope.All].map((o) => el('option', { value: o, text: FM(`form.scopes.${o}`) })));
  scope.value = actions.scope();
  scope.addEventListener('change', () => actions.setScope(scope.value as EditScope));
  const note = el('p', { class: 'muted' });
  const card = foldableCard('all-fliers', FM('allFliers.heading'), [
    note,
    el('div', { class: 'row stack-narrow', 'data-testid': 'all-fliers-row' }, [theme.label, labelled('form.scope', scope)]),
    el('div', { class: 'row' }, [button('form.add', 'add-flier', actions.add)]),
  ]);
  const update = (count: number): void => {
    theme.pick.value = actions.theme();
    note.textContent = FM('allFliers.note', String(count));
  };
  return { card, update };
}
