import { flierDocSchema, type FlierDoc } from '@dloizides/poster-render';
import { applyText, blocksToText, type BlockText } from '../form/docEdit';
import { EditScope } from '../form/EditScope';
import { layoutsFor, withFormat } from '../form/layoutOptions';
import { FORM_GROUPS } from '../form/formGroups';
import { scalePercent } from '../form/pictureScale';
import { DocPicker, anchorOptions, schemaOptions } from '../form/schemaOptions';
import { FM } from '../i18n/fm';
import { button, el, fileButton, labelled } from './dom';
import { UploadKind } from './UploadKind';

export interface FormActions {
  change(doc: FlierDoc): void;
  upload(kind: UploadKind, file: File): void;
  add(): void;
  remove(): void;
  scope(): EditScope;
  setScope(scope: EditScope): void;
}

const PICKERS: readonly DocPicker[] = [DocPicker.Format, DocPicker.Layout, DocPicker.Palette, DocPicker.Fonts, DocPicker.Background];
const SINGLE: readonly (keyof BlockText)[] = ['title', 'titleBottom', 'script', 'includesHeading', 'footer'];
const MULTI: readonly (keyof BlockText)[] = ['venue', 'schedule', 'prices', 'includesItems', 'items'];
const scaleSchema = flierDocSchema.properties?.picture?.properties?.scale;
const SCALE_STEP = '0.05';

function select(options: readonly string[], value: string, testId: string, label: (o: string) => string = (o) => o): HTMLSelectElement {
  const node = el('select', { 'data-testid': testId });
  node.append(...options.map((o) => el('option', { value: o, text: label(o) })));
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

function labelledValue(labelKey: string, control: HTMLInputElement, value: HTMLOutputElement): HTMLLabelElement {
  const nameId = `label-${labelKey.replace('.', '-')}`;
  control.setAttribute('aria-description', FM('hint.field', FM(labelKey)));
  control.setAttribute('aria-labelledby', nameId);
  return el('label', {}, [el('span', { class: 'label-head' }, [el('span', { id: nameId, text: FM(labelKey) }), value]), control]);
}

function groups(controls: Record<string, HTMLElement>): HTMLElement[] {
  return FORM_GROUPS.map(({ group, rows }) => {
    const id = `form-group-${group}`;
    return el('div', { class: 'group', role: 'group', 'aria-labelledby': id }, [
      el('h3', { id, text: FM(`form.groups.${group}`) }),
      ...rows.map((row) => el('div', { class: 'row' }, row.map((key) => controls[key]))),
    ]);
  });
}

function picker(p: DocPicker, doc: FlierDoc): HTMLSelectElement {
  if (p !== DocPicker.Layout) return select(schemaOptions(p), String(doc[p]), `pick-${p}`);
  return select(layoutsFor(doc.format).map((e) => e.id), doc.layout, `pick-${p}`, (id) => FM(`layouts.${id}`));
}

/** The flier form; every control reads and writes the FlierDoc of the selected flier. */
export function renderForm(container: HTMLElement, doc: FlierDoc, position: [number, number], actions: FormActions): void {
  const pickers = Object.fromEntries(PICKERS.map((p) => [p, picker(p, doc)])) as Record<DocPicker, HTMLSelectElement>;
  const anchor = select(anchorOptions(), doc.picture?.anchor ?? '', 'pick-anchor', (o) => FM(`form.anchors.${o}`));
  const scale = el('input', { type: 'range', min: String(scaleSchema?.minimum ?? 0), max: String(scaleSchema?.maximum ?? 1), step: SCALE_STEP, 'data-testid': 'pick-scale' });
  scale.value = String(doc.picture?.scale ?? 1);
  const scaleValue = el('output', { 'data-testid': 'pick-scale-value', text: scalePercent(Number(scale.value)) });
  scale.addEventListener('input', () => { scaleValue.textContent = scalePercent(Number(scale.value)); });
  const texts = textControls(blocksToText(doc));
  const read = (): FlierDoc => {
    const values = Object.fromEntries(Object.entries(texts).map(([k, c]) => [k, c.value])) as unknown as BlockText;
    const next = { ...applyText(doc, values), ...Object.fromEntries(PICKERS.map((p) => [p, pickers[p].value])) } as FlierDoc;
    const shaped = withFormat(next, next.format);
    if (shaped.picture) shaped.picture = { ...shaped.picture, anchor: anchor.value as typeof shaped.picture.anchor, scale: Number(scale.value) };
    return shaped;
  };
  container.oninput = (): void => actions.change(read());
  const scope = select([EditScope.This, EditScope.All], actions.scope(), 'pick-scope', (o) => FM(`form.scopes.${o}`));
  scope.addEventListener('change', () => actions.setScope(scope.value as EditScope));
  const controls: Record<string, HTMLElement> = {
    ...Object.fromEntries(PICKERS.map((p) => [p, labelled(`form.${p}`, pickers[p])])),
    ...Object.fromEntries([...SINGLE, ...MULTI].map((key) => [key, labelled(`form.${key}`, texts[key])])),
    anchor: labelled('form.anchor', anchor),
    scale: labelledValue('form.scale', scale, scaleValue),
    picture: fileButton('form.picture', 'upload-picture', 'image/*', (f) => actions.upload(UploadKind.Picture, f)),
    logo: fileButton('form.logo', 'upload-logo', 'image/*', (f) => actions.upload(UploadKind.Logo, f)),
  };
  container.replaceChildren(
    el('h2', { text: FM('form.heading') }),
    el('p', { class: 'muted', text: FM('form.editing', String(position[0]), String(position[1])) }),
    el('div', { class: 'row' }, [labelled('form.scope', scope)]),
    ...groups(controls),
    el('div', { class: 'row actions' }, [button('form.add', 'add-flier', actions.add), button('form.remove', 'remove-flier', actions.remove)]),
  );
}

export function focusTitle(container: HTMLElement): void {
  container.querySelector<HTMLInputElement>('[data-testid="field-title"]')?.focus({ preventScroll: true });
}
