import type { FlierDoc } from '@dloizides/poster-render';
import { MAX_FREE_LINES, addLine, moveLine, removeLine, setLine } from '../form/freeLines';
import { FM } from '../i18n/fm';
import { button, el } from './dom';
import { iconButton } from './icons';
import { openStylePanel, type StyleHost } from './stylePanel';

export interface FreeLinesHost extends StyleHost {
  set(next: FlierDoc): void;
}

type Paint = (focus: string) => void;

function styleButton(name: string, index: number, host: StyleHost): HTMLButtonElement {
  const node = iconButton(FM('style.open', name), `style-line-${String(index)}`, 'type', () => openStylePanel({ key: `line-${String(index)}`, name, lines: [`lines.${String(index)}`] }, host, node));
  node.append(el('span', { text: FM('style.button') }));
  node.classList.add('style-button');
  node.setAttribute('aria-expanded', 'false');
  return node;
}

function lineRow(text: string, at: { index: number; count: number }, host: FreeLinesHost, paint: Paint): HTMLElement {
  const { index, count } = at;
  const n = String(index + 1);
  const name = FM('freeLines.name', n);
  const input = el('input', { type: 'text', 'data-testid': `field-line-${String(index)}`, 'aria-label': name, 'aria-description': FM('hint.field', name), placeholder: FM('freeLines.placeholder') });
  input.value = text;
  input.addEventListener('input', (e) => { e.stopPropagation(); host.set(setLine(host.doc(), index, input.value)); });
  const act = (edit: (doc: FlierDoc) => FlierDoc, focus: string) => (): void => { host.set(edit(host.doc())); paint(focus); };
  const up = iconButton(FM('freeLines.up', n), `line-up-${String(index)}`, 'up', act((d) => moveLine(d, index, -1), `field-line-${String(index - 1)}`));
  const down = iconButton(FM('freeLines.down', n), `line-down-${String(index)}`, 'down', act((d) => moveLine(d, index, 1), `field-line-${String(index + 1)}`));
  const remove = iconButton(FM('freeLines.remove', n), `line-remove-${String(index)}`, 'trash', act((d) => removeLine(d, index), 'add-line'));
  up.disabled = index === 0;
  down.disabled = index === count - 1;
  return el('div', { class: 'free-line', 'data-testid': `free-line-${String(index)}` }, [input, el('div', { class: 'free-line-tools' }, [styleButton(name, index, host), up, down, remove])]);
}

/** The owner's own lines: each with its text, a Style button, move up/down and remove, then "Add line". */
export function freeLinesBox(host: FreeLinesHost): HTMLElement {
  const list = el('div', { class: 'free-lines', 'data-testid': 'free-lines' });
  const paint: Paint = (focus) => {
    const lines = host.doc().blocks.lines ?? [];
    const add = button('freeLines.add', 'add-line', () => { host.set(addLine(host.doc())); paint(`field-line-${String(lines.length)}`); }, 'add-line');
    add.disabled = lines.length >= MAX_FREE_LINES;
    list.replaceChildren(...lines.map((text, i) => lineRow(text, { index: i, count: lines.length }, host, paint)), add);
    list.querySelector<HTMLElement>(`[data-testid="${focus}"]`)?.focus();
  };
  paint('');
  return el('div', { class: 'field', role: 'group', 'aria-label': FM('freeLines.heading') }, [el('span', { class: 'label-head', text: FM('freeLines.heading') }), list]);
}
