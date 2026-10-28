/** Applies an AC-28/29 sidebar mockup (A, B or C) to the live page by moving the real nodes. */
export function mockup(side: string): void {
  const q = (id: string): HTMLElement => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const ICON: Record<string, string> = {
    all: '<rect x="8" y="3" width="12" height="15" rx="1.5"/><path d="M4 7v12.5A1.5 1.5 0 0 0 5.5 21H16"/>',
    form: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
    drafts: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>',
    ai: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M12 8.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/><path d="M9 2.5V5M15 2.5V5M9 19v2.5M15 19v2.5M2.5 9H5M2.5 15H5M19 9h2.5M19 15h2.5"/>',
    previews: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
    configs: '<path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/>',
    fold: '<path d="M14.5 6.5L9 12l5.5 5.5"/>',
  };
  const svg = (k: string): string => `<svg class="mk-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
  const main = document.querySelector('main') as HTMLElement;
  const controls = main.querySelector('.controls') as HTMLElement;
  const oldNav = q('section-nav');
  const promptBox = document.getElementById('generate') as HTMLElement;
  const configBox = document.getElementById('saved-configs') as HTMLElement;
  const phone = innerWidth < 1024;

  const hide = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
  const css = mk('style', '');
  css.textContent = [
    '.mk-rail{display:flex;gap:2px;background:var(--surface);z-index:6}.mk-rail ul{list-style:none;margin:0;padding:0;display:flex;gap:2px}',
    '.mk-rail a,.mk-rail .mk-fold{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;min-height:44px;min-width:44px;padding:0 12px;border-radius:8px;color:var(--text);cursor:pointer;font-size:.92rem;white-space:nowrap}',
    '.mk-rail a:hover,.mk-rail .mk-fold:hover{background:var(--background)}.mk-rail a:focus-visible,.mk-rail button:focus-visible{outline:3px solid var(--focus-ring);outline-offset:-3px}',
    '.mk-rail a[aria-current]{background:var(--background);box-shadow:inset 3px 0 0 var(--text);font-weight:600}.mk-ic{flex:0 0 20px}',
    '.mk-rail .mk-fold svg{transition:transform .2s}.mk-rail[data-collapsed] .mk-fold svg{transform:rotate(180deg)}.mk-hide{display:none!important}',
    '@media (prefers-reduced-motion:reduce){.mk-rail *{transition:none!important}}',
  ].join('\n');
  const RAIL = 'body{padding-left:var(--mk-w)}.mk-rail{position:fixed;left:0;top:0;bottom:0;width:var(--mk-w);flex-direction:column;padding:12px 8px;border-right:1px solid var(--border);box-sizing:border-box}.mk-rail ul{flex-direction:column}.mk-rail .mk-fold{margin-top:auto}'
    + `.mk-rail[data-collapsed] .mk-l{${hide}}.mk-rail[data-collapsed] a,.mk-rail[data-collapsed] .mk-fold{justify-content:center;padding:0}`;
  const BAR = '.mk-rail{position:sticky;top:0;margin:0 -16px;padding:4px 12px;border-bottom:1px solid var(--border)}';
  const per: Record<string, string> = {
    A: `@media (min-width:1024px){:root{--mk-w:200px}:root:has(.mk-rail[data-collapsed]){--mk-w:64px}${RAIL}}`
      + `@media (max-width:1023px){${BAR}.mk-rail{align-items:start}.mk-rail ul{flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.mk-rail a{gap:6px;padding:0 6px;font-size:.85rem;white-space:normal;line-height:1.15}`
      + `.mk-rail .mk-fold{padding:0}.mk-rail .mk-fold .mk-l{${hide}}.mk-rail .mk-fold svg{transform:rotate(90deg)}.mk-rail[data-collapsed] .mk-fold svg{transform:rotate(-90deg)}`
      + `.mk-rail[data-collapsed] ul{grid-template-columns:repeat(6,minmax(0,1fr))}.mk-rail[data-collapsed] .mk-l{${hide}}.mk-rail[data-collapsed] a{justify-content:center;padding:0}}`,
    B: `@media (min-width:1024px){:root{--mk-w:88px}:root:has(.mk-rail[data-collapsed]){--mk-w:64px}${RAIL}.mk-rail a{flex-direction:column;justify-content:center;gap:2px;padding:6px 2px;font-size:.72rem;min-height:60px;text-align:center;white-space:normal}.mk-rail[data-collapsed] a{min-height:48px}.mk-rail .mk-fold .mk-l{${hide}}}`
      + `@media (max-width:1023px){${BAR}.mk-rail{padding:4px 8px}.mk-rail ul{flex:1;display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}.mk-rail a{flex-direction:column;justify-content:center;gap:2px;padding:4px 0;font-size:.68rem;min-height:52px;min-width:0;white-space:normal;text-align:center;line-height:1.1}.mk-rail a[aria-current]{box-shadow:inset 0 -3px 0 var(--text)}.mk-rail .mk-fold{padding:0;align-self:center}.mk-rail .mk-fold .mk-l{${hide}}.mk-rail .mk-fold svg{transform:rotate(90deg)}.mk-rail[data-collapsed] .mk-fold svg{transform:rotate(-90deg)}.mk-rail[data-collapsed] .mk-l{${hide}}.mk-rail[data-collapsed] a{min-height:44px}}`,
    C: `@media (min-width:1024px){:root{--mk-w:64px}${RAIL}.mk-rail:not([data-collapsed]){width:216px;box-shadow:4px 0 24px rgb(0 0 0 / .14)}}`
      + `@media (max-width:1023px){${BAR}.mk-rail{flex-direction:column}.mk-rail ul{flex-direction:column}.mk-rail[data-collapsed] ul{display:none}.mk-rail .mk-fold{justify-content:space-between;font-weight:600}.mk-rail .mk-fold svg{transform:rotate(-90deg)}.mk-rail[data-collapsed] .mk-fold svg{transform:rotate(90deg)}}`,
  };
  css.textContent += `\n${per[side]}`;
  document.head.append(css);

  const SECTIONS: [string, string, string][] = [['all-fliers', 'all', 'All fliers'], ['flier-form', 'form', 'Flier'], ['drafts-panel', 'drafts', 'Drafts'], ['generate', 'ai', 'Generate'], ['preview-grid', 'previews', 'Fliers'], ['saved-configs', 'configs', 'Saved configs']];
  const rail = mk('nav', 'mk-rail'); rail.setAttribute('aria-label', 'Sections'); rail.setAttribute('data-testid', 'section-nav');
  const ul = mk('ul', '');
  const panels: Record<string, HTMLElement> = { all: q('all-fliers'), form: q('flier-form'), drafts: q('drafts-panel'), ai: promptBox, configs: configBox };
  const show = (key: string): void => {
    if (side !== 'B' || !panels[key]) return;
    Object.entries(panels).forEach(([k, p]) => p.classList.toggle('mk-hide', k !== key));
    ul.querySelectorAll('a').forEach((a) => (a.dataset.key === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  };
  for (const [target, key, label] of SECTIONS) {
    const a = document.createElement('a');
    a.href = `#${target}`; a.dataset.key = key; a.title = label;
    a.setAttribute('data-testid', `nav-${key}`);
    a.innerHTML = `${svg(key)}<span class="mk-l">${label}</span>`;
    if (side === 'B') a.addEventListener('click', (e) => { if (panels[key]) { e.preventDefault(); show(key); } });
    const li = mk('li', ''); li.append(a); ul.append(li);
  }
  const fold = document.createElement('button');
  fold.type = 'button'; fold.className = 'mk-fold'; fold.setAttribute('data-testid', 'rail-toggle');
  const setFold = (c: boolean): void => {
    if (c) rail.setAttribute('data-collapsed', ''); else rail.removeAttribute('data-collapsed');
    fold.setAttribute('aria-expanded', String(!c));
    if (side === 'C' && phone) { fold.innerHTML = `<span>Sections</span>${svg('fold')}`; fold.setAttribute('aria-label', 'Sections'); return; }
    const word = c ? 'Show labels' : 'Collapse to icons';
    fold.innerHTML = `${svg('fold')}<span class="mk-l">${word}</span>`;
    fold.title = word; fold.setAttribute('aria-label', c ? 'Show section labels' : 'Collapse the sidebar to icons');
  };
  fold.addEventListener('click', () => setFold(!rail.hasAttribute('data-collapsed')));
  setFold(side === 'C');
  if (side === 'C' && phone) rail.append(fold, ul); else rail.append(ul, fold);
  (ul.querySelector('a') as HTMLElement).setAttribute('aria-current', 'location');

  oldNav.replaceWith(rail);
  controls.append(promptBox, configBox);
  if (side === 'B') show('form');
  (window as unknown as { mkShow: (k: string) => void }).mkShow = show;
}
