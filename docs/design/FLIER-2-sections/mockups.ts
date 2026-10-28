/** Option mockups applied to the live page (00f0f12) in the browser; they move the real nodes so testids and handlers stay. */
export function mockup(side: string): void {
  const q = <T extends HTMLElement>(id: string): T => document.querySelector(`[data-testid="${id}"]`) as T;
  const card = q('all-fliers');
  const body = card.querySelector('.fold-body') as HTMLElement;
  const head = card.querySelector('h2') as HTMLElement;
  const note = body.querySelector('p') as HTMLElement;
  const row = q('all-fliers-row');
  const theme = q<HTMLLabelElement>('theme-row');
  const scopeLabel = q('pick-scope').closest('label') as HTMLLabelElement;
  const add = q('add-flier');
  const dl = q('download-all');
  const oldHead = dl.parentElement as HTMLElement;
  const css = document.createElement('style');
  css.textContent = [
    '.mk-head{display:flex;align-items:center;gap:12px;margin:0}.mk-head>.fold-toggle{flex:1 1 auto;width:auto;min-width:0;height:46px;padding-block:0;white-space:nowrap}.mk-head>[data-testid=download-all]{flex:0 0 auto;width:auto;padding-inline:16px;height:46px;margin:0;white-space:nowrap}',
    '@media (max-width:599px){.mk-head{flex-wrap:wrap}.mk-head>[data-testid=download-all]{flex:1 1 100%;order:2}}',
    '.mk-secs{display:grid;gap:16px;grid-template-columns:1fr}.mk-sec{display:grid;gap:8px;align-content:start;min-width:0}',
    '.mk-sec>h3{margin:0;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;line-height:20px;height:20px}',
    '.mk-sec label>span:first-child,.mk-panel label>span:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
    '.mk-sec label{display:block}.mk-sec select,.mk-sec button,.mk-panel select{width:100%}',
    '.mk-acts{display:flex;gap:8px}.mk-acts>button{flex:1 1 0}',
    '@media (min-width:900px){.mk-secs{grid-template-columns:1fr 1.4fr .9fr}}',
    '.mk-list{display:grid;border-top:1px solid var(--border)}.mk-item{border-bottom:1px solid var(--border)}',
    '.mk-dis{display:flex;width:100%;min-height:48px;align-items:center;gap:12px;background:transparent;border:0;border-radius:0;padding:4px;font:inherit;color:inherit;text-align:left;cursor:pointer}',
    '.mk-dis>b{font-weight:600;flex:0 0 auto}.mk-dis>span{margin-left:auto;opacity:.75;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
    '.mk-dis::after{content:"";flex:0 0 auto;width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg);margin-right:6px}',
    '.mk-panel{padding:0 4px 12px}',
    '.mk-strip{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 0}',
    '.mk-strip>.mk-cell{display:grid;gap:4px;padding:0 16px;border-left:1px solid var(--border);min-width:0}',
    '.mk-strip>.mk-cell:first-child{padding-left:0;border-left:0}.mk-strip label{display:grid;gap:4px}',
    '@media (max-width:899px){.mk-strip{display:grid}.mk-strip>.mk-cell{padding:12px 0 0;border-left:0;border-top:1px solid var(--border)}.mk-strip>.mk-cell:first-child{padding-top:0;border-top:0}.mk-strip select,.mk-strip button{width:100%}}',
  ].join('\n');
  document.head.append(css);
  const drafts = q('drafts-panel');
  if (side === 'B' && innerWidth >= 900) (document.querySelector('main .controls') as HTMLElement).append(drafts);
  else { const s = document.createElement('style'); s.textContent = '@media (min-width:900px){.previews{position:static;max-height:none;overflow:visible}}'; document.head.append(s); }
  head.classList.add('mk-head');
  head.append(dl);
  oldHead.remove();
  const sec = (title: string, ...kids: HTMLElement[]): HTMLElement => {
    const s = document.createElement('div');
    s.className = 'mk-sec';
    s.setAttribute('role', 'group');
    const h = document.createElement('h3');
    h.textContent = title;
    s.append(h, ...kids);
    return s;
  };
  if (side === 'A') {
    const secs = document.createElement('div');
    secs.className = 'mk-secs row';
    secs.setAttribute('data-testid', 'all-fliers-row');
    const acts = document.createElement('div');
    acts.className = 'mk-acts';
    acts.append(add);
    secs.append(sec('Theme', theme), sec('Shared text edits', scopeLabel), sec('Fliers', acts));
    body.replaceChildren(note, secs);
    row.remove();
  }
  if (side === 'B') {
    const list = document.createElement('div');
    list.className = 'mk-list';
    list.setAttribute('data-testid', 'all-fliers-row');
    const txt = (id: string): string => q<HTMLSelectElement>(id).selectedOptions[0]?.textContent ?? '';
    const item = (title: string, value: () => string, ctrl: HTMLElement, id: string): HTMLElement => {
      const it = document.createElement('div');
      it.className = 'mk-item';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mk-dis';
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-controls', id);
      b.setAttribute('data-testid', `${id}-toggle`);
      const t = document.createElement('b');
      t.textContent = title;
      const v = document.createElement('span');
      v.textContent = value();
      b.append(t, v);
      const p = document.createElement('div');
      p.className = 'mk-panel';
      p.id = id;
      p.hidden = true;
      p.append(ctrl);
      b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(open)); p.hidden = !open; });
      ctrl.addEventListener('change', () => { v.textContent = value(); });
      it.append(b, p);
      return it;
    };
    const addRow = document.createElement('div');
    addRow.className = 'row';
    addRow.style.marginTop = '12px';
    addRow.append(add);
    list.append(item('Theme', () => txt('pick-theme'), theme, 'sec-theme'), item('Shared text edits', () => txt('pick-scope').replace(/ \(.*/, ''), scopeLabel, 'sec-scope'));
    body.replaceChildren(note, list, addRow);
    row.remove();
  }
  if (side === 'C') {
    const strip = document.createElement('div');
    strip.className = 'mk-strip row';
    strip.setAttribute('data-testid', 'all-fliers-row');
    const cell = (k: HTMLElement): HTMLElement => { const c = document.createElement('div'); c.className = 'mk-cell'; c.append(k); return c; };
    strip.append(cell(theme), cell(scopeLabel), cell(add));
    body.replaceChildren(strip, note);
    row.remove();
  }
}
