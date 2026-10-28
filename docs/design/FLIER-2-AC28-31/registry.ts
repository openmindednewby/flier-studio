/** Applies the AC-30/31 All fliers settings registry mockup to the live page. */
export function registry(side: string): void {
  const q = (id: string): HTMLElement => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const count = [...document.querySelectorAll('[data-testid]')].filter((n) => /^preview-\d+$/.test(n.getAttribute('data-testid') ?? '')).length;
  const css = mk('style', '');
  css.textContent = [
    '.mk-reg{display:grid;gap:12px}.mk-gh{margin:8px 0 0;font-size:.8rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-secondary)}',
    '.mk-set{display:grid;gap:4px;min-width:0}.mk-set>span:first-child{font-weight:600}.mk-what{display:block;font-size:.85rem;line-height:1.35;color:var(--text-secondary)}',
    '.mk-set select{width:100%;min-height:44px}.mk-ai-line{margin:0;font-size:.9rem}.mk-ai-line a{color:var(--text);font-weight:600}',
    '.mk-fields{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;margin:0;padding:10px 12px;border:1px solid var(--border);border-radius:8px}',
    '.mk-fields dt{font-weight:600}.mk-fields dd{margin:0;min-width:0;overflow-wrap:anywhere;color:var(--text-secondary)}.mk-scope-state{margin:0;font-size:.85rem;color:var(--text-secondary)}',
    '@media (min-width:480px){.mk-reg.list .mk-set{grid-template-columns:minmax(0,1fr) minmax(168px,46%);align-items:center;column-gap:12px;padding:6px 0;border-bottom:1px solid var(--border)}',
    '.mk-reg.list .mk-set>span:first-child{grid-column:1}.mk-reg.list .mk-what{grid-column:1}.mk-reg.list select{grid-column:2;grid-row:1/span 2}',
    '.mk-reg.list .mk-custom{grid-template-columns:1fr}}',
  ].join('\n');
  document.head.append(css);

  const row = q('all-fliers-row');
  const body = row.parentElement as HTMLElement;
  const note = body.querySelector(':scope > p.muted') as HTMLElement | null;
  if (note) note.textContent = `Every setting here changes all ${count} fliers. A flier's own Layout card can still override it.`;
  const what = (t: string): HTMLElement => mk('small', 'mk-what', t);

  const theme = q('theme-row');
  theme.classList.add('mk-set');
  (theme.firstElementChild as HTMLElement).after(what('Colours, fonts and the picture style of every flier'));
  const clone = (id: string, name: string, desc: string, tid: string): HTMLElement => {
    const src = q(id) as HTMLSelectElement;
    const sel = document.createElement('select');
    sel.setAttribute('data-testid', tid);
    const keep = document.createElement('option'); keep.textContent = "Each flier's own"; sel.append(keep);
    [...src.options].forEach((o) => sel.append(new Option(o.textContent ?? '', o.value)));
    const l = mk('label', 'mk-set'); l.append(mk('span', '', name), what(desc), sel); return l;
  };
  const custom = mk('div', 'mk-set mk-custom'); custom.setAttribute('data-testid', 'all-custom-layouts');
  custom.append(mk('span', '', 'Custom layouts'), what('None saved yet. A layout you save from a Flier card shows up here, ready to put on every flier.'));
  const ai = mk('p', 'mk-ai-line'); ai.setAttribute('data-testid', 'all-ai-line');
  const link = document.createElement('a'); link.href = '#generate'; link.textContent = 'describe the look in Generate';
  ai.append('The on-device AI can set any of these: ', link, '.');

  const scope = q('pick-scope') as HTMLSelectElement;
  const scopeLabel = scope.closest('label') as HTMLElement;
  scopeLabel.classList.add('mk-set');
  (scopeLabel.firstElementChild as HTMLElement).textContent = 'Edits to these fields change';
  const val = (id: string): string => ((q(id) as HTMLInputElement | null)?.value ?? '').trim();
  const levels = val('field-schedule').split('\n').map((l) => l.split('|')[0].trim()).filter(Boolean).slice(0, 3).join(', ');
  const fields = mk('dl', 'mk-fields'); fields.setAttribute('data-testid', 'shared-fields');
  for (const [k, v] of [['Footer', val('field-footer')], ['Level names', levels], ['Class price', val('field-prices').split('\n')[0].split('|').map((p) => p.trim()).filter(Boolean).join(' ')]]) fields.append(mk('dt', '', k), mk('dd', '', v || 'Empty on this flier'));
  const state = mk('p', 'mk-scope-state'); state.setAttribute('data-testid', 'shared-state');
  const say = (): void => { state.textContent = scope.value === 'all' ? `On: these 3 fields read the same on all ${count} fliers.` : 'Off: editing them changes only the selected flier.'; };
  scope.addEventListener('change', say); say();

  const reg = mk('div', `mk-reg ${side === 'A' ? 'stack' : 'list'}`); reg.setAttribute('data-testid', 'all-fliers-row'); reg.dataset.registry = 'settings';
  reg.append(mk('h3', 'mk-gh', 'Look of every flier'), theme,
    clone('pick-layout', 'Layout', 'Where the title, pictures and schedule sit', 'all-layout'),
    clone('pick-palette', 'Colours', 'Background, text and accent colours', 'all-palette'),
    clone('pick-fonts', 'Fonts', 'Title and body typefaces', 'all-fonts'),
    custom, ai,
    mk('h3', 'mk-gh', 'Shared text'), scopeLabel, fields, state);
  row.replaceWith(reg);
}
