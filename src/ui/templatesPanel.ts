import { LAYOUT_CATALOGUE, type LayoutId } from '@dloizides/poster-render';
import type { BuiltInTemplate } from '../templates/builtInTemplates';
import type { TemplatesActions } from '../templates/templateActions';
import type { Template } from '../templates/templateStore';
import { FM } from '../i18n/fm';
import { foldableCard } from './collapsible';
import { el, textButton } from './dom';
import { builtInRow, mineRow } from './templateRow';

export interface TemplatesPanel {
  readonly card: HTMLElement;
  show(mine: readonly Template[]): void;
}

function saveRow(actions: TemplatesActions): HTMLElement {
  const name = el('input', { type: 'text', 'data-testid': 'templates-save-name', 'aria-label': FM('templates.saveName'), 'aria-description': FM('templates.saveHint'), placeholder: FM('templates.saveHint') });
  const save = textButton(FM('templates.save'), 'templates-save', () => { actions.save(name.value); name.value = ''; });
  save.setAttribute('aria-label', FM('templates.saveLabel'));
  return el('div', { class: 'template-tools' }, [name, save]);
}

function createRow(actions: TemplatesActions): HTMLElement {
  const layout = el('select', { 'data-testid': 'templates-layout', 'aria-label': FM('templates.layout') }, LAYOUT_CATALOGUE.map((entry) => el('option', { value: entry.id, text: FM(`layouts.${entry.id}`) })));
  const create = textButton(FM('templates.create'), 'templates-new', () => actions.create(layout.value as LayoutId));
  create.setAttribute('aria-label', FM('templates.createLabel'));
  return el('div', { class: 'template-tools' }, [layout, create]);
}

/** Templates on this device: the built-in ones and My templates, Save the selected flier, and New template in a layout. */
export function templatesPanel(builtIns: readonly BuiltInTemplate[], actions: TemplatesActions): TemplatesPanel {
  const builtList = el('ul', { class: 'drafts', 'data-testid': 'templates-builtin' }, builtIns.map((t, i) => builtInRow(t, String(i + 1), actions)));
  builtList.querySelector('button')?.setAttribute('data-autofocus', 'true');
  const mineList = el('ul', { class: 'drafts', 'data-testid': 'templates-mine' });
  const empty = el('p', { class: 'muted', 'data-testid': 'templates-empty', text: FM('templates.none') });
  const card = foldableCard('templates-panel', FM('templates.heading'), [
    el('h3', { text: FM('templates.builtIn') }), builtList,
    el('h3', { text: FM('templates.mine') }), saveRow(actions), createRow(actions), mineList, empty,
  ]);
  const show = (mine: readonly Template[]): void => {
    mineList.replaceChildren(...mine.map((t, i) => mineRow(t, String(i + 1), actions)));
    empty.hidden = mine.length > 0;
  };
  return { card, show };
}
