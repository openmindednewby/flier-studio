export interface DraftMeta { id: number; at: number; starred: boolean; title: string }

/** Reads the drafts on this device, newest first, with the first flier's title. */
export async function readDrafts(): Promise<DraftMeta[]> {
  const db = await new Promise<IDBDatabase>((ok, no) => { const r = indexedDB.open('flier-studio-drafts', 1); r.onsuccess = (): void => ok(r.result); r.onerror = (): void => no(r.error); });
  const all = await new Promise<{ id: number; at: number; starred: boolean; fliers: unknown[] }[]>((ok, no) => { const r = db.transaction('drafts').objectStore('drafts').getAll(); r.onsuccess = (): void => ok(r.result); r.onerror = (): void => no(r.error); });
  const titleOf = (f: unknown): string => [...JSON.stringify(f).matchAll(/"title":"([^"#][^"]*)"/g)].map((m) => m[1])[0] ?? 'Flier';
  return all.sort((a, b) => (b.at !== a.at ? b.at - a.at : b.id - a.id)).map((d) => ({ id: d.id, at: d.at, starred: d.starred, title: titleOf(d.fliers[0]) }));
}

/** Restyles the live Drafts rows as option A, B or C (AC-36 names, AC-37 delete and clean-up). */
export function draftsMock(arg: { side: string; drafts: DraftMeta[] }): void {
  const { side, drafts } = arg;
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const btn = (text: string, testid: string, label?: string, cls = ''): HTMLButtonElement => { const b = mk('button', cls, text) as HTMLButtonElement; b.type = 'button'; b.dataset.testid = testid; if (label) b.setAttribute('aria-label', label); return b; };
  const ICON: Record<string, string> = {
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    more: '<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  };
  const svg = (k: string, fill = false): string => `<svg viewBox="0 0 24 24" width="20" height="20" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
  const iconBtn = (k: string, testid: string, label: string, fill = false): HTMLButtonElement => { const b = btn('', testid, label, 'mk-ib'); b.innerHTML = svg(k, fill); return b; };
  const css = mk('style', '');
  css.textContent = [
    '.drafts li.mk-row{display:grid;gap:8px 10px;align-items:center;grid-template-columns:36px minmax(0,1fr) auto}.mk-name{font-weight:600;overflow-wrap:break-word;line-height:1.3}',
    '.mk-sub{display:block;font-size:.85rem;color:var(--text-secondary);font-variant-numeric:tabular-nums}.mk-ib{width:44px!important;min-width:44px;height:44px;padding:0!important}',
    '.mk-acts{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.mk-acts button{width:100%!important;gap:6px;padding:0 4px}',
    '.mk-del{color:var(--error)}.mk-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:4px}.mk-foot button{width:auto}.mk-foot p{margin:0;font-size:.85rem;color:var(--text-secondary);flex:1 1 12em}',
    '.mk-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}.mk-top .chips{margin:0}',
    '.mk-nameinput{all:unset;box-sizing:border-box;width:100%;min-height:44px;padding:0 6px;margin-left:-6px;border-radius:8px;font-weight:600;border:1px solid transparent}.mk-nameinput:hover{border-color:var(--border)}',
    '.mk-nameinput:focus-visible{outline:3px solid var(--focus-ring);outline-offset:0}.mk-r-acts{display:flex;gap:6px}.mk-r-acts button{width:auto}',
    '.mk-menu{position:absolute;right:0;top:calc(100% + 4px);display:grid;min-width:180px;padding:6px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 16px rgb(0 0 0/.18);z-index:7}',
    '.mk-menu button{justify-content:flex-start;border-color:transparent;width:100%;gap:10px}.mk-wrap{position:relative}',
    '.mk-acts svg,.mk-menu svg,.mk-foot svg{width:16px;height:16px;flex:0 0 16px}@media (max-width:479px){.mk-acts{grid-template-columns:repeat(2,minmax(0,1fr))}li.mk-b{grid-template-columns:36px minmax(0,1fr)!important}li.mk-b .mk-r-acts{grid-column:1/-1;justify-content:flex-start}}',
    '.mk-edit{display:block;min-height:44px;padding:10px 6px;margin-left:-6px;border-radius:8px;border:1px solid transparent;box-sizing:border-box;cursor:text}.mk-edit:hover{border-color:var(--border)}.mk-edit:focus-visible{outline:3px solid var(--focus-ring);outline-offset:0}',
    '.mk-sel-mode .mk-r-acts{display:none}@media (max-width:479px){li.mk-c .mk-r-acts{grid-column:2/-1;justify-content:flex-start}li.mk-c img{grid-row:span 2;align-self:start}}',
    '.mk-check{appearance:auto;all:revert;width:22px;height:22px;margin:0;accent-color:var(--text)}.drafts li.mk-row.mk-sel-mode{grid-template-columns:28px 36px minmax(0,1fr) auto}',
    '.mk-selbar{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:8px;padding:10px 0;background:var(--surface);border-top:1px solid var(--border)}.mk-selbar button{width:auto}',
    '.mk-toast{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:12px;align-items:center;max-width:calc(100vw - 32px);box-sizing:border-box;padding:8px 8px 8px 16px;background:var(--text);color:var(--surface);border-radius:12px;z-index:9}',
    '.mk-toast button{background:transparent;color:var(--surface);border-color:var(--surface);width:auto}.mk-toast span{overflow-wrap:anywhere}',
    '.mk-dlg{position:fixed;inset:0;display:grid;place-items:center;background:color-mix(in srgb,var(--background) 72%,transparent);z-index:9;padding:16px}',
    '.mk-dlg>div{display:grid;gap:12px;max-width:420px;padding:20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 16px rgb(0 0 0/.18)}.mk-dlg h2{margin:0;font-size:1.15rem}.mk-dlg p{margin:0}',
    '.mk-dlg .mk-btns{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.mk-dlg .mk-btns button{width:auto}.mk-dlg .mk-go{background:var(--error);border-color:var(--error);color:var(--surface);font-weight:600}',
  ].join('\n');
  document.head.append(css);
  const clock = (at: number): string => new Date(at).toLocaleTimeString([], { timeStyle: 'short' });
  const day = (at: number): string => new Date(at).toLocaleDateString([], { day: 'numeric', month: 'numeric' });
  const nameOf = (d: DraftMeta, i: number): string => (side !== 'A' && i === 2 ? 'Friday class, Bachata' : `${d.title}, ${clock(d.at)}`);
  const list = document.querySelector('[data-testid="drafts-list"]') as HTMLElement;
  const rows = [...list.querySelectorAll(':scope > li')] as HTMLElement[];
  rows.forEach((li, i) => {
    const d = drafts[i]; if (!d) return;
    const img = li.querySelector('img') as HTMLElement; const restore = li.querySelector('[data-testid^="draft-restore"]') as HTMLButtonElement; const star = li.querySelector('[data-testid^="draft-star"]') as HTMLButtonElement;
    const name = nameOf(d, i); const n = i + 1;
    li.className = 'mk-row'; li.replaceChildren(); li.dataset.testid = `draft-row-${n}`;
    const sub = mk('span', 'mk-sub', `${day(d.at)} ${clock(d.at)} · ${String(4)} fliers${d.starred ? ' · Favourite' : ''}`);
    if (side === 'A') {
      const meta = mk('span', ''); const nm = mk('span', 'mk-name', name); nm.dataset.testid = `draft-name-${n}`; meta.append(nm, sub);
      const rename = btn('Rename', `draft-rename-${n}`, `Rename ${name}`); rename.insertAdjacentHTML('afterbegin', svg('pen'));
      const del = btn('Delete', `draft-delete-${n}`, `Delete ${name}`); del.insertAdjacentHTML('afterbegin', svg('trash'));
      const acts = mk('div', 'mk-acts'); acts.append(restore, star, rename, del);
      li.append(img, meta, mk('span', ''), acts);
    }
    if (side === 'B') {
      const meta = mk('span', ''); const nm = mk('span', 'mk-name', name); nm.dataset.testid = `draft-name-${n}`; meta.append(nm, sub);
      star.replaceChildren(); star.innerHTML = svg('star', d.starred); star.classList.add('mk-ib'); star.style.minWidth = '44px';
      const wrap = mk('div', 'mk-wrap'); const more = iconBtn('more', `draft-more-${n}`, `More for ${name}: Rename, Delete`); more.setAttribute('aria-haspopup', 'menu'); wrap.append(more);
      const acts = mk('div', 'mk-r-acts'); acts.append(restore, star, wrap);
      li.style.gridTemplateColumns = '36px minmax(0,1fr) auto'; li.classList.add('mk-b'); li.append(img, meta, acts);
    }
    if (side === 'C') {
      const meta = mk('span', ''); const input = mk('span', 'mk-name mk-edit', name); input.contentEditable = 'plaintext-only'; input.setAttribute('role', 'textbox'); input.dataset.testid = `draft-name-${n}`; input.setAttribute('aria-label', `Draft name, saved ${day(d.at)} ${clock(d.at)}`); meta.append(input, sub);
      star.replaceChildren(); star.innerHTML = svg('star', d.starred); star.classList.add('mk-ib'); star.style.minWidth = '44px';
      const del = iconBtn('trash', `draft-delete-${n}`, `Delete ${name}`);
      const acts = mk('div', 'mk-r-acts'); acts.append(restore, star, del);
      li.classList.add('mk-c'); li.append(img, meta, acts);
    }
  });
  const others = drafts.filter((d) => !d.starred).length; const favs = drafts.length - others;
  const chips = document.querySelector('[data-testid="drafts-panel"] .chips') as HTMLElement;
  if (side === 'A') {
    const foot = mk('div', 'mk-foot'); foot.append(btn(`Delete all except favourites (${String(others)})`, 'drafts-cleanup'), mk('p', '', `Your ${String(favs)} favourites always stay.`));
    list.after(foot);
  }
  if (side === 'B') {
    const top = mk('div', 'mk-top'); chips.before(top); top.append(chips, btn('Clean up', 'drafts-cleanup', `Clean up: delete the ${String(others)} drafts that are not favourites`));
  }
  if (side === 'C') {
    const top = mk('div', 'mk-top'); chips.before(top); top.append(chips, btn('Select', 'drafts-select'));
  }
  (window as unknown as { mkDraftState: (s: string) => void }).mkDraftState = (state: string): void => {
    const first = drafts[1]; const nm = first ? nameOf(first, 1) : 'draft';
    if (state === 'toast') {
      document.querySelector('[data-testid="draft-row-2"]')?.remove();
      const t = mk('div', 'mk-toast'); t.setAttribute('role', 'status'); t.dataset.testid = 'drafts-toast'; t.append(mk('span', '', `Deleted “${nm}”`), btn('Undo', 'drafts-undo')); const mini = document.querySelector('[data-testid="mini-preview"]'); const mr = mini?.getBoundingClientRect(); if (mr && mr.height > 1 && mr.top < innerHeight) t.style.bottom = `${String(Math.round(innerHeight - mr.top + 8))}px`; document.body.append(t);
    }
    if ((state === 'cleanup' && side !== 'C') || state === 'confirm') {
      const d = mk('div', 'mk-dlg'); d.dataset.testid = 'drafts-confirm'; const box = mk('div', ''); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      const keep = btn('Keep them', 'drafts-confirm-keep');
      const btns = mk('div', 'mk-btns'); btns.append(keep, btn(`Delete ${String(others)} drafts`, 'drafts-confirm-delete', undefined, 'mk-go'));
      box.append(mk('h2', '', `Delete ${String(others)} drafts?`), mk('p', '', `Your ${String(favs)} favourites stay. Deleted drafts cannot be brought back.`), btns);
      d.append(box); document.body.append(d); keep.focus();
    }
    if ((state === 'cleanup' || state === 'confirm') && side === 'C') {
      if (document.querySelector('[data-testid="drafts-selbar"]')) return;
      list.querySelectorAll(':scope > li').forEach((li, i) => { const c = mk('input', 'mk-check') as HTMLInputElement; c.type = 'checkbox'; c.checked = !drafts[i]?.starred; c.setAttribute('aria-label', `Select ${drafts[i] ? nameOf(drafts[i], i) : ''}`); li.classList.add('mk-sel-mode'); li.prepend(c); });
      const bar = mk('div', 'mk-selbar'); bar.dataset.testid = 'drafts-selbar';
      bar.append(btn(`Delete ${String(others)} selected`, 'drafts-delete-selected'), btn('Delete all except favourites', 'drafts-cleanup'), btn('Done', 'drafts-select-done'));
      list.after(bar); const mini = document.querySelector('[data-testid="mini-preview"]')?.getBoundingClientRect(); if (mini && mini.height > 1 && mini.top < innerHeight) bar.style.bottom = `${String(Math.round(innerHeight - mini.top))}px`;
      (document.querySelector('[data-testid="drafts-select"]') as HTMLElement).textContent = `${String(others)} selected`;
    }
    if (state === 'rename') {
      const row = document.querySelector('[data-testid="draft-row-1"]') as HTMLElement | null;
      if (side === 'B') { const wrap = row?.querySelector('.mk-wrap') as HTMLElement; const m = mk('div', 'mk-menu'); m.setAttribute('role', 'menu'); m.dataset.testid = 'draft-menu';
        const r = btn('Rename', 'draft-menu-rename'); r.insertAdjacentHTML('afterbegin', svg('pen')); const x = btn('Delete', 'draft-menu-delete', undefined, 'mk-del'); x.insertAdjacentHTML('afterbegin', svg('trash'));
        m.append(r, x); wrap.append(m); r.focus(); }
      if (side === 'A') { const nm1 = row?.querySelector('.mk-name') as HTMLElement; const input = mk('input', 'mk-nameinput') as HTMLInputElement; input.value = nm1.textContent ?? ''; input.style.borderColor = 'var(--border)'; nm1.replaceWith(input); input.focus(); input.select(); }
      if (side === 'C') { const ed = row?.querySelector('.mk-edit') as HTMLElement; ed.focus(); const rg = document.createRange(); rg.selectNodeContents(ed); getSelection()?.removeAllRanges(); getSelection()?.addRange(rg); }
    }
  };
}
