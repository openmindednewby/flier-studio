import { LineTieKind, type FlierDoc } from '@dloizides/poster-render';
import { TITLE_PAIR, percent, scaleOf, setTie, stepSize, tieOf } from '../form/lineEdit';
import { FM } from '../i18n/fm';
import { el, textButton } from './dom';

export interface LineHost {
  doc(): FlierDoc;
  apply(next: FlierDoc): void;
}

const NAMES: Readonly<Record<string, string>> = { title: 'form.title', titleBottom: 'form.titleBottom' };

function sizeRow(key: string, host: LineHost, redraw: (focus: string) => void): HTMLElement {
  const name = FM(NAMES[key] ?? key);
  const doc = host.doc();
  const step = (by: number, testId: string): void => { host.apply(stepSize(host.doc(), [key], by)); redraw(testId); };
  const smaller = textButton('−', `line-smaller-${key}`, () => step(-1, `line-smaller-${key}`));
  smaller.setAttribute('aria-label', FM('lines.smaller', name));
  const larger = textButton('+', `line-larger-${key}`, () => step(1, `line-larger-${key}`));
  larger.setAttribute('aria-label', FM('lines.larger', name));
  const text = key === 'title' ? doc.blocks.title : doc.blocks.titleBottom ?? '';
  return el('div', { class: 'line-size' }, [
    el('span', {}, [el('b', { text: name }), el('small', { text })]),
    smaller,
    el('output', { 'data-testid': `line-size-${key}`, text: percent(scaleOf(doc, key)) }),
    larger,
  ]);
}

function tieRow(host: LineHost, redraw: (focus: string) => void): HTMLElement {
  const now = tieOf(host.doc(), TITLE_PAIR);
  const tie = (kind: LineTieKind, labelKey: string, testId: string): HTMLButtonElement => {
    const node = textButton(FM(labelKey), testId, () => { host.apply(setTie(host.doc(), TITLE_PAIR, tieOf(host.doc(), TITLE_PAIR) === kind ? undefined : kind)); redraw(testId); });
    node.setAttribute('aria-pressed', String(now === kind));
    return node;
  };
  return el('div', { class: 'line-link', role: 'group', 'aria-label': FM('lines.link') }, [
    tie(LineTieKind.Width, 'lines.sameWidth', 'line-same-width'),
    tie(LineTieKind.Size, 'lines.sameSize', 'line-same-size'),
  ]);
}

/** "Line sizes on this flier": size steppers for Title and Second title with Same width / Same size between them. */
export function lineSizesBox(host: LineHost): HTMLElement {
  const box = el('div', { class: 'line-sizes', 'data-testid': 'line-sizes', role: 'group', 'aria-labelledby': 'line-sizes-head' });
  const redraw = (focus: string): void => {
    box.replaceChildren(
      el('p', { id: 'line-sizes-head', class: 'line-sizes-head', text: FM('lines.heading') }),
      el('div', { class: 'line-list' }, [sizeRow('title', host, redraw), tieRow(host, redraw), sizeRow('titleBottom', host, redraw)]),
      el('p', { class: 'muted line-note', text: FM('lines.note') }),
    );
    if (focus !== '') box.querySelector<HTMLElement>(`[data-testid="${focus}"]`)?.focus();
  };
  redraw('');
  return box;
}
