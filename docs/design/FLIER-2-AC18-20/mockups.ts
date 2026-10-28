/** Turns the live screen into option A, B or C by moving its real nodes; a mockup, never shipped. */
export function mockup(side: string): void {
  const q = <T extends Element = HTMLElement>(id: string): T => document.querySelector(`[data-testid="${id}"]`) as unknown as T;
  const mk = (tag: string, attrs: Record<string, string> = {}, kids: (Node | string)[] = []): HTMLElement => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => (k === 'text' ? (n.textContent = v) : n.setAttribute(k, v)));
    n.append(...kids);
    return n;
  };
  const btn = (text: string, id: string, cls = ''): HTMLElement => mk('button', { type: 'button', class: cls, 'data-testid': id, text });
  const count = document.querySelectorAll('[data-testid="preview-grid"] figure').length;
  const canvases = (): HTMLCanvasElement[] => [...document.querySelectorAll<HTMLCanvasElement>('[data-testid="preview-grid"] figure canvas')];
  const copy = (src: HTMLCanvasElement, w: number): HTMLCanvasElement => {
    const c = document.createElement('canvas');
    c.width = w * 2; c.height = Math.round((w * 2 * src.height) / src.width);
    c.getContext('2d')?.drawImage(src, 0, 0, c.width, c.height);
    c.style.width = `${String(w)}px`; c.style.height = 'auto';
    return c;
  };
  const form = '[data-testid="flier-form"]';
  document.head.append(mk('style', { text: `
    ${form} [data-testid="theme-row"], ${form} .row:has(> label > [data-testid="pick-scope"]), ${form} [data-testid="add-flier"] { display: none; }
    [data-testid="preview-grid"] figure .trim { cursor: pointer; }
    .mk-hint { margin: 4px 0 0; }
    .mk-drafts { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .mk-drafts li { display: grid; grid-template-columns: auto 1fr auto auto; gap: 8px; align-items: center; }
    .mk-drafts canvas { border: 1px solid var(--border); display: block; }
    .mk-strip { display: flex; gap: var(--gap); overflow-x: auto; padding-bottom: 4px; }
    .mk-strip li { grid-template-columns: auto; justify-items: start; min-width: 96px; }
    .mk-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .mk-chips button { width: auto; flex: 0 0 auto; }
    .mk-chips [aria-pressed="true"] { outline: 2px solid currentColor; outline-offset: 1px; }
    .mk-bar { position: sticky; top: 0; z-index: 2; }
    .mk-big { max-width: min(92vw, 720px); }
    .mk-big canvas { display: block; max-width: 100%; max-height: calc(100dvh - 300px); width: auto; height: auto; margin: 0 auto; }
  ` }));

  const label = (id: string): HTMLElement => q(id).closest('label') as HTMLElement;
  const themeLabel = label('pick-theme');
  const scopeLabel = label('pick-scope');
  label('pick-theme-scope').remove();
  const times = ['15:41', '15:38', '15:20'];
  const draftRows = (cls: string): HTMLElement => mk('ul', { class: `mk-drafts ${cls}`, 'data-testid': 'drafts-list' }, times.map((t, i) => mk('li', {}, [
    Object.assign(copy(canvases()[i], cls === 'mk-strip' ? 64 : 36), { ariaHidden: 'true' }),
    mk('span', {}, [mk('strong', { text: `Today ${t}` }), mk('br'), mk('span', { class: 'muted', text: `${String(count)} fliers` })]),
    btn('Restore', `draft-restore-${String(i + 1)}`),
    Object.assign(btn(i === 1 ? 'Starred' : 'Star', `draft-star-${String(i + 1)}`), { ariaPressed: String(i === 1) }),
  ])));
  const hint = mk('p', { class: 'muted mk-hint', 'data-testid': 'select-hint', text: 'Click a flier to edit it. Double-click to see it large.' });
  const previews = q('previews');
  const grid = q('preview-grid');
  grid.after(hint);

  if (side === 'A') {
    const card = mk('section', { class: 'card', 'data-testid': 'all-fliers' }, [
      mk('h2', { text: 'All fliers' }),
      mk('p', { class: 'muted', text: `Theme and these settings change all ${String(count)} fliers.` }),
      mk('div', { class: 'row' }, [themeLabel, scopeLabel]),
      mk('div', { class: 'row' }, [q('add-flier')]),
      mk('details', { open: '', 'data-testid': 'drafts-panel' }, [
        mk('summary', { text: 'Drafts on this device (12)' }),
        mk('div', { class: 'mk-chips' }, [Object.assign(btn('Favourites only (1)', 'drafts-favourites'), { ariaPressed: 'false' })]),
        draftRows(''),
      ]),
    ]);
    previews.querySelector('.row.head')?.after(card);
  }
  if (side === 'B') {
    const card = mk('section', { class: 'card', 'data-testid': 'all-fliers' }, [
      mk('h2', { text: `All ${String(count)} fliers` }),
      mk('div', { class: 'row' }, [themeLabel, scopeLabel]),
      mk('div', { class: 'row' }, [q('add-flier'), q('download-all')]),
      q('config-share').closest('.row') as HTMLElement,
    ]);
    q('flier-form').before(card);
    const config = q('config-name').closest('section') as HTMLElement;
    config.querySelector('h2')?.after(mk('div', { 'data-testid': 'drafts-panel' }, [
      mk('h3', { text: 'Drafts on this device' }),
      mk('div', { class: 'row', role: 'group', 'aria-label': 'Show' }, [Object.assign(btn('All drafts (12)', 'drafts-all'), { ariaPressed: 'true' }), Object.assign(btn('Favourites (1)', 'drafts-favourites'), { ariaPressed: 'false' })]),
      draftRows(''),
    ]));
  }
  if (side === 'C') {
    const pick = q<HTMLSelectElement>('pick-theme');
    const chips = mk('div', { class: 'mk-chips', role: 'group', 'aria-label': 'Theme for all fliers', 'data-testid': 'pick-theme' },
      [...pick.options].map((o) => Object.assign(btn(o.text, `theme-chip-${o.value}`), { ariaPressed: String(o.value === pick.value) })));
    themeLabel.remove();
    const bar = mk('section', { class: 'card mk-bar', 'data-testid': 'all-fliers' }, [
      mk('h2', { text: `All ${String(count)} fliers · theme` }), chips,
      mk('div', { class: 'row' }, [scopeLabel]),
      mk('div', { class: 'row' }, [q('add-flier'), q('download-all')]),
    ]);
    previews.querySelector('.row.head')?.after(bar);
    hint.after(mk('section', { class: 'card', 'data-testid': 'drafts-panel' }, [
      mk('h2', { text: 'Drafts on this device' }),
      mk('div', { class: 'mk-chips' }, [Object.assign(btn('All (12)', 'drafts-all'), { ariaPressed: 'true' }), Object.assign(btn('Favourites (1)', 'drafts-favourites'), { ariaPressed: 'false' })]),
      draftRows('mk-strip'),
    ]));
  }

  const enlarge = (fig: HTMLElement): void => {
    const src = fig.querySelector('canvas');
    const n = (fig.getAttribute('data-testid') ?? '').replace('preview-', '');
    if (!src) return;
    if (side === 'B') {
      const close = btn('Close', 'enlarge-close');
      const next = btn('Next flier', 'enlarge-next', 'primary');
      const dlg = mk('dialog', { class: 'import-dialog mk-big', 'data-testid': 'enlarge-dialog', 'aria-label': `Flier ${n} of ${String(count)}, large` }, [
        mk('h2', { text: `Flier ${n} of ${String(count)}` }), Object.assign(copy(src, src.width), { style: '' }),
        mk('div', { class: 'row' }, [btn('Previous', 'enlarge-prev'), next, btn(`Download flier ${n}`, 'enlarge-download'), close]),
      ]) as HTMLDialogElement;
      close.addEventListener('click', () => dlg.close());
      document.body.append(dlg);
      dlg.showModal();
      next.focus();
      return;
    }
    const sheet = q<HTMLDialogElement>('mini-sheet');
    const full = sheet.querySelector('canvas') as HTMLCanvasElement;
    full.width = src.width; full.height = src.height;
    full.getContext('2d')?.drawImage(src, 0, 0);
    sheet.setAttribute('aria-label', `Flier ${n}, full size`);
    if (side === 'C') q('mini-close').before(mk('div', { class: 'row' }, [mk('span', { class: 'muted', text: `Flier ${n} of ${String(count)} · Esc closes` }), btn(`Download flier ${n}`, 'enlarge-download')]));
    document.body.append(sheet);
    sheet.showModal();
    q('mini-close').focus();
  };
  grid.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const fig = t.closest('figure');
    if (fig && !t.closest('button')) (fig.querySelector('[data-testid^="edit-"]') as HTMLElement | null)?.click();
  });
  grid.addEventListener('dblclick', (e) => { const fig = (e.target as HTMLElement).closest('figure'); if (fig) enlarge(fig as HTMLElement); });
}
