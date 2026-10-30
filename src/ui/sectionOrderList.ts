import { sectionOrderOf, type BodySection, type FlierDoc } from '@dloizides/poster-render';
import { moveSection, resetSections } from '../form/sectionOrder';
import { FM } from '../i18n/fm';
import { el, textButton } from './dom';
import { styleSegment } from './styleControls';

export interface OrderActions {
  orderDoc(): FlierDoc;
  reorder(edit: (doc: FlierDoc) => FlierDoc, everyFlier: boolean): void;
  docs(): FlierDoc[];
}

const UP = -1;
const DOWN = 1;

/** AC-50: the selected flier's body blocks in drawn order, each with Move up / Move down for this flier or all, plus Reset. */
export function sectionOrderList(actions: OrderActions): { nodes: HTMLElement[]; update(): void } {
  const view = { all: false, shown: '', focus: '' };
  const scope = el('div', { class: 'order-scope' });
  const list = el('ol', { class: 'section-order', 'data-testid': 'section-order', 'aria-label': FM('order.heading') });
  const refocus = (): void => {
    if (view.focus === '') return;
    const node = document.querySelector<HTMLButtonElement>(`[data-testid="${view.focus}"]`);
    view.focus = '';
    const target = node?.disabled === true ? node.parentElement?.querySelector<HTMLButtonElement>('button:not([disabled])') : node;
    target?.focus();
  };
  const mover = (section: BodySection, delta: number, edge: boolean): HTMLButtonElement => {
    const dir = delta === UP ? 'up' : 'down';
    const id = `order-${section}-${dir}`;
    const node = textButton(FM(`order.${dir}Mark`), id, () => { view.focus = id; actions.reorder((d) => moveSection(d, section, delta), view.all); });
    node.setAttribute('aria-label', FM(`order.${dir}`, FM(`order.names.${section}`)));
    node.disabled = edge;
    return node;
  };
  const draw = (): void => {
    const order = sectionOrderOf(actions.orderDoc());
    const count = actions.docs().length;
    const key = `${order.join()}|${String(view.all)}|${String(count)}`;
    if (key === view.shown) return;
    view.shown = key;
    scope.replaceChildren(styleSegment([['this', FM('style.thisFlier')], ['all', FM('style.allFliers', String(count))]], view.all ? 'all' : 'this', 'order-scope', (v) => { view.all = v === 'all'; view.focus = `order-scope-${v}`; draw(); }));
    list.replaceChildren(...order.map((s, i) => el('li', { class: 'order-row', 'data-testid': `order-${s}` }, [el('span', { class: 'order-name', text: FM(`order.names.${s}`) }), mover(s, UP, i === 0), mover(s, DOWN, i === order.length - 1)])));
    refocus();
  };
  const reset = textButton(FM('order.reset'), 'order-reset', () => actions.reorder(resetSections, view.all));
  draw();
  const head = el('h3', { class: 'setting-head', 'data-testid': 'text-order', text: FM('order.heading') });
  return { nodes: [head, el('p', { class: 'muted', text: FM('order.what') }), el('div', { class: 'style-field' }, [el('span', { text: FM('style.applyTo') }), scope]), list, el('div', { class: 'style-foot' }, [reset])], update: draw };
}
