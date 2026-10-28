import type { BlockText } from '../form/docEdit';
import { findMatches, type ReplaceMatch } from '../form/replaceText';
import { FM } from '../i18n/fm';
import { plural } from '../i18n/plural';
import { el, labelled } from './dom';
import { lineBox, textRunsOf, type LineBox, type TextRun } from './textRuns';

export interface ReplaceActions {
  texts(): BlockText[];
  replace(ticked: readonly ReplaceMatch[], replacement: string): void;
}

export interface ReplacePanel {
  readonly node: HTMLElement;
  refresh(): void;
}

/** Fired on document after the marks are redrawn; detail = how many matches are highlighted. */
export const MARKS_EVENT = 'flier:replace-marks';
const MARK_PAD = 3;

const keyOf = (m: ReplaceMatch): string => `${String(m.flier)}:${m.field}:${String(m.at)}`;
const px = (n: number): string => `${String(Math.round(n))}px`;

function runFor(runs: readonly TextRun[], needle: string, k: number): TextRun | undefined {
  const hits = runs.filter((r) => r.text.toLowerCase().includes(needle));
  return hits[Math.min(k, hits.length - 1)];
}

function markAt(line: LineBox, canvas: HTMLCanvasElement, on: boolean, n: number): HTMLElement {
  const scale = canvas.width > 0 ? canvas.clientWidth / canvas.width : 0;
  const mark = el('span', { class: on ? 'replace-mark' : 'replace-mark off' }, [el('b', { text: String(n) })]);
  Object.assign(mark.style, {
    left: px(canvas.offsetLeft + line.x * scale - MARK_PAD), top: px(canvas.offsetTop + line.y * scale - MARK_PAD),
    width: px(line.width * scale + 2 * MARK_PAD), height: px(line.height * scale + 2 * MARK_PAD),
  });
  return mark;
}

/** Draws a numbered mark on each match it can place and announces how many it drew. */
export function drawMarks(grid: HTMLElement, matches: readonly ReplaceMatch[], ticked: (m: ReplaceMatch) => boolean, find: string): void {
  grid.querySelectorAll('.replace-marks').forEach((n) => n.remove());
  const perFlier = new Map<number, number>();
  let drawn = 0;
  matches.forEach((m, i) => {
    const k = perFlier.get(m.flier) ?? 0;
    perFlier.set(m.flier, k + 1);
    const trim = grid.querySelector<HTMLElement>(`[data-testid="preview-${String(m.flier + 1)}"] .trim`);
    const canvas = trim?.querySelector('canvas') ?? null;
    const run = canvas === null ? undefined : runFor(textRunsOf(canvas), find.toLowerCase(), k);
    if (trim === null || canvas === null || run === undefined) return;
    const box = trim.querySelector('.replace-marks') ?? trim.appendChild(el('div', { class: 'replace-marks', 'aria-hidden': 'true' }));
    box.append(markAt(lineBox(run), canvas, ticked(m), i + 1));
    drawn += 1;
  });
  document.dispatchEvent(new CustomEvent<number>(MARKS_EVENT, { detail: drawn }));
}

function matchRow(m: ReplaceMatch, i: number, ticked: boolean, toggle: (on: boolean) => void): HTMLLIElement {
  const n = String(i + 1);
  const box = el('input', { type: 'checkbox', 'data-testid': `replace-tick-${n}`, 'aria-description': FM('hint.button', FM('replace.tick')) });
  box.checked = ticked;
  box.addEventListener('change', () => toggle(box.checked));
  const text = el('span', {}, [
    el('b', { text: FM('replace.match', n, String(m.flier + 1), FM(`replace.fields.${m.field}`)) }),
    el('s', { text: m.line }), el('span', { 'aria-hidden': 'true', text: FM('replace.to') }), el('ins', { text: m.after }),
  ]);
  return el('li', { 'data-testid': `replace-match-${n}` }, [el('label', {}, [box, text])]);
}

/** Replace text: lists and marks every match on the fliers, each with a tick, before anything changes. */
export function replacePanel(grid: HTMLElement, actions: ReplaceActions): ReplacePanel {
  const find = el('input', { type: 'text', 'data-testid': 'replace-find' });
  const withText = el('input', { type: 'text', 'data-testid': 'replace-with' });
  const word = el('input', { type: 'checkbox', 'data-testid': 'replace-word', 'aria-description': FM('hint.field', FM('replace.word')) });
  const count = el('p', { class: 'replace-count', role: 'status', 'aria-live': 'polite', 'data-testid': 'replace-count' });
  const list = el('ul', { class: 'replace-list', 'data-testid': 'replace-matches' });
  const apply = el('button', { type: 'button', class: 'primary', 'data-testid': 'replace-apply', 'aria-description': FM('hint.button', FM('replace.heading')) });
  const empty = el('p', { class: 'muted', text: FM('replace.empty') });
  const results = el('div', { class: 'replace-results' }, [count, list, apply, el('p', { class: 'muted', text: FM('replace.note') })]);
  const off = new Set<string>();
  let matches: ReplaceMatch[] = [];
  const isTicked = (m: ReplaceMatch): boolean => !off.has(keyOf(m));
  const sync = (): void => {
    const ticked = matches.filter(isTicked).length;
    count.textContent = FM('replace.count', plural('replace.matches', matches.length), plural('replace.fliers', new Set(matches.map((m) => m.flier)).size), String(ticked));
    apply.textContent = FM('replace.apply', String(ticked));
    apply.disabled = ticked === 0;
    drawMarks(grid, matches, isTicked, find.value);
  };
  const refresh = (): void => {
    matches = findMatches(actions.texts(), find.value, withText.value, word.checked);
    list.replaceChildren(...matches.map((m, i) => matchRow(m, i, isTicked(m), (on) => { if (on) off.delete(keyOf(m)); else off.add(keyOf(m)); sync(); })));
    results.hidden = find.value === '';
    empty.hidden = !results.hidden;
    sync();
  };
  const restart = (): void => { off.clear(); refresh(); };
  find.addEventListener('input', restart);
  word.addEventListener('change', restart);
  withText.addEventListener('input', refresh);
  apply.addEventListener('click', () => actions.replace(matches.filter(isTicked), withText.value));
  const node = el('div', { class: 'group replace', 'data-testid': 'replace-text' }, [
    el('h3', { text: FM('replace.heading') }),
    el('div', { class: 'row stack-narrow' }, [labelled('replace.find', find), labelled('replace.with', withText)]),
    el('label', { class: 'replace-word' }, [word, el('span', { text: FM('replace.word') })]),
    empty, results,
  ]);
  refresh();
  return { node, refresh };
}
