import type { BuiltInTemplate } from '../templates/builtInTemplates';
import type { TemplatesActions } from '../templates/templateActions';
import type { Template } from '../templates/templateStore';
import { FM } from '../i18n/fm';
import { confirmDelete } from './confirmDialog';
import { el, textButton } from './dom';
import { THUMB_WIDTH } from './draftRow';

function useButton(name: string, testId: string, onUse: () => void): HTMLButtonElement {
  const use = textButton(FM('templates.use'), testId, onUse, 'primary');
  use.setAttribute('aria-label', FM('templates.useLabel', name));
  return use;
}

function labelled(button: HTMLButtonElement, label: string): HTMLButtonElement {
  button.setAttribute('aria-label', label);
  return button;
}

function thumbOrGap(template: { readonly name: string; readonly thumb?: string }): HTMLElement {
  return template.thumb === undefined || template.thumb === '' ? el('span', { class: 'template-gap' }) : el('img', { src: template.thumb, alt: FM('templates.thumb', template.name), width: String(THUMB_WIDTH) });
}

/** One built-in template: its name and Use. */
export function builtInRow(template: BuiltInTemplate, n: string, actions: TemplatesActions): HTMLLIElement {
  return el('li', { 'data-testid': `template-builtin-${n}` }, [
    thumbOrGap(template),
    el('span', { class: 'draft-name', 'data-testid': `template-builtin-name-${n}`, text: template.name }),
    useButton(template.name, `template-builtin-use-${n}`, () => actions.use(template.name, template.flier)),
  ]);
}

function renameInPlace(title: HTMLElement, template: Template, n: string, actions: TemplatesActions): void {
  const input = el('input', { type: 'text', class: 'draft-name-input', 'data-testid': `template-name-input-${n}`, 'aria-label': FM('templates.renameInput'), 'aria-description': FM('templates.renameHint') });
  input.value = template.name;
  let open = true;
  const finish = (save: boolean): void => {
    if (!open) return;
    open = false;
    input.remove();
    title.hidden = false;
    if (save && input.value.trim() !== template.name) actions.rename(template, input.value);
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
  title.hidden = true;
  title.after(input);
  input.focus();
  input.select();
}

function askDelete(template: Template, actions: TemplatesActions): void {
  confirmDelete({ title: FM('templates.confirmTitle', template.name), body: FM('templates.confirmBody'), keep: FM('templates.keep'), go: FM('templates.confirmGo') }, () => actions.remove(template));
}

/** One of the user's templates: thumbnail, name, Use, Rename and Delete. */
export function mineRow(template: Template, n: string, actions: TemplatesActions): HTMLLIElement {
  const title = el('span', { class: 'draft-name', 'data-testid': `template-name-${n}`, text: template.name });
  const rename = labelled(textButton(FM('templates.rename'), `template-rename-${n}`, () => renameInPlace(title, template, n, actions)), FM('templates.renameLabel', template.name));
  const remove = labelled(textButton(FM('templates.delete'), `template-delete-${n}`, () => askDelete(template, actions), 'danger'), FM('templates.deleteLabel', template.name));
  return el('li', { 'data-testid': `template-row-${n}` }, [
    thumbOrGap(template),
    el('div', { class: 'draft-main' }, [
      el('span', { class: 'draft-when' }, [title]),
      el('span', { class: 'draft-actions' }, [useButton(template.name, `template-use-${n}`, () => actions.use(template.name, template.flier)), rename, remove]),
    ]),
  ]);
}
