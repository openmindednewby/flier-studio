/** Records every canvas fillText so the mockup can mark where a word sits on each flier. */
export function recordCanvasText(): void {
  const w = window as unknown as { __mkText: Map<HTMLCanvasElement, { text: string; x: number; y: number; px: number; font: string }[]> };
  w.__mkText = new Map();
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, text: string, x: number, y: number, max?: number): void {
    const t = this.getTransform();
    const px = Number((/(\d+(?:\.\d+)?)px/.exec(this.font) ?? [])[1] ?? 16);
    const list = w.__mkText.get(this.canvas) ?? [];
    const row = { text: String(text), x: t.a * x + t.e, y: t.d * y + t.f, px: px * t.d, font: this.font };
    if (!list.some((r) => r.text === row.text && r.x === row.x && r.y === row.y)) list.push(row);
    w.__mkText.set(this.canvas, list);
    if (max === undefined) orig.call(this, text, x, y); else orig.call(this, text, x, y, max);
  };
}

/** Adds the AC-32..34 Replace text tool to All fliers and exposes window.mkReplace to fill it. */
export function replaceTool(side: string): void {
  const q = (id: string): HTMLElement => document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const css = mk('style', '');
  css.textContent = [
    '.mk-rp{display:grid;gap:10px;min-width:0}.mk-rp label{display:grid;gap:4px;min-width:0}.mk-rp label>span{font-weight:600}',
    '.mk-rp input[type=text]{width:100%;min-height:44px;box-sizing:border-box}.mk-rp .row{display:grid;gap:10px;grid-template-columns:1fr}',
    '.mk-rp .mk-word{display:flex;align-items:center;gap:10px;min-height:44px}.mk-rp .mk-word>span{font-weight:400}',
    '.mk-rp-count{margin:0;font-weight:600}.mk-rp-empty{margin:0;font-size:.9rem;color:var(--text-secondary)}',
    '.mk-rp ul{list-style:none;margin:0;padding:0;display:grid;border:1px solid var(--border);border-radius:8px;max-height:360px;overflow:auto}',
    '.mk-rp li+li{border-top:1px solid var(--border)}.mk-rp li label{display:grid;grid-template-columns:24px minmax(0,1fr);align-items:start;gap:4px 10px;padding:8px 12px;min-height:44px;box-sizing:border-box;cursor:pointer}',
    '.mk-rp input[type=checkbox]{appearance:auto;all:revert;flex:0 0 20px;width:20px;height:20px;min-width:0;min-height:0;margin:0;accent-color:var(--text)}.mk-rp li input{margin-top:2px}.mk-rp li label>span{font-weight:400;min-width:0;overflow-wrap:anywhere}.mk-rp li b{display:block;font-weight:600}',
    '.mk-rp s{color:var(--text-secondary)}.mk-rp ins{text-decoration:none;font-weight:700}.mk-rp-note{display:block;font-size:.85rem;color:var(--text-secondary)}',
    '.mk-rp button{min-height:44px;justify-self:start;padding:0 16px;font-weight:600}',
    '.mk-hl{position:absolute;pointer-events:none;border-radius:3px;outline:2px solid var(--focus-ring);background:color-mix(in srgb,var(--focus-ring) 30%,transparent)}',
    '.mk-hl.off{background:none;outline-style:dashed}.mk-hl i{position:absolute;top:50%;left:-24px;margin-top:-9px;min-width:18px;height:18px;border-radius:9px;background:var(--text);color:var(--surface);font:600 11px/18px system-ui,sans-serif;font-style:normal;text-align:center}',
    '@media (min-width:480px){.mk-rp.list .row{grid-template-columns:1fr 1fr}}',
  ].join('\n');
  document.head.append(css);

  const tool = mk('div', `mk-rp ${side === 'A' ? 'stack' : 'list'}`); tool.setAttribute('data-testid', 'replace-text');
  const field = (name: string, tid: string): [HTMLElement, HTMLInputElement] => {
    const l = mk('label', ''); const i = document.createElement('input'); i.type = 'text'; i.setAttribute('data-testid', tid);
    l.append(mk('span', '', name), i); return [l, i];
  };
  const [fl, find] = field('Find', 'replace-find');
  const [rl, rep] = field('Replace with', 'replace-with');
  const pair = mk('div', 'row'); pair.append(fl, rl);
  const word = mk('label', 'mk-word'); const wb = document.createElement('input'); wb.type = 'checkbox'; wb.setAttribute('data-testid', 'replace-word');
  word.append(wb, mk('span', '', 'Whole word only (capital letters never matter)'));
  const out = mk('div', 'mk-rp-out'); out.setAttribute('data-testid', 'replace-matches');
  out.append(mk('p', 'mk-rp-empty', 'Type a word or phrase. Every match is marked on the fliers and listed here before anything changes.'));
  tool.append(mk('h3', 'mk-gh', 'Replace text'), pair, word, out);
  q('all-fliers-row').append(tool);

  const w = window as unknown as { __mkText?: Map<HTMLCanvasElement, { text: string; x: number; y: number; px: number; font: string }[]>; mkReplace: (f: string, r: string, untick: number) => void };
  const meter = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
  w.mkReplace = (f: string, r: string, untick: number): void => {
    find.value = f; rep.value = r;
    document.querySelectorAll('.mk-hl').forEach((n) => n.remove());
    const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(wb.checked ? `\\b${esc}\\b` : esc, 'gi');
    const figs = [...document.querySelectorAll('[data-testid^="preview-"]')].filter((n) => /^preview-\d+$/.test(n.getAttribute('data-testid') ?? ''));
    const hits: { flier: number; field: string; before: string; after: string; marks: HTMLElement[] }[] = [];
    figs.forEach((fig, fi) => {
      const canvas = fig.querySelector('canvas') as HTMLCanvasElement | null; const trim = fig.querySelector('.trim') as HTMLElement | null;
      if (!canvas || !trim) return;
      trim.style.position = 'relative';
      const cr = canvas.getBoundingClientRect(); const tr = trim.getBoundingClientRect(); const s = cr.width / canvas.width;
      for (const row of w.__mkText?.get(canvas) ?? []) {
        const found = [...row.text.matchAll(re)];
        if (!found.length) continue;
        meter.font = row.font;
        const marks = found.map((m) => {
          const x = row.x + meter.measureText(row.text.slice(0, m.index)).width; const wd = meter.measureText(m[0]).width;
          const box = mk('span', 'mk-hl');
          box.style.cssText = `left:${cr.left - tr.left + x * s - 2}px;top:${cr.top - tr.top + row.y * s - 2}px;width:${wd * s + 4}px;height:${row.px * 1.1 * s + 4}px`;
          trim.append(box); return box;
        });
        hits.push({ flier: fi + 1, field: /\d:\d\d/.test(row.text) ? 'Schedule' : 'Text', before: row.text, after: row.text.replace(re, r), marks });
      }
    });
    const fliers = new Set(hits.map((h) => h.flier)).size;
    const list = mk('ul', '');
    const count = mk('p', 'mk-rp-count'); count.setAttribute('aria-live', 'polite');
    const btn = mk('button', '') as HTMLButtonElement; btn.type = 'button'; btn.setAttribute('data-testid', 'replace-apply');
    const boxes = (): HTMLInputElement[] => [...list.querySelectorAll('input')] as HTMLInputElement[];
    const sync = (): void => {
      const ticked = boxes().filter((i) => i.checked).length;
      count.textContent = `${hits.length} matches in ${fliers} fliers, ${ticked} ticked`;
      btn.textContent = `Replace ${ticked} ticked`;
      hits.forEach((h, i) => h.marks.forEach((m) => m.classList.toggle('off', !boxes()[i].checked)));
    };
    hits.forEach((h, i) => {
      h.marks.forEach((m) => m.append(mk('i', '', String(i + 1))));
      const l = mk('label', ''); const c = document.createElement('input'); c.type = 'checkbox'; c.checked = i !== untick; c.addEventListener('change', sync);
      const t = mk('span', ''); t.append(mk('b', '', `${i + 1}. Flier ${h.flier}, ${h.field}`), mk('s', '', h.before), ' \u2192 ', mk('ins', '', h.after));
      l.append(c, t); const li = mk('li', ''); li.append(l); list.append(li);
    });
    out.replaceChildren(count, list, btn, mk('small', 'mk-rp-note', 'A draft is saved first, so Drafts can undo it.'));
    sync();
  };
}
