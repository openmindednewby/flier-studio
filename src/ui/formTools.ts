import type { FlierDoc } from '@dloizides/poster-render';
import { FIELD_LINES } from '../form/lineEdit';
import { FM } from '../i18n/fm';
import { el } from './dom';
import { iconButton } from './icons';
import { lineSizesBox } from './lineSizes';
import { openStylePanel, type StyleHost } from './stylePanel';

export interface FormToolsHost extends StyleHost {
  set(next: FlierDoc): void;
}

function addStyleButton(container: HTMLElement, key: string, host: StyleHost): void {
  const control = container.querySelector<HTMLElement>(`[data-testid="field-${key}"]`);
  const label = control?.closest('label');
  const head = label?.querySelector<HTMLElement>(':scope > span');
  if (control === null || control === undefined || label === null || label === undefined || head === null || head === undefined) return;
  const name = (head.textContent ?? key).trim();
  head.id = `label-field-${key}`;
  control.setAttribute('aria-labelledby', head.id);
  const button = iconButton(FM('style.open', name), `style-${key}`, 'type', () => openStylePanel({ key, name, lines: FIELD_LINES[key] ?? [] }, host, button));
  button.append(el('span', { text: FM('style.button') }));
  button.classList.add('style-button');
  button.setAttribute('aria-expanded', 'false');
  if (control.id === '') control.id = `input-field-${key}`;
  const text = el('label', { id: head.id, for: control.id, text: name });
  head.remove();
  label.replaceWith(el('div', { class: 'field' }, [el('div', { class: 'label-head' }, [text, button]), ...label.childNodes]));
}

/** Adds a Style button to every text field and the line sizes box under the Second title row. */
export function addFormTools(container: HTMLElement, host: FormToolsHost): void {
  for (const key of Object.keys(FIELD_LINES)) addStyleButton(container, key, host);
  container.querySelector('[data-testid="field-titleBottom"]')?.closest('.row')?.after(lineSizesBox({ doc: host.doc, apply: host.set }));
}
