/** Adds the AC-40 Style control to every text field and exposes window.mkStyleOpen to open it for one field. */
export function styleTools(side: string): void {
  const KEYS = ['title', 'titleBottom', 'script', 'includesHeading', 'footer', 'venue', 'schedule', 'prices', 'includesItems', 'items'];
  const SWATCH = ['#2f566f', '#4f7d7a', '#958a80', '#9b6b63', '#e8dccb'];
  const q = (id: string): HTMLElement | null => document.querySelector(`[data-testid="${id}"]`);
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const btn = (text: string, testid: string, label?: string, pressed?: boolean): HTMLButtonElement => {
    const b = mk('button', '', text) as HTMLButtonElement; b.type = 'button'; if (testid) b.dataset.testid = testid; if (label) b.setAttribute('aria-label', label); if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed)); return b;
  };
  const css = mk('style', '');
  css.textContent = [
    '.mk-lh{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}.mk-lh>span:first-child{min-width:0;overflow-wrap:break-word}',
    '.mk-sty{width:auto!important;min-width:44px;min-height:44px;padding:0 10px;font-size:.85rem;gap:6px;flex:0 0 auto}.mk-sty[aria-expanded="true"]{border:2px solid var(--brand-fill);font-weight:600}',
    '.mk-sp{display:grid;gap:10px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);min-width:0;box-sizing:border-box}.mk-sp h4{margin:0;font-size:1rem}',
    '.mk-srow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:start}.mk-sf{display:grid;gap:4px;min-width:0}.mk-sf>span{font-size:.85rem;font-weight:600;line-height:1.3}',
    '.mk-sf select{width:100%;min-height:44px}.mk-step{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:4px;align-items:center}.mk-step button{width:44px;min-height:44px;padding:0}.mk-step output{text-align:center;font-variant-numeric:tabular-nums}',
    '.mk-sw{display:flex;flex-wrap:wrap;gap:6px}.mk-sw button{width:44px;min-height:44px;padding:0}.mk-sw button[data-c]{border-radius:50%}.mk-sw button[aria-pressed="true"]{outline:2px solid var(--text);outline-offset:2px}.mk-sw .mk-cust{width:auto;padding:0 10px}',
    '.mk-sseg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mk-sseg button{width:100%;min-height:44px;padding:0 4px}.mk-sseg.two{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.mk-sp button[aria-pressed="true"]:not([data-c]){border:2px solid var(--brand-fill);font-weight:600}.mk-sfoot{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center}.mk-sfoot button{width:auto}.mk-sfoot small{color:var(--text-secondary)}',
    '@media (max-width:599px){.mk-srow{grid-template-columns:minmax(0,1fr)}}',
    '.mk-sheet .mk-srow{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.mk-sheet{gap:8px;padding:10px 12px}.mk-sheet h4{font-size:.95rem}',
    '.mk-sheet{position:fixed;left:0;right:0;bottom:0;max-height:78vh;overflow:auto;z-index:9;border-radius:12px 12px 0 0;box-shadow:0 -4px 16px rgb(0 0 0/.18)}',
    '.mk-pop{position:absolute;z-index:8;width:360px;box-shadow:0 4px 16px rgb(0 0 0/.18)}',
  ].join('\n');
  document.head.append(css);
  const nameOf = (key: string): string => {
    const field = q(`field-${key}`); const label = field?.closest('label');
    const span = label?.querySelector(':scope > span, :scope > .label-head > span');
    return (span?.textContent ?? key).trim();
  };
  const NAMES: Record<string, string> = Object.fromEntries(KEYS.map((k) => [k, nameOf(k)]));
  for (const key of KEYS) {
    const field = q(`field-${key}`); const label = field?.closest('label'); if (!field || !label) continue;
    const head = label.querySelector(':scope > .label-head, :scope > span') as HTMLElement | null; if (!head) continue;
    const name = NAMES[key] ?? key;
    const b = btn('Style', `style-${key}`, `Style of ${name}: font, size, colour`);
    b.classList.add('mk-sty'); b.setAttribute('aria-expanded', 'false');
    b.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 19 9.5 5h1L16 19M6.3 14h7.4M17 19v-6.5a2.5 2.5 0 0 1 5 0V19"/></svg>');
    if (head.classList.contains('label-head')) { head.classList.add('mk-lh'); head.append(b); } else { const row = mk('span', 'mk-lh'); head.replaceWith(row); row.append(head, b); }
  }
  const panel = (key: string): HTMLElement => {
    const name = NAMES[key] ?? key; const p = mk('div', 'mk-sp'); p.dataset.testid = 'style-panel'; p.setAttribute('role', 'group'); p.setAttribute('aria-label', `Style of ${name}`);
    const seg = (labels: string[], on: string, cls = 'mk-sseg'): HTMLElement => { const g = mk('div', cls); for (const l of labels) g.append(btn(l, '', undefined, l === on)); return g; };
    const field = (label: string, control: HTMLElement): HTMLElement => { const f = mk('div', 'mk-sf'); f.append(mk('span', '', label), control); return f; };
    const font = mk('select', '') as HTMLSelectElement; for (const f of ['Theme: Oswald', 'Bebas Neue', 'Playfair Display', 'Great Vibes', 'Poppins']) font.append(new Option(f));
    const step = mk('div', 'mk-step'); step.append(btn('−', '', `Smaller ${name}`), mk('output', '', '100%'), btn('+', '', `Larger ${name}`));
    const sw = mk('div', 'mk-sw'); SWATCH.forEach((c, i) => { const s = btn('', '', `Colour ${String(i + 1)} of the palette`, i === 2); s.dataset.c = c; s.style.background = c; sw.append(s); }); const cust = btn('Custom', '', 'Custom colour'); cust.classList.add('mk-cust'); sw.append(cust);
    const spacing = mk('select', '') as HTMLSelectElement; for (const s of ['Normal', 'Tight', 'Wide', 'Wider']) spacing.append(new Option(s));
    const r1 = mk('div', 'mk-srow'); r1.append(field('Font', font), field('Size', step));
    const r2 = mk('div', 'mk-srow'); r2.append(field('Weight', seg(['Bold', 'Italic'], 'Bold', 'mk-sseg two')), field('Letter spacing', spacing));
    const foot = mk('div', 'mk-sfoot'); foot.append(btn('Reset to theme', 'style-reset'), mk('small', '', 'Theme switches keep this style.'));
    p.append(mk('h4', '', `Style: ${name}`), field('Apply to', seg(['This flier', 'All 4 fliers'], 'This flier', 'mk-sseg two')), r1, field('Colour', sw), r2, field('Alignment', seg(['Left', 'Centre', 'Right'], 'Left')), foot);
    return p;
  };
  (window as unknown as { mkStyleOpen: (k: string) => void }).mkStyleOpen = (key: string): void => {
    const b = q(`style-${key}`); const row = q(`field-${key}`)?.closest('.row') as HTMLElement | null; if (!b || !row) return;
    b.setAttribute('aria-expanded', 'true');
    const p = panel(key);
    if (side === 'A') row.after(p);
    if (side === 'B') {
      if (innerWidth < 1024) { p.classList.add('mk-sheet'); const mini = q('mini-preview')?.getBoundingClientRect(); if (mini && mini.height > 1 && mini.top < innerHeight) Object.assign(p.style, { bottom: `${String(Math.round(innerHeight - mini.top + 8))}px`, maxHeight: `${String(Math.round(mini.top - 24))}px`, borderRadius: '12px' }); document.body.append(p); }
      else { p.classList.add('mk-pop'); const r = b.getBoundingClientRect(); const rr = row.getBoundingClientRect(); Object.assign(p.style, { left: `${String(Math.round(rr.left + scrollX))}px`, width: `${String(Math.round(rr.width))}px`, top: `${String(Math.round(rr.bottom + scrollY + 8))}px` }); document.body.append(p); }
    }
    if (side === 'C') { q('line-toolbar')?.remove(); const edit = q('edit-1'); const card = q('preview-1'); if (card) { card.after(p); p.style.gridColumn = '1 / -1'; } else if (edit) edit.before(p); else row.after(p); p.querySelector('h4')?.after(mk('small', '', 'Marked on flier 1 with corners. Tap another line on the flier to style it.')); }
    (p.querySelector('select') as HTMLElement | null)?.focus();
  };
}
