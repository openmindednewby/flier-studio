import { FM } from '../i18n/fm';
import { el, textButton } from './dom';

const MAX_SWATCHES = 5;

/** A row of toggle buttons; each button's test id is `${testId}-${value}`, pressed when its value is in `on`. */
export function styleSegment(options: readonly (readonly [string, string])[], on: string | readonly string[], testId: string, pick: (value: string) => void): HTMLElement {
  const pressed = typeof on === 'string' ? [on] : on;
  return el('div', { class: 'style-seg', role: 'group' }, options.map(([value, label]) => {
    const node = textButton(label, `${testId}-${value}`, () => pick(value));
    node.setAttribute('aria-pressed', String(pressed.includes(value)));
    return node;
  }));
}

export function styleSelect(options: readonly (readonly [string, string])[], value: string, testId: string, pick: (value: string) => void): HTMLSelectElement {
  const node = el('select', { 'data-testid': testId, 'aria-description': FM('hint.field', testId) });
  node.append(...options.map(([v, label]) => el('option', { value: v, text: label })));
  node.value = value;
  node.addEventListener('change', () => pick(node.value));
  return node;
}

/** The palette colours as round swatches plus a Custom colour picker. */
export function styleSwatches(colours: readonly string[], now: string | undefined, pick: (colour: string, testId: string) => void, theme?: string): HTMLElement {
  const swatches = colours.slice(0, MAX_SWATCHES).map((colour, i) => {
    const testId = `style-swatch-${String(i + 1)}`;
    const node = textButton('', testId, () => pick(colour, testId), 'swatch');
    node.setAttribute('aria-label', FM('style.swatch', String(i + 1)));
    node.setAttribute('aria-pressed', String(now?.toLowerCase() === colour.toLowerCase()));
    node.style.background = colour;
    return node;
  });
  const custom = el('input', { type: 'color', 'data-testid': 'style-color', 'aria-label': FM('style.custom'), 'aria-description': FM('hint.field', FM('style.custom')) });
  const shown = now ?? theme;
  if (shown !== undefined) custom.value = shown;
  custom.addEventListener('change', () => pick(custom.value, 'style-color'));
  return el('div', { class: 'style-swatches' }, [...swatches, el('label', { class: 'style-custom' }, [el('span', { text: FM('style.custom') }), custom])]);
}
