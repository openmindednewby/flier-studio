import type { FlierDoc } from '@dloizides/poster-render';
import { EACH_OWN, SETTINGS, sharedSummary, sharedValue, type SettingSpec } from '../form/allSettings';
import { blocksToText } from '../form/docEdit';
import { EditScope } from '../form/EditScope';
import type { SettingId } from '../form/SettingId';
import { FM } from '../i18n/fm';
import { foldableCard } from './collapsible';
import { button, el, labelled } from './dom';
import { replacePanel, type ReplaceActions } from './replacePanel';
import { roleList, type RoleActions } from './roleList';
import { sectionOrderList, type OrderActions } from './sectionOrderList';
import { themePicker, type ThemeActions } from './themeControls';

export interface AllFliersActions extends ThemeActions, RoleActions, OrderActions {
  scope(): EditScope;
  setScope(scope: EditScope): void;
  add(): void;
  docs(): FlierDoc[];
  setSetting(id: SettingId, value: string): void;
  openGenerate(): void;
  replace: ReplaceActions['replace'];
}

export interface AllFliersCard {
  readonly card: HTMLElement;
  update(count: number): void;
}

const what = (key: string): HTMLElement => el('small', { class: 'setting-what', text: FM(key) });
const optionLabel = (spec: SettingSpec, value: string): string => (spec.id === 'layout' ? FM(`layouts.${value}`) : value);

function settingRow(spec: SettingSpec, actions: AllFliersActions): { row: HTMLElement; fill(docs: FlierDoc[]): void } {
  const pick = el('select', { 'data-testid': `all-${spec.id}`, 'aria-label': FM(spec.labelKey), 'aria-description': FM('hint.field', FM(spec.labelKey)) });
  pick.addEventListener('change', () => actions.setSetting(spec.id, pick.value));
  const fill = (docs: FlierDoc[]): void => {
    pick.replaceChildren(el('option', { value: EACH_OWN, text: FM('allFliers.keep') }), ...spec.options(docs).map((o) => el('option', { value: o, text: optionLabel(spec, o) })));
    pick.value = sharedValue(docs, spec.id);
  };
  return { row: el('label', { class: 'setting', 'data-testid': `all-${spec.id}-row` }, [el('span', { text: FM(spec.labelKey) }), what(spec.whatKey), pick]), fill };
}

function aiLine(actions: AllFliersActions): HTMLElement {
  const link = el('a', { href: '#generate', 'aria-description': FM('hint.jump', FM('nav.ai')), text: FM('allFliers.aiLink') });
  link.addEventListener('click', (e) => { e.preventDefault(); actions.openGenerate(); });
  return el('p', { class: 'ai-line', 'data-testid': 'all-ai-line' }, [FM('allFliers.aiLine'), ' ', link]);
}

function sharedText(actions: AllFliersActions): { nodes: HTMLElement[]; update(count: number): void } {
  const scope = el('select', { 'data-testid': 'pick-scope' });
  scope.append(...[EditScope.This, EditScope.All].map((o) => el('option', { value: o, text: FM(`form.scopes.${o}`) })));
  scope.value = actions.scope();
  const fields = el('dl', { class: 'shared-fields', 'data-testid': 'shared-fields' });
  const state = el('p', { class: 'muted', 'data-testid': 'shared-state' });
  const update = (count: number): void => {
    const s = sharedSummary(actions.docs()[0] ?? { blocks: { title: '' } } as FlierDoc);
    const rows: [string, string][] = [['allFliers.footer', s.footer], ['allFliers.levels', s.levels], ['allFliers.price', s.price]];
    fields.replaceChildren(...rows.flatMap(([k, v]) => [el('dt', { text: FM(k) }), el('dd', { text: v !== '' ? v : FM('allFliers.emptyField') })]));
    state.textContent = scope.value === EditScope.All ? FM('allFliers.sharedOn', String(count)) : FM('allFliers.sharedOff');
  };
  scope.addEventListener('change', () => { actions.setScope(scope.value as EditScope); update(actions.docs().length); });
  return { nodes: [el('h3', { class: 'setting-head', text: FM('allFliers.sharedHeading') }), labelled('allFliers.scope', scope), fields, state], update };
}

/** The All fliers card: a registry of settings that change every flier, the shared text, Replace text and Add flier. */
export function allFliersCard(actions: AllFliersActions, grid: HTMLElement): AllFliersCard {
  const theme = themePicker(actions);
  theme.label.classList.add('setting');
  theme.pick.setAttribute('aria-label', FM('form.theme'));
  theme.label.firstElementChild?.after(what('allFliers.themeWhat'));
  const rows = SETTINGS.map((spec) => settingRow(spec, actions));
  const roles = roleList(actions);
  const order = sectionOrderList(actions);
  const custom = el('div', { class: 'setting setting-custom', 'data-testid': 'all-custom-layouts' }, [el('span', { text: FM('allFliers.custom') }), what('allFliers.customWhat')]);
  const shared = sharedText(actions);
  const replace = replacePanel(grid, { texts: () => actions.docs().map(blocksToText), replace: actions.replace });
  const note = el('p', { class: 'muted' });
  const card = foldableCard('all-fliers', FM('allFliers.heading'), [
    note,
    el('div', { class: 'registry', 'data-testid': 'all-fliers-row', 'data-registry': 'settings' }, [
      el('h3', { class: 'setting-head', text: FM('allFliers.lookHeading') }), theme.label, ...rows.map((r) => r.row), ...roles.nodes, ...order.nodes, custom, aiLine(actions), ...shared.nodes,
    ]),
    replace.node,
    el('div', { class: 'row' }, [button('form.add', 'add-flier', actions.add)]),
  ]);
  const update = (count: number): void => {
    theme.pick.value = actions.theme();
    note.textContent = FM('allFliers.note', String(count));
    rows.forEach((r) => r.fill(actions.docs()));
    shared.update(count);
    roles.update();
    order.update();
    replace.refresh();
  };
  return { card, update };
}
