import type { FlierDoc, LineStyle } from '@dloizides/poster-render';
import { percent, resetLines, restyle } from '../form/lineEdit';
import type { TextRole } from '../form/TextRole';
import { ROLE_LINES, TEXT_ROLES, rolesInFlierOrder, type RoleStyles } from '../form/textRoles';
import { FM } from '../i18n/fm';
import { el, textButton } from './dom';
import { styleFields, type StyleHost, type StyleTarget } from './stylePanel';
import { hushOutline, outlineOn } from './textOutline';

export interface RoleActions {
  roleStyles(): RoleStyles;
  setRoleStyles(next: RoleStyles): void;
  docs(): FlierDoc[];
  drawnRoles(): string[];
}

const nameOf = (role: TextRole): string => FM(`roles.names.${role}`);

function summary(style: LineStyle | undefined): string {
  if (style === undefined || Object.keys(style).length === 0) return FM('roles.theme');
  return FM('roles.summary', style.font ?? FM('style.themeFont'), percent(style.sizeScale ?? 1));
}

function roleHost(role: TextRole, actions: RoleActions): StyleHost {
  const lines = ROLE_LINES[role];
  const host: StyleHost = {
    doc: () => ({ ...actions.docs()[0], lineStyles: Object.fromEntries(lines.map((k) => [k, actions.roleStyles()[role]])) }),
    apply: (edit) => actions.setRoleStyles({ ...actions.roleStyles(), [role]: edit(host.doc()).lineStyles?.[lines[0]] ?? {} }),
    get count(): number { return actions.docs().length; },
  };
  return host;
}

function editor(role: TextRole, actions: RoleActions): HTMLElement {
  const target: StyleTarget = { key: role, name: nameOf(role), lines: ROLE_LINES[role] };
  const host = roleHost(role, actions);
  const box = el('div', { class: 'role-editor style-panel', id: 'role-editor', role: 'group', 'data-testid': 'role-editor', 'aria-label': FM('roles.editor', target.name) });
  const scope = { all: true, set: (): void => undefined };
  const draw = (focus: string): void => {
    const fields = styleFields(target, host, (patch, next) => {
      if (patch !== null) { hushOutline(); host.apply((d) => restyle(d, target.lines, patch), true); }
      draw(next);
    }, scope);
    const reset = textButton(FM('style.reset'), 'style-reset', () => { hushOutline(); host.apply((d) => resetLines(d, target.lines), true); draw('style-reset'); });
    box.replaceChildren(...fields.slice(1, -1), el('div', { class: 'style-foot' }, [reset, el('small', { class: 'muted', text: FM('roles.keeps') })]));
    if (focus !== '') box.querySelector<HTMLElement>(`[data-testid="${focus}"]`)?.focus();
  };
  draw('');
  outlineOn(box, target.lines, target.name);
  return box;
}

/** AC-44: every text role as a row, in the selected flier's drawn order (AC-49); one opens its editor for every flier. */
export function roleList(actions: RoleActions): { nodes: HTMLElement[]; update(): void } {
  const open = { role: '' };
  const rows = TEXT_ROLES.map((role) => {
    const meta = el('small', { class: 'role-meta muted', 'data-testid': `role-${role}-summary` });
    const row = el('button', { type: 'button', class: 'role-row', 'data-testid': `role-${role}`, 'aria-expanded': 'false', 'aria-controls': 'role-editor', 'aria-description': FM('roles.open', nameOf(role)) }, [el('span', { class: 'role-name', text: nameOf(role) }), meta]);
    outlineOn(row, ROLE_LINES[role], nameOf(role));
    return { role, row, meta };
  });
  rows.forEach(({ role, row }) => row.addEventListener('click', () => {
    document.getElementById('role-editor')?.remove();
    rows.forEach((r) => r.row.setAttribute('aria-expanded', 'false'));
    open.role = open.role === role ? '' : role;
    if (open.role === '') return;
    row.setAttribute('aria-expanded', 'true');
    row.after(editor(role, actions));
    document.querySelector<HTMLElement>('#role-editor [data-testid="style-font"]')?.focus();
  }));
  const what = el('p', { class: 'muted role-what', text: FM('roles.what') });
  const sort = (): void => {
    const order = rolesInFlierOrder(actions.drawnRoles());
    if (order.join() === rows.map((r) => r.role).join()) return;
    const sorted = order.map((role) => rows.find((r) => r.role === role) ?? rows[0]);
    const editorNode = document.getElementById('role-editor');
    sorted.reduce<HTMLElement>((anchor, r) => { anchor.after(r.row); return r.row; }, what);
    if (editorNode !== null) sorted.find((r) => r.role === open.role)?.row.after(editorNode);
    rows.splice(0, rows.length, ...sorted);
  };
  const update = (): void => { sort(); rows.forEach((r) => { r.meta.textContent = summary(actions.roleStyles()[r.role]); }); };
  update();
  const head = el('h3', { class: 'setting-head', 'data-testid': 'text-roles', text: FM('roles.heading') });
  return { nodes: [head, what, ...rows.map((r) => r.row)], update };
}
