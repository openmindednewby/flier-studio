import { flierDocSchema, type FlierDoc } from '@dloizides/poster-render';
import { withBullets } from '../form/bullets';
import { applyText, blocksToText, type BlockText } from '../form/docEdit';
import { layoutsFor, withFormat } from '../form/layoutOptions';
import { FORM_GROUPS, LEAD_ROW, textFieldsInFlierOrder } from '../form/formGroups';
import { scalePercent } from '../form/pictureScale';
import { DocPicker, anchorOptions, schemaOptions } from '../form/schemaOptions';
import { FM } from '../i18n/fm';
import { foldToggle } from './collapsible';
import { addFormTools } from './formTools';
import { freeLinesBox } from './freeLinesView';
import { button, el, fileButton, labelled } from './dom';
import { UploadKind } from './UploadKind';

export interface FormActions {
  change(doc: FlierDoc): void;
  upload(kind: UploadKind, file: File): void;
  removeBackground(): void;
  remove(): void;
  restyleAll(edit: (doc: FlierDoc) => FlierDoc): void;
}

const PICKERS: readonly DocPicker[] = [DocPicker.Format, DocPicker.Layout, DocPicker.Palette, DocPicker.Fonts, DocPicker.Background];
const SINGLE: readonly (keyof BlockText)[] = ['title', 'titleBottom', 'script', 'includesHeading'];
const MULTI: readonly (keyof BlockText)[] = ['venue', 'schedule', 'prices', 'includesItems', 'items', 'footer'];
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
    const body = el('div', { class: 'fold-body' }, rows.map((row) => el('div', { class: 'row', 'data-field': row.join(' ') }, row.map((key) => controls[key]))));
    const toggle = foldToggle(body, { id: `group-${group}`, title: FM(`form.groups.${group}`), testId: `group-toggle-${group}`, className: 'group-toggle' });
    return el('div', { class: 'group', role: 'group', 'aria-labelledby': id }, [el('h3', { id }, [toggle]), body]);
  });
}

function picker(p: DocPicker, doc: FlierDoc): HTMLSelectElement {
  if (p !== DocPicker.Layout) return select(schemaOptions(p), String(doc[p]), `pick-${p}`);
  return select(layoutsFor(doc.format).map((e) => e.id), doc.layout, `pick-${p}`, (id) => FM(`layouts.${id}`));
}

function cutoutButton(doc: FlierDoc, actions: FormActions): HTMLButtonElement {
  const node = button('form.removeBackground', 'remove-background', () => actions.removeBackground());
  node.disabled = doc.picture === undefined;
  return node;
}

/** The flier form; every control reads and writes the FlierDoc of the selected flier. */
export function renderForm(container: HTMLElement, doc: FlierDoc, position: [number, number], actions: FormActions): void {
  const pickers = Object.fromEntries(PICKERS.map((p) => [p, picker(p, doc)])) as Record<DocPicker, HTMLSelectElement>;
  const anchor = select(anchorOptions(), doc.picture?.anchor ?? '', 'pick-anchor', (o) => FM(`form.anchors.${o}`));
  const scale = el('input', { type: 'range', min: String(scaleSchema?.minimum ?? 0), max: String(scaleSchema?.maximum ?? 1), step: SCALE_STEP, 'data-testid': 'pick-scale' });
  scale.value = String(doc.picture?.scale ?? 1);
  const scaleValue = el('output', { 'data-testid': 'pick-scale-value', text: scalePercent(Number(scale.value)) });
  scale.addEventListener('input', () => { scaleValue.textContent = scalePercent(Number(scale.value)); });
  const live = { doc };
  const texts = textControls(blocksToText(doc));
  const bullets = el('input', { type: 'checkbox', 'data-testid': 'field-bullets', 'aria-description': FM('hint.field', FM('form.bullets')) });
  bullets.checked = doc.bullets !== false;
  const read = (): FlierDoc => {
    const values = Object.fromEntries(Object.entries(texts).map(([k, c]) => [k, c.value])) as unknown as BlockText;
    const next = { ...withBullets(applyText(live.doc, values), bullets.checked), ...Object.fromEntries(PICKERS.map((p) => [p, pickers[p].value])) } as FlierDoc;
    const shaped = withFormat(next, next.format);
    if (shaped.picture) shaped.picture = { ...shaped.picture, anchor: anchor.value as typeof shaped.picture.anchor, scale: Number(scale.value) };
    return shaped;
  };
  container.oninput = (): void => actions.change(read());
  const host = {
    doc: (): FlierDoc => live.doc,
    set: (next: FlierDoc): void => { live.doc = next; actions.change(read()); },
    apply: (edit: (d: FlierDoc) => FlierDoc, everyFlier: boolean): void => { live.doc = edit(live.doc); if (everyFlier) actions.restyleAll(edit); else actions.change(read()); },
    count: position[1],
  };
  const controls: Record<string, HTMLElement> = {
    ...Object.fromEntries(PICKERS.map((p) => [p, labelled(`form.${p}`, pickers[p])])),
    ...Object.fromEntries([...SINGLE, ...MULTI].map((key) => [key, labelled(`form.${key}`, texts[key])])),
    bullets: el('label', { class: 'check-row' }, [bullets, el('span', { text: FM('form.bullets') })]),
    lines: freeLinesBox(host),
    anchor: labelled('form.anchor', anchor),
    scale: labelledValue('form.scale', scale, scaleValue),
    picture: fileButton('form.picture', 'upload-picture', 'image/*', (f) => actions.upload(UploadKind.Picture, f)),
    cutout: cutoutButton(doc, actions),
    logo: fileButton('form.logo', 'upload-logo', 'image/*', (f) => actions.upload(UploadKind.Logo, f)),
  };
  const body = el('div', { class: 'fold-body' }, [
    el('div', { class: 'row' }, LEAD_ROW.map((key) => controls[key])),
    el('p', { class: 'muted', text: FM('form.editing', String(position[0]), String(position[1])) }),
    ...groups(controls),
    el('div', { class: 'row actions' }, [button('form.remove', 'remove-flier', actions.remove)]),
  ]);
  container.replaceChildren(el('h2', { class: 'fold-head' }, [foldToggle(body, { id: 'flier-form', title: FM('form.heading') })]), body);
  addFormTools(body, host);
}

/** AC-49: re-sorts the text fields to the selected flier's top-to-bottom order, keeping focus where it was. */
export function sortTextFields(container: HTMLElement, drawn: readonly string[]): void {
  const rows = textFieldsInFlierOrder(drawn).map((f) => container.querySelector<HTMLElement>(`.row[data-field="${f}"]`)).filter((n): n is HTMLElement => n !== null);
  const shown = [...(rows[0]?.parentElement?.children ?? [])].filter((n) => rows.includes(n as HTMLElement));
  if (shown.every((n, i) => n === rows[i])) return;
  const active = document.activeElement instanceof HTMLElement && container.contains(document.activeElement) ? document.activeElement : null;
  rows[0]?.parentElement?.append(...rows);
  active?.focus({ preventScroll: true });
}

const INITIAL_FOCUS = ['field-title', 'flier-form-toggle'];

/** Focuses Title, or the Flier header toggle when the viewer folded the form. */
export function focusInitial(container: HTMLElement): void {
  const shown = INITIAL_FOCUS.map((id) => container.querySelector<HTMLElement>(`[data-testid="${id}"]`)).find((n) => n !== null && n.getClientRects().length > 0);
  shown?.focus({ preventScroll: true });
}
