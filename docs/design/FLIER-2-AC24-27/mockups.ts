/** AC-24..27 option mockups applied to the live page (ff3b43d); they move the real nodes, so testids and handlers stay. */
export function mockup(side: string): void {
  const q = (id: string): HTMLElement => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
  const main = document.querySelector('main') as HTMLElement;
  const header = document.querySelector('header') as HTMLElement;
  const [promptBox, formBox, configBox] = [...(main.querySelector('.controls') as HTMLElement).children] as HTMLElement[];
  const previews = q('previews');
  const allF = q('all-fliers');
  const drafts = q('drafts-panel');
  const dl = q('download-all');
  const dlRow = dl.parentElement as HTMLElement;
  const css = document.createElement('style');
  css.textContent = [
    '.mk-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.mk-top h1{min-width:0;flex:0 1 auto}.mk-top h1 svg{max-width:100%;height:auto;display:block}',
    '.mk-top [data-testid=download-all]{flex:0 0 auto;min-height:44px;max-width:52%;white-space:normal;line-height:1.2;margin:0}',
    '.mk-left{display:grid;gap:var(--gap);min-width:0;align-content:start}',
    '.mk-nav ul{list-style:none;margin:0;padding:0}.mk-nav a{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 12px;border-radius:8px;color:var(--text);text-decoration:none;white-space:nowrap}',
    '.mk-nav a:hover{background:var(--surface)}.mk-nav a:focus-visible{outline:2px solid var(--text);outline-offset:2px}.mk-nav .n{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--text-secondary)}',
    '.mk-nav a[aria-current]{background:var(--surface);box-shadow:inset 3px 0 0 var(--text);font-weight:600}',
    '.fold-head{margin:0}.mk-gt{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:44px;cursor:pointer;font-size:.8rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-secondary)}',
    '.mk-gt::after{content:"";width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin-right:6px}.mk-gt[aria-expanded=false]::after{transform:rotate(-45deg)}',
    '.mk-gt:focus-visible{outline:2px solid var(--text);outline-offset:2px;border-radius:4px}.group>h3{margin:0}.group{margin-top:4px}.mk-gb{display:grid;gap:12px}',
    '.mk-badge{display:inline-block;margin-left:8px;padding:1px 8px;border:1px solid var(--text);border-radius:999px;font-size:.72rem;font-weight:600;letter-spacing:.04em;vertical-align:middle}',
    '.mk-ai-note{margin-top:-4px}',
  ].join('\n');
  const perSide: Record<string, string> = {
    A: '.mk-nav li.sep{height:1px;background:var(--border);margin:6px 12px}.mk-nav ul{display:grid;gap:2px}'
      + '@media (min-width:1024px){header,main{max-width:1280px}main{grid-template-columns:168px minmax(340px,400px) minmax(0,1fr)}.mk-nav{position:sticky;top:16px;align-self:start}}'
      + '@media (max-width:1023px){.mk-nav ul{display:flex;flex-wrap:wrap;gap:4px 2px}.mk-nav li.sep{width:1px;height:auto;margin:10px 4px}.mk-nav a{padding:0 10px}.mk-nav .n{margin-right:-4px}}',
    B: '.mk-nav{position:sticky;top:0;z-index:5;background:var(--background);padding:6px 0;border-bottom:1px solid var(--border);overflow-x:auto}.mk-nav ul{display:flex;gap:4px}.mk-nav li.sep{display:none}.mk-nav .n{display:none}'
      + '.mk-nav a{border:1px solid var(--border);border-radius:999px;padding:0 14px}.mk-nav a[aria-current]{box-shadow:none;background:var(--text);color:var(--background);border-color:var(--text)}'
      + '@media (max-width:1023px){.mk-nav{margin:0 -16px;padding:6px 16px}}',
    C: '.mk-nav{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:8px}.mk-nav ul{display:grid;grid-template-columns:1fr 1fr;gap:4px}.mk-nav li.sep{display:none}'
      + '.mk-nav h2{margin:4px 12px 4px;font-size:.8rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-secondary)}.mk-nav a{white-space:normal}',
  };
  css.textContent += `\n${perSide[side]}`;
  document.head.append(css);

  const top = document.createElement('div');
  top.className = 'mk-top';
  header.prepend(top);
  top.append(header.querySelector('h1') as HTMLElement, dl);
  dlRow.remove();

  allF.id = 'mk-all'; formBox.id = 'mk-form'; drafts.id = 'mk-drafts'; promptBox.id = 'mk-ai'; configBox.id = 'mk-configs';
  q('preview-grid').id = 'mk-previews';

  const h2 = promptBox.querySelector('h2') as HTMLElement;
  if (side === 'A') h2.textContent = 'Generate with on-device AI';
  if (side === 'B') h2.textContent = 'Write it with AI, on your device';
  if (side === 'C') { const b = document.createElement('span'); b.className = 'mk-badge'; b.textContent = 'On-device AI'; h2.append(b); }
  const sub = document.createElement('p');
  sub.className = 'muted mk-ai-note';
  sub.setAttribute('data-testid', 'ai-note');
  sub.textContent = 'Runs in this browser with WebGPU; your text never leaves it. Without WebGPU, a keyword match fills the flier.';
  h2.after(sub);

  const formHead = formBox.querySelector('h2') as HTMLElement;
  const fBody = document.createElement('div');
  fBody.className = 'fold-body';
  fBody.id = 'mk-form-body';
  while (formHead.nextSibling) fBody.append(formHead.nextSibling);
  const fT = document.createElement('button');
  fT.type = 'button'; fT.className = 'fold-toggle'; fT.textContent = formHead.textContent; fT.setAttribute('aria-expanded', 'true'); fT.setAttribute('aria-controls', fBody.id); fT.setAttribute('data-testid', 'flier-form-toggle');
  fT.addEventListener('click', () => { const o = fT.getAttribute('aria-expanded') !== 'true'; fT.setAttribute('aria-expanded', String(o)); fBody.hidden = !o; });
  formHead.className = 'fold-head';
  formHead.replaceChildren(fT);
  formBox.append(fBody);

  formBox.querySelectorAll('.group').forEach((g, i) => {
    const h3 = g.querySelector('h3') as HTMLElement;
    const body = document.createElement('div');
    body.className = 'mk-gb'; body.id = `mk-gb-${i}`;
    while (h3.nextSibling) body.append(h3.nextSibling);
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mk-gt'; b.textContent = h3.textContent; b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-controls', body.id); b.setAttribute('data-testid', `group-toggle-${i}`);
    b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(o)); body.hidden = !o; });
    h3.replaceChildren(b);
    g.append(body);
    (g as HTMLElement).id = `mk-g${i}`;
  });

  const nav = document.createElement('nav');
  nav.className = 'mk-nav'; nav.setAttribute('aria-label', 'Sections'); nav.setAttribute('data-testid', 'section-nav');
  if (side === 'C') { const t = document.createElement('h2'); t.textContent = 'On this page'; nav.append(t); }
  const ul = document.createElement('ul');
  const links: [string, string][] = [['mk-all', 'All fliers'], ['mk-form', 'Flier'], ['mk-drafts', 'Drafts'], ['', ''], ['mk-ai', 'Generate'], ['mk-previews', 'Previews'], ['mk-configs', 'Saved configs']];
  let n = 0;
  for (const [href, text] of links) {
    const li = document.createElement('li');
    if (!href) { li.className = 'sep'; li.setAttribute('aria-hidden', 'true'); ul.append(li); continue; }
    n += 1;
    const a = document.createElement('a');
    a.href = `#${href}`;
    a.setAttribute('data-testid', `nav-${href.slice(3)}`);
    const num = document.createElement('span'); num.className = 'n'; num.textContent = String(n).padStart(2, '0');
    a.append(num, text);
    if (n === 1) a.setAttribute('aria-current', 'location');
    li.append(a); ul.append(li);
  }
  nav.append(ul);

  const left = document.createElement('div');
  left.className = 'mk-left';
  const grid = q('preview-grid');
  const hint = q('select-hint');
  if (side === 'A') { left.append(allF, formBox, drafts); main.replaceChildren(nav, left, previews); }
  else { left.append(nav, allF, formBox, drafts); main.replaceChildren(left, previews); }
  if (side === 'C') previews.replaceChildren(grid, hint, promptBox, configBox);
  else previews.replaceChildren(promptBox, grid, hint, configBox);
}
