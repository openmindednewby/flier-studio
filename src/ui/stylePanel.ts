import { LineAlign, PALETTES, type FlierDoc, type LineKey, type LineStyle } from '@dloizides/poster-render';
import { percent, resetLines, restyle, stepSize, stepWidth, styleOf } from '../form/lineEdit';
import { FM } from '../i18n/fm';
import { el, textButton } from './dom';
import { STYLE_FONTS } from './styleFonts';
import { styleSegment, styleSelect, styleSwatches } from './styleControls';
import { neverShrinks } from './sizeGuard';
import { clearOutline, drawnText, hushOutline, outlineOn } from './textOutline';

export interface StyleHost {
  doc(): FlierDoc;
  apply(edit: (doc: FlierDoc) => FlierDoc, everyFlier: boolean): void;
  readonly count: number;
}

export interface StyleTarget {
  readonly key: string;
  readonly name: string;
  readonly lines: readonly LineKey[];
}

const DESKTOP_MIN = 1024;
const GAP = 8;
const SHEET_TOP_GAP = 24;
const BOLD = 700;
const REGULAR = 400;
const BOLD_FROM = 600;
const SPACING: Readonly<Record<string, number | undefined>> = { normal: undefined, tight: -0.03, wide: 0.08, wider: 0.16 };

const field = (label: string, control: HTMLElement): HTMLElement => el('div', { class: 'style-field' }, [el('span', { text: label }), control]);

const swatchesOf = (doc: FlierDoc): string[] => [...new Set(Object.values((PALETTES as Record<string, object | undefined>)[String(doc.palette)] ?? {}).filter((v): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)))];

const inkOf = (doc: FlierDoc): string | undefined => (PALETTES as Record<string, { ink?: string } | undefined>)[String(doc.palette)]?.ink;

type Change = (patch: LineStyle | null, focus: string) => void;

interface Stepper {
  readonly prop: 'sizeScale' | 'widthScale';
  readonly ids: readonly [string, string, string];
  readonly labels: readonly [string, string];
  step(doc: FlierDoc, lines: readonly LineKey[], steps: number): FlierDoc;
}

const SIZE: Stepper = { prop: 'sizeScale', ids: ['style-smaller', 'style-size', 'style-larger'], labels: ['lines.smaller', 'lines.larger'], step: stepSize };
const WIDTH: Stepper = { prop: 'widthScale', ids: ['style-narrower', 'style-width', 'style-wider'], labels: ['style.narrower', 'style.wider'], step: stepWidth };

function stepper(target: StyleTarget, host: StyleHost, change: Change, s: Stepper): HTMLElement {
  const go = (steps: number, id: string): void => {
    const next = s.step(host.doc(), target.lines, steps);
    if (s.prop === 'sizeScale' && steps > 0 && !neverShrinks(host.doc(), next, target.lines)) {
      node.closest('.style-panel')?.querySelector('[data-testid="style-drawn"]')?.replaceChildren(FM('style.needsWidth', drawnText(target.lines)));
      return;
    }
    change({ [s.prop]: styleOf(next, target.lines[0])[s.prop] }, id);
  };
  const node = el('div', { class: 'style-step' }, [
    textButton('−', s.ids[0], () => go(-1, s.ids[0])),
    el('output', { 'data-testid': s.ids[1], text: percent(styleOf(host.doc(), target.lines[0])[s.prop] ?? 1) }),
    textButton('+', s.ids[2], () => go(1, s.ids[2])),
  ]);
  node.firstElementChild?.setAttribute('aria-label', FM(s.labels[0], target.name));
  node.lastElementChild?.setAttribute('aria-label', FM(s.labels[1], target.name));
  return node;
}

const drawn = (target: StyleTarget): HTMLElement => el('output', { class: 'style-drawn', 'data-testid': 'style-drawn', 'data-drawn-lines': target.lines.join(' '), text: drawnText(target.lines) });

/** The Style fields of one text, from Apply to (first) to Alignment (last). */
export function styleFields(target: StyleTarget, host: StyleHost, change: Change, scope: { all: boolean; set(all: boolean): void }): HTMLElement[] {
  const doc = host.doc();
  const now = styleOf(doc, target.lines[0]);
  const spacing = Object.entries(SPACING).find(([, v]) => v === now.letterSpacing)?.[0] ?? 'normal';
  const bold = (now.weight ?? REGULAR) >= BOLD_FROM;
  return [
    field(FM('style.applyTo'), styleSegment([['this', FM('style.thisFlier')], ['all', FM('style.allFliers', String(host.count))]], scope.all ? 'all' : 'this', 'style-scope', (v) => { scope.set(v === 'all'); change(null, `style-scope-${v}`); })),
    el('div', { class: 'style-row' }, [
      field(FM('style.font'), styleSelect(['', ...STYLE_FONTS].map((f) => [f, f === '' ? FM('style.themeFont') : f]), now.font ?? '', 'style-font', (v) => change({ font: v === '' ? undefined : v }, 'style-font'))),
      field(FM('style.size'), stepper(target, host, change, SIZE)),
    ]),
    el('div', { class: 'style-row' }, [field(FM('style.width'), stepper(target, host, change, WIDTH)), field(FM('style.drawn'), drawn(target))]),
    field(FM('style.colour'), styleSwatches(swatchesOf(doc), now.color, (c, testId) => change({ color: c }, testId), inkOf(doc))),
    el('div', { class: 'style-row' }, [
      field(FM('style.weight'), styleSegment([['bold', FM('style.bold')], ['italic', FM('style.italic')]], [bold ? 'bold' : '', now.italic === true ? 'italic' : ''], 'style', (v) => change(v === 'bold' ? { weight: bold ? REGULAR : BOLD } : { italic: now.italic === true ? undefined : true }, `style-${v}`))),
      field(FM('style.spacing'), styleSelect(Object.keys(SPACING).map((k) => [k, FM(`style.spacings.${k}`)]), spacing, 'style-spacing', (v) => change({ letterSpacing: SPACING[v] }, 'style-spacing'))),
    ]),
    field(FM('style.align'), styleSegment(Object.values(LineAlign).map((a) => [a, FM(`style.aligns.${a}`)]), now.align ?? '', 'style-align', (v) => change({ align: v as LineAlign }, `style-align-${v}`))),
  ];
}

function trapTab(panel: HTMLElement, e: KeyboardEvent): void {
  if (e.key !== 'Tab') return;
  const stops = [...panel.querySelectorAll<HTMLElement>('button, select, input')].filter((node) => !node.hasAttribute('disabled'));
  const edge = e.shiftKey ? stops[0] : stops[stops.length - 1];
  if (document.activeElement !== edge) return;
  e.preventDefault();
  (e.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
}

function place(panel: HTMLElement, row: HTMLElement): void {
  if (innerWidth < DESKTOP_MIN) {
    panel.classList.add('style-sheet');
    panel.setAttribute('aria-modal', 'true');
    panel.addEventListener('keydown', (e) => trapTab(panel, e));
    const bar = document.querySelector('[data-testid="mini-preview"]')?.getBoundingClientRect();
    if (bar !== undefined && bar.height > 1 && bar.top < innerHeight) Object.assign(panel.style, { bottom: `${String(Math.round(innerHeight - bar.top + GAP))}px`, maxHeight: `${String(Math.round(bar.top - SHEET_TOP_GAP))}px` });
    return;
  }
  const r = row.getBoundingClientRect();
  panel.classList.add('style-pop');
  Object.assign(panel.style, { left: `${String(Math.round(r.left + scrollX))}px`, width: `${String(Math.round(r.width))}px`, top: `${String(Math.round(r.bottom + scrollY + GAP))}px` });
  requestAnimationFrame(() => panel.scrollIntoView({ block: 'nearest' }));
}

/** Opens the Style panel of one text field: a bottom sheet with Done under 1024 px, a card under the field above. */
export function openStylePanel(target: StyleTarget, host: StyleHost, opener: HTMLElement): void {
  document.querySelector('[data-testid="style-panel"]')?.dispatchEvent(new Event('style-close'));
  const panel = el('div', { class: 'style-panel', role: 'dialog', 'aria-label': FM('style.panelLabel', target.name), 'data-testid': 'style-panel' });
  const scope = { all: false, set(all: boolean): void { scope.all = all; } };
  const close = (): void => { clearOutline(); panel.remove(); opener.setAttribute('aria-expanded', 'false'); opener.focus(); };
  const draw = (focus: string): void => {
    const foot = el('div', { class: 'style-foot' }, [
      textButton(FM('style.reset'), 'style-reset', () => { hushOutline(); host.apply((d) => resetLines(d, target.lines), scope.all); draw('style-reset'); }),
      el('small', { class: 'muted', text: FM('style.keeps') }),
      textButton(FM('style.done'), 'style-done', close, 'primary'),
    ]);
    panel.replaceChildren(el('h4', { text: FM('style.title', target.name) }), ...styleFields(target, host, (patch, next) => {
      if (patch !== null) { hushOutline(); host.apply((d) => restyle(d, target.lines, patch), scope.all); }
      draw(next);
    }, scope), foot);
    panel.querySelector<HTMLElement>(`[data-testid="${focus}"]`)?.focus();
  };
  panel.addEventListener('style-close', () => { clearOutline(); panel.remove(); opener.setAttribute('aria-expanded', 'false'); });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  opener.setAttribute('aria-expanded', 'true');
  outlineOn(panel, target.lines, target.name);
  document.body.append(panel);
  place(panel, opener.closest('.row') ?? opener);
  draw('style-font');
}
