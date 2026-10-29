/** Mock render for AC-38/39: redraws the title pair per sessionStorage 'mkLine' (width or size) and records drawn widths. */
export function lineRender(): void {
  const FIRST = ['KIZOMBA', 'UPCOMING'];
  const SECOND = ['WORKSHOP', 'WORKSHOPS'];
  const w = window as unknown as { __mkDrawn: Map<HTMLCanvasElement, { text: string; x: number; y: number; w: number; px: number }[]> };
  w.__mkDrawn = new Map();
  const mode = sessionStorage.getItem('mkLine') ?? '';
  const orig = CanvasRenderingContext2D.prototype.fillText;
  const pxOf = (font: string): number => Number((/(\d+(?:\.\d+)?)px/.exec(font) ?? [])[1] ?? 16);
  const withPx = (font: string, px: number): string => font.replace(/(\d+(?:\.\d+)?)px/, `${px.toFixed(2)}px`);
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, text: string, x: number, y: number, max?: number): void {
    const host = this.canvas.isConnected ? this.canvas.closest('[data-testid="preview-1"], [data-testid="mini-preview"]') : this.canvas;
    const list = w.__mkDrawn.get(this.canvas) ?? [];
    if (list.length > 0 && FIRST.includes(String(text)) && list.some((r) => FIRST.includes(r.text))) list.length = 0;
    const first = list.find((r) => FIRST.includes(r.text));
    let dx = x;
    if (mode !== '' && host !== null && first !== undefined && SECOND.includes(String(text))) {
      const font = this.font;
      const ownW = this.measureText(text).width;
      const centred = Math.abs(first.x - x) > 1;
      if (mode === 'width') this.font = withPx(font, (pxOf(font) * first.w) / ownW);
      if (mode === 'size') { this.font = withPx(font, first.px); const room = this.canvas.width - 2 * Math.min(first.x, x); const wide = this.measureText(text).width; if (wide > room) this.font = withPx(font, (first.px * room) / wide); }
      const newW = this.measureText(text).width;
      if (centred) dx = x + (ownW - newW) / 2;
    }
    list.push({ text: String(text), x: dx, y, w: this.measureText(text).width, px: pxOf(this.font) });
    w.__mkDrawn.set(this.canvas, list);
    if (max === undefined) orig.call(this, text, dx, y); else orig.call(this, text, dx, y, max);
  };
}

/** Adds the AC-38/39 line tool of option A, B or C to the Flier form or the flier. */
export function lineTools(side: string): void {
  const q = (id: string): HTMLElement | null => document.querySelector(`[data-testid="${id}"]`);
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const mode = sessionStorage.getItem('mkLine') ?? 'width';
  const css = mk('style', '');
  css.textContent = [
    '.mk-lt{display:grid;gap:8px;min-width:0;padding:12px;border:1px solid var(--border);border-radius:8px;margin:4px 0 8px}.mk-lt-h{margin:0;font-weight:600}',
    '.mk-seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mk-seg button{min-height:44px;width:100%;padding:0 6px;white-space:normal;line-height:1.15}',
    '.mk-seg button[aria-pressed="true"],.mk-link button[aria-pressed="true"]{border:2px solid var(--brand-fill);font-weight:600}.mk-lt-note{margin:0;font-size:.85rem;color:var(--text-secondary)}',
    '.mk-ls{display:grid;gap:0;border:1px solid var(--border);border-radius:8px}.mk-ls>div{display:grid;grid-template-columns:minmax(0,1fr) 44px 4.2em 44px;gap:6px;align-items:center;padding:6px 10px;min-height:44px}',
    '.mk-ls>div+div{border-top:1px solid var(--border)}.mk-ls b{display:block;font-weight:600}.mk-ls small{color:var(--text-secondary);overflow-wrap:anywhere}.mk-ls output{text-align:center;font-variant-numeric:tabular-nums}',
    '.mk-ls button{min-height:44px;min-width:44px;width:44px;padding:0}.mk-ls .mk-link{grid-template-columns:minmax(0,1fr) minmax(0,1fr);background:var(--background)}.mk-ls .mk-link button{width:100%}',
    '.mk-sel{position:absolute;border:2px solid var(--text);pointer-events:none;box-sizing:border-box}.mk-bar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;box-sizing:border-box}.mk-crn{position:absolute;width:14px;height:14px;border:0 solid var(--text);pointer-events:none}.mk-pick{width:100%}',
    '.mk-bar button{min-height:44px;flex:1 1 auto;white-space:nowrap;padding:0 8px}.mk-bar button[aria-pressed="true"]{border:2px solid var(--brand-fill);font-weight:600}.mk-target{font-size:.85rem;color:var(--text-secondary);margin:4px 0 8px}',
  ].join('\n');
  document.head.append(css);
  const seg = (labels: string[], on: string, testid: string): HTMLElement => {
    const g = mk('div', 'mk-seg'); g.setAttribute('role', 'group'); g.dataset.testid = testid;
    for (const l of labels) { const b = mk('button', '', l) as HTMLButtonElement; b.type = 'button'; b.setAttribute('aria-pressed', String(l === on)); g.append(b); }
    return g;
  };
  const on = mode === 'size' ? 'Same size' : 'Same width';
  const bottom = q('field-titleBottom')?.closest('.row') as HTMLElement | null;
  if (side === 'A' && bottom) {
    const box = mk('div', 'mk-lt'); box.dataset.testid = 'line-pair';
    box.append(mk('p', 'mk-lt-h', 'Title and Second title'), seg(['Off', 'Same width', 'Same size'], on, 'line-pair-mode'),
      mk('p', 'mk-lt-note', mode === 'size' ? 'Second title takes the size of Title, inside the margins. A theme change keeps it.' : 'Second title is drawn as wide as Title, inside the margins. A theme change keeps it.'));
    bottom.after(box);
  }
  if (side === 'B' && bottom) {
    const box = mk('div', 'mk-lt'); box.dataset.testid = 'line-sizes';
    box.append(mk('p', 'mk-lt-h', 'Line sizes on this flier'));
    const list = mk('div', 'mk-ls');
    const line = (name: string, value: string, pct: string): HTMLElement => {
      const r = mk('div', ''); const t = mk('span', ''); t.append(mk('b', '', name), mk('small', '', value));
      const minus = mk('button', '', '−') as HTMLButtonElement; minus.type = 'button'; minus.setAttribute('aria-label', `Smaller ${name}`);
      const plus = mk('button', '', '+') as HTMLButtonElement; plus.type = 'button'; plus.setAttribute('aria-label', `Larger ${name}`);
      r.append(t, minus, mk('output', '', pct), plus); return r;
    };
    const link = mk('div', 'mk-link'); link.dataset.testid = 'line-link';
    for (const l of ['Same width', 'Same size']) { const b = mk('button', '', l) as HTMLButtonElement; b.type = 'button'; b.setAttribute('aria-pressed', String(l === on)); link.append(b); }
    const title = (q('field-title') as HTMLInputElement | null)?.value ?? '';
    const tb = (q('field-titleBottom') as HTMLInputElement | null)?.value ?? '';
    list.append(line('Title', title, '100%'), link, line('Second title', tb, mode === 'size' ? '113%' : '89%'));
    box.append(list, mk('p', 'mk-lt-note', 'Use the link between two lines next to each other. A theme change keeps the sizes.'));
    bottom.after(box);
  }
  if (side === 'C') {
    const cv = q('preview-1')?.querySelector('canvas') as HTMLCanvasElement | null;
    const drawn = (window as unknown as { __mkDrawn?: Map<HTMLCanvasElement, { text: string; x: number; y: number; w: number; px: number }[]> }).__mkDrawn?.get(cv as HTMLCanvasElement) ?? [];
    const pair = drawn.filter((r) => ['KIZOMBA', 'UPCOMING', 'WORKSHOP', 'WORKSHOPS'].includes(r.text));
    if (cv && pair.length >= 2) {
      const rect = cv.getBoundingClientRect(); const k = rect.width / cv.width; const host = cv.parentElement as HTMLElement;
      host.style.position = 'relative';
      const hr = host.getBoundingClientRect();
      const two = pair.slice(0, 2);
      const L = Math.min(...two.map((r) => rect.left - hr.left + r.x * k)) - 6; const R = Math.max(...two.map((r) => rect.left - hr.left + (r.x + r.w) * k)) + 6;
      const T = Math.min(...two.map((r) => rect.top - hr.top + r.y * k)) - 6; const B = Math.max(...two.map((r) => rect.top - hr.top + (r.y + r.px * 1.02) * k)) + 6;
      for (const [x, y, sides] of [[L, T, 'Top Left'], [R - 14, T, 'Top Right'], [L, B - 14, 'Bottom Left'], [R - 14, B - 14, 'Bottom Right']] as [number, number, string][]) {
        const c = mk('div', 'mk-crn'); c.dataset.testid = 'line-selected'; const st = c.style as unknown as Record<string, string>;
        for (const sd of sides.split(' ')) st[`border${sd}Width`] = '2px';
        Object.assign(c.style, { left: `${x}px`, top: `${y}px` }); host.append(c);
      }
      const bar = mk('div', 'mk-bar'); bar.dataset.testid = 'line-toolbar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', '2 lines selected');
      for (const l of ['Same width', 'Same size', 'Reset']) { const b = mk('button', '', l) as HTMLButtonElement; b.type = 'button'; if (l !== 'Reset') b.setAttribute('aria-pressed', String(l === on)); bar.append(b); }
      const edit = q('edit-1'); if (edit) edit.before(bar); else cv.after(bar);
    }
    if (bottom) {
      const box = mk('div', 'mk-lt'); box.dataset.testid = 'line-hint'; const pick = mk('button', 'mk-pick', 'Pick two lines on flier 1') as HTMLButtonElement; pick.type = 'button'; pick.setAttribute('aria-pressed', 'true');
      box.append(pick, mk('p', 'mk-lt-note', 'Then tap one line on the flier and the next one. On a computer, Shift-click works too.')); bottom.after(box);
    }
  }
}
