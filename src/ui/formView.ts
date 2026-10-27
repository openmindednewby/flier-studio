import { flierDocSchema, type FlierDoc } from '@dloizides/poster-render';
import { applyText, blocksToText, type BlockText } from '../form/docEdit';
import { DocPicker, anchorOptions, schemaOptions } from '../form/schemaOptions';
import { FM } from '../i18n/fm';
import { button, el, fileButton, labelled } from './dom';
import { UploadKind } from './UploadKind';

export interface FormActions {
  change(doc: FlierDoc): void;
  upload(kind: UploadKind, file: File): void;
  add(): void;
  remove(): void;
}

const PICKERS: readonly DocPicker[] = [DocPicker.Format, DocPicker.Layout, DocPicker.Palette, DocPicker.Fonts, DocPicker.Background];
const SINGLE: readonly (keyof BlockText)[] = ['title', 'titleBottom', 'script', 'includesHeading', 'footer'];
const MULTI: readonly (keyof BlockText)[] = ['venue', 'schedule', 'prices', 'includesItems', 'items'];
const scaleSchema = flierDocSchema.properties?.picture?.properties?.scale;
const SCALE_STEP = '0.05';

function select(options: readonly string[], value: string, testId: string): HTMLSelectElement {
  const node = el('select', { 'data-testid': testId });
  node.append(...options.map((o) => el('option', { value: o, text: o })));
  node.value = value;
  return node;
}

function textControls(text: BlockText): Record<keyof BlockText, HTMLInputElement | HTMLTextAreaElement> {
  const controls = {} as Record<keyof BlockText, HTMLInputElement | HTMLTextAreaElement>;
  for (const key of SINGLE) controls[key] = el('input', { type: 'text', 'data-testid': `field-${key}` });
  for (const key of MULTI) controls[key] = el('textarea', { rows: '3', 'data-testid': `field-${key}` });
  for (const key of [...SINGLE, ...MULTI]) controls[key].value = text[key];
  return controls;
}

/** The flier form; every control reads and writes the FlierDoc of the selected flier. */
export function renderForm(container: HTMLElement, doc: FlierDoc, position: [number, number], actions: FormActions): void {
  const pickers = Object.fromEntries(PICKERS.map((p) => [p, select(schemaOptions(p), String(doc[p]), `pick-${p}`)])) as Record<DocPicker, HTMLSelectElement>;
  const anchor = select(anchorOptions(), doc.picture?.anchor ?? '', 'pick-anchor');
  const scale = el('input', { type: 'range', min: String(scaleSchema?.minimum ?? 0), max: String(scaleSchema?.maximum ?? 1), step: SCALE_STEP, 'data-testid': 'pick-scale' });
  scale.value = String(doc.picture?.scale ?? 1);
  const texts = textControls(blocksToText(doc));
  const read = (): FlierDoc => {
    const values = Object.fromEntries(Object.entries(texts).map(([k, c]) => [k, c.value])) as unknown as BlockText;
    const next = { ...applyText(doc, values), ...Object.fromEntries(PICKERS.map((p) => [p, pickers[p].value])) } as FlierDoc;
    if (next.picture) next.picture = { ...next.picture, anchor: anchor.value as typeof next.picture.anchor, scale: Number(scale.value) };
    return next;
  };
  container.oninput = (): void => actions.change(read());
  container.replaceChildren(
    el('h2', { text: FM('form.heading') }),
    el('p', { class: 'muted', text: FM('form.editing', String(position[0]), String(position[1])) }),
    el('div', { class: 'row' }, PICKERS.map((p) => labelled(`form.${p}`, pickers[p]))),
    el('div', { class: 'row' }, [labelled('form.anchor', anchor), labelled('form.scale', scale)]),
    el('div', { class: 'row' }, [
      fileButton('form.picture', 'upload-picture', 'image/*', (f) => actions.upload(UploadKind.Picture, f)),
      fileButton('form.logo', 'upload-logo', 'image/*', (f) => actions.upload(UploadKind.Logo, f)),
    ]),
    ...[...SINGLE, ...MULTI].map((key) => labelled(`form.${key}`, texts[key])),
    el('div', { class: 'row' }, [button('form.add', 'add-flier', actions.add), button('form.remove', 'remove-flier', actions.remove)]),
  );
}

export function focusTitle(container: HTMLElement): void {
  container.querySelector<HTMLInputElement>('[data-testid="field-title"]')?.focus({ preventScroll: true });
}
