/** Records every text run drawn on a canvas (text, transformed box, font) so the mockups can outline poster text by role. */
export function runRecorder(): void {
  type Run = { text: string; x0: number; y0: number; x1: number; y1: number; font: string; fill: string };
  const w = window as unknown as { __mkRuns: Map<HTMLCanvasElement, Run[]> };
  w.__mkRuns = new Map();
  const orig = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function fillText(this: CanvasRenderingContext2D, text: string, x: number, y: number, max?: number): void {
    const m = this.measureText(String(text));
    const wd = max !== undefined ? Math.min(m.width, max) : m.width;
    const left = x - (m.actualBoundingBoxLeft ?? 0);
    const right = left + Math.max(wd, (m.actualBoundingBoxLeft ?? 0) + (m.actualBoundingBoxRight ?? wd));
    const top = y - (m.actualBoundingBoxAscent ?? 0);
    const bottom = y + (m.actualBoundingBoxDescent ?? 0);
    const t = this.getTransform();
    const a = t.transformPoint(new DOMPoint(left, top));
    const b = t.transformPoint(new DOMPoint(right, bottom));
    const list = w.__mkRuns.get(this.canvas) ?? [];
    if (list.length > 600) list.length = 0;
    list.push({ text: String(text).trim(), x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y), x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y), font: this.font, fill: String(this.fillStyle) });
    w.__mkRuns.set(this.canvas, list);
    orig.call(this, text, x, y, max);
  };
  for (const k of ['clearRect', 'fillRect'] as const) {
    const f = CanvasRenderingContext2D.prototype[k];
    CanvasRenderingContext2D.prototype[k] = function wipe(this: CanvasRenderingContext2D, x: number, y: number, ww: number, hh: number): void {
      if (x <= 0 && y <= 0 && ww >= this.canvas.width && hh >= this.canvas.height && this.getTransform().isIdentity) w.__mkRuns.delete(this.canvas);
      f.call(this, x, y, ww, hh);
    };
  }
  const draw = CanvasRenderingContext2D.prototype.drawImage as (...a: unknown[]) => void;
  (CanvasRenderingContext2D.prototype as unknown as { drawImage: (...a: unknown[]) => void }).drawImage = function drawImage(this: CanvasRenderingContext2D, ...a: unknown[]): void {
    const src = a[0] as HTMLCanvasElement; const runs = w.__mkRuns.get(src);
    if (runs && runs.length > 0 && typeof src.width === 'number') {
      const n = a.length; const [sx, sy, sw, sh] = n === 9 ? (a.slice(1, 5) as number[]) : [0, 0, src.width, src.height];
      const [dx, dy] = (n === 9 ? a.slice(5, 7) : a.slice(1, 3)) as number[];
      const [dw, dh] = n === 9 ? (a.slice(7, 9) as number[]) : n === 5 ? (a.slice(3, 5) as number[]) : [sw, sh];
      const t = this.getTransform(); const kx = dw / sw; const ky = dh / sh;
      const mapped = runs.map((r) => { const p0 = t.transformPoint(new DOMPoint(dx + (r.x0 - sx) * kx, dy + (r.y0 - sy) * ky)); const p1 = t.transformPoint(new DOMPoint(dx + (r.x1 - sx) * kx, dy + (r.y1 - sy) * ky)); return { ...r, x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y }; });
      w.__mkRuns.set(this.canvas, mapped);
    }
    draw.apply(this, a);
  };
}

/** Adds the AC-44 Fonts-by-role mockup (side A, B or C) to the All fliers card and window.mkHi(role) for the AC-45 outline. */
export function fontTools(side: string): void {
  type Run = { text: string; x0: number; y0: number; x1: number; y1: number; font: string; fill: string };
  const ROLES: [string, string][] = [['title', 'Title'], ['titleBottom', 'Second title'], ['script', 'Date script'], ['venue', 'Venue'], ['levels', 'Level names'], ['times', 'Times'], ['prices', 'Prices'], ['priceLabels', 'Price labels'], ['incHead', 'Includes heading'], ['incItems', 'Includes items'], ['footer', 'Footer']];
  const SWATCH = ['#2f566f', '#4f7d7a', '#958a80', '#9b6b63', '#e8dccb'];
  const q = (id: string): HTMLElement | null => document.querySelector(`[data-testid="${id}"]`);
  const val = (id: string): string => ((q(`field-${id}`) as HTMLInputElement | null)?.value ?? '');
  const lines = (id: string): string[] => val(id).split('\n').map((l) => l.trim()).filter((l) => l !== '');
  const part = (id: string, i: number): string[] => lines(id).map((l) => (l.split('|')[i] ?? '').trim()).filter((s) => s !== '');
  const norm = (s: string): string => s.toUpperCase().replace(/\s+/g, ' ').trim();
  const mk = (tag: string, cls: string, text?: string): HTMLElement => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const btn = (text: string, testid: string, label?: string, pressed?: boolean): HTMLButtonElement => {
    const b = mk('button', '', text) as HTMLButtonElement; b.type = 'button'; if (testid) b.dataset.testid = testid; if (label) b.setAttribute('aria-label', label); if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed)); return b;
  };
  const pen = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
  const sub = (r: Run, from: number, len: number): Run => {
    pen.font = r.font; const full = pen.measureText(r.text).width || 1; const k = (r.x1 - r.x0) / full;
    const a = r.x0 + pen.measureText(r.text.slice(0, from)).width * k; return { ...r, text: r.text.slice(from, from + len), x0: a, x1: a + pen.measureText(r.text.slice(from, from + len)).width * k };
  };
  const RX: Record<string, RegExp> = { prices: /\d+\s?€|€\s?\d+/g, times: /\d{1,2}[:.]\d{2}\s*[-–]\s*\d{1,2}[:.]\d{2}/g };
  const runsOf = (role: string, cv: HTMLCanvasElement): Run[] => {
    const runs = (window as unknown as { __mkRuns: Map<HTMLCanvasElement, Run[]> }).__mkRuns.get(cv) ?? [];
    const fig = cv.closest('[data-testid^="preview-"]'); const host = fig ? (fig.querySelector('[aria-label]') ?? fig) : null;
    const second = norm(val('titleBottom'));
    const title = norm(host?.getAttribute('aria-label') ?? val('title')).split(' ').filter((t) => t.length > 1 && t !== second);
    const targets: Record<string, string[]> = {
      title, titleBottom: [val('titleBottom'), 'WORKSHOPS'], script: [val('script'), 'Saturday', 'Sunday'], venue: lines('venue'), levels: part('schedule', 0),
      priceLabels: part('prices', 1), incHead: [val('includesHeading')], incItems: lines('includesItems'), footer: [val('footer'), ...val('footer').split(/\s+by\s+/)],
    };
    const out: Run[] = [];
    for (const r of runs) {
      if (r.text.length < 2) continue;
      const rx = RX[role];
      if (rx) { for (const m of r.text.matchAll(rx)) out.push(sub(r, m.index ?? 0, m[0].length)); continue; }
      const up = r.text.toUpperCase();
      if (role === 'title' || role === 'titleBottom') { if (targets[role].map(norm).includes(norm(r.text)) && (role === 'titleBottom' || norm(r.text) !== second)) out.push(r); continue; }
      if (role === 'script' && /^(mon|tue|wed|thu|fri|sat|sun)/i.test(r.text) && !/€/.test(r.text) && r.text.length < 26) { out.push(r); continue; }
      const t = (targets[role] ?? []).filter((x) => x.trim().length > 1).map((x) => x.trim().toUpperCase()).find((x) => up.includes(x) || (up.length > 3 && x.includes(up)));
      if (t) { const i = up.indexOf(t); out.push(i >= 0 ? sub(r, i, t.length) : r); }
    }
    return out;
  };
  let timer = 0;
  const hi = (role: string | null, label?: string, hold = 0): number => {
    document.querySelectorAll('.mk-hi, .mk-peek').forEach((n) => n.remove());
    window.clearTimeout(timer);
    if (role === null) return 0;
    let count = 0;
    const bar = q('mini-preview'); const src = document.querySelector<HTMLCanvasElement>('[data-testid="preview-1"] canvas');
    if (bar && src && bar.getBoundingClientRect().height > 1) {
      const peek = mk('div', 'mk-peek'); const cv = document.createElement('canvas'); const wd = 168; const ht = Math.round((wd * src.height) / src.width);
      cv.width = wd * 2; cv.height = ht * 2; cv.style.width = `${String(wd)}px`; cv.style.height = `${String(ht)}px`;
      peek.style.bottom = `${String(innerHeight - bar.getBoundingClientRect().top + 8)}px`; peek.append(cv); document.body.append(peek);
      cv.getContext('2d')?.drawImage(src, 0, 0, cv.width, cv.height);
    }
    for (const cv of document.querySelectorAll<HTMLCanvasElement>('[data-testid^="preview-"] canvas, .mk-peek canvas')) {
      const r = cv.getBoundingClientRect(); if (r.width < 2) continue;
      const sx = r.width / cv.width; const sy = r.height / cv.height;
      const found = runsOf(role, cv);
      for (const run of found) {
        const box = mk('div', 'mk-hi'); box.dataset.role = role;
        const pad = Math.max(2, 4 * sx);
        Object.assign(box.style, { left: `${String(r.left + scrollX + run.x0 * sx - pad)}px`, top: `${String(r.top + scrollY + run.y0 * sy - pad)}px`, width: `${String((run.x1 - run.x0) * sx + 2 * pad)}px`, height: `${String((run.y1 - run.y0) * sy + 2 * pad)}px` });
        document.body.append(box); count += 1;
      }
      if (found.length > 0 && label && r.width > 120) {
        const top = Math.min(...found.map((f) => f.y0)); const left = Math.min(...found.map((f) => f.x0));
        const tag = mk('div', 'mk-hi mk-hi-tag', label);
        Object.assign(tag.style, { left: `${String(r.left + scrollX + Math.max(0, left * sx))}px`, top: `${String(r.top + scrollY + Math.max(0, top * sy - 26))}px` });
        document.body.append(tag);
      }
    }
    if (hold > 0) timer = window.setTimeout(() => hi(null), hold);
    return count;
  };
  const css = mk('style', '');
  css.textContent = [
    '.mk-hi{position:absolute;z-index:7;pointer-events:none;border:2px dashed var(--brand-fill);border-radius:3px;box-shadow:0 0 0 2px rgb(255 255 255/.7)}',
    '.mk-peek{position:fixed;right:12px;z-index:6;padding:6px;border-radius:8px;background:var(--surface);border:1px solid var(--border);box-shadow:0 4px 16px rgb(0 0 0/.22);pointer-events:none}.mk-peek canvas{display:block}',
    '.mk-hi{position:absolute}.mk-peek~.mk-hi{position:absolute}',
    '.mk-hi-tag{border:0;box-shadow:none;border-radius:4px;padding:2px 6px;font:600 .75rem/1.4 system-ui,sans-serif;background:var(--brand-fill);color:var(--brand-on,#fff);white-space:nowrap}',
    '.mk-fonts{display:grid;gap:8px;min-width:0}.mk-fonts>small{color:var(--text-secondary);font-size:.85rem;line-height:1.35}',
    '.mk-role{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:44px;padding:6px 10px;text-align:left;box-sizing:border-box}',
    '.mk-role b{font-size:.95rem;min-width:0;overflow-wrap:break-word}.mk-role small{color:var(--text-secondary);font-size:.8rem;font-variant-numeric:tabular-nums;text-align:right}',
    '.mk-role[aria-expanded="true"],.mk-chips button[aria-pressed="true"]{border:2px solid var(--brand-fill);font-weight:600}',
    '.mk-chips{display:flex;flex-wrap:wrap;gap:6px}.mk-chips button{width:auto;min-height:44px;height:44px;padding:0 12px;font-size:.9rem}',
    '.mk-sheetrow{display:grid;gap:6px;padding:8px 0;border-top:1px solid var(--border);min-width:0}.mk-sheetrow:first-of-type{border-top:0}',
    '.mk-rh{display:flex;align-items:center;justify-content:space-between;gap:8px}.mk-rh b{font-size:.95rem}.mk-rh button{width:auto;min-width:44px;min-height:44px;padding:0 10px}',
    '.mk-sp{display:grid;gap:10px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);min-width:0;box-sizing:border-box}.mk-sp h4{margin:0;font-size:1rem}',
    '.mk-srow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:start}.mk-sf{display:grid;gap:4px;min-width:0}.mk-sf>span{font-size:.85rem;font-weight:600;line-height:1.3}',
    '.mk-sf select{width:100%;min-height:44px;height:44px}.mk-step{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:4px;align-items:center}.mk-step button{width:44px;min-height:44px;height:44px;padding:0}.mk-step output{text-align:center;font-variant-numeric:tabular-nums}',
    '.mk-sw{display:flex;flex-wrap:wrap;gap:6px}.mk-sw button{width:44px;min-height:44px;height:44px;padding:0}.mk-sw button[data-c]{border-radius:50%}.mk-sw button[aria-pressed="true"]{outline:2px solid var(--text);outline-offset:2px}.mk-sw .mk-cust{width:auto;padding:0 10px}',
    '.mk-sseg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.mk-sseg button{width:100%;min-height:44px;height:44px;padding:0 4px}',
    '.mk-sp button[aria-pressed="true"]:not([data-c]){border:2px solid var(--brand-fill);font-weight:600}.mk-sfoot{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center}.mk-sfoot button{width:auto;min-height:44px}.mk-sfoot small{color:var(--text-secondary)}',
    '@media (max-width:599px){.mk-srow.wide{grid-template-columns:minmax(0,1fr)}}',
  ].join('\n');
  document.head.append(css);
  const sample = (role: string): string => {
    const cv = document.querySelector<HTMLCanvasElement>('[data-testid="preview-1"] canvas'); const run = cv ? runsOf(role, cv)[0] : undefined;
    if (!run) return 'Theme';
    const fam = (/(?:px|\/[\d.]+)\s+(.+)$/.exec(run.font)?.[1] ?? '').split(',')[0].replace(/["']/g, '').trim();
    return `${fam || 'Theme'} · 100%`;
  };
  const hover = (n: HTMLElement, role: string, name: string): void => {
    const on = (): void => { hi(role, name); }; const off = (): void => { hi(null); };
    n.addEventListener('pointerenter', on); n.addEventListener('pointerleave', off); n.addEventListener('focusin', on); n.addEventListener('focusout', off);
    n.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') hi(role, name, 2000); });
  };
  const field = (label: string, control: HTMLElement): HTMLElement => { const f = mk('div', 'mk-sf'); f.append(mk('span', '', label), control); return f; };
  const fontSel = (name: string, cur: string): HTMLSelectElement => { const s = mk('select', '') as HTMLSelectElement; s.setAttribute('aria-label', `Font of ${name}`); for (const f of [cur, 'Anton', 'Oswald', 'Bebas Neue', 'Playfair Display', 'Sacramento', 'Poppins']) s.append(new Option(f)); return s; };
  const sizeStep = (name: string): HTMLElement => { const st = mk('div', 'mk-step'); st.append(btn('−', '', `Smaller ${name}`), mk('output', '', '100%'), btn('+', '', `Larger ${name}`)); return st; };
  const editor = (role: string, name: string, withHead: boolean): HTMLElement => {
    const p = mk('div', 'mk-sp'); p.dataset.testid = 'font-role-panel'; p.setAttribute('role', 'group'); p.setAttribute('aria-label', `${name} on every flier`);
    const cur = sample(role).split(' · ')[0];
    const sw = mk('div', 'mk-sw'); SWATCH.forEach((c, i) => { const s = btn('', '', `Colour ${String(i + 1)} of the palette`, i === 0); s.dataset.c = c; s.style.background = c; sw.append(s); }); const cust = btn('Custom', '', 'Custom colour'); cust.classList.add('mk-cust'); sw.append(cust);
    const sp = mk('select', '') as HTMLSelectElement; sp.setAttribute('aria-label', `Letter spacing of ${name}`); for (const s of ['Normal', 'Tight', 'Wide', 'Wider']) sp.append(new Option(s));
    const seg = mk('div', 'mk-sseg'); seg.append(btn('Bold', '', undefined, true), btn('Italic', '', undefined, false));
    const r1 = mk('div', 'mk-srow wide'); r1.append(field('Font', fontSel(name, cur)), field('Size', sizeStep(name)));
    const r2 = mk('div', 'mk-srow wide'); r2.append(field('Weight', seg), field('Letter spacing', sp));
    const foot = mk('div', 'mk-sfoot'); foot.append(btn('Reset to theme', `font-reset-${role}`), mk('small', '', "A flier's own Style still wins."));
    if (withHead) p.append(mk('h4', '', `${name}, every flier`));
    p.append(r1, field('Colour', sw), r2, foot);
    p.querySelectorAll<HTMLElement>('button, select').forEach((n) => hover(n, role, name));
    return p;
  };
  const row = q('all-fonts-row'); if (!row) return;
  const box = mk('div', 'mk-fonts'); box.dataset.testid = 'font-roles';
  const intro = mk('small', '', side === 'C' ? 'Each text on the poster, set for every flier. Point at one to see it outlined.' : 'Fine-tune each text on every flier. Point at a role to see it outlined.');
  box.append(mk('span', 'mk-sub-h', 'Text roles'), intro);
  const open: Record<string, (role: string) => void> = {};
  if (side === 'A') {
    for (const [role, name] of ROLES) {
      const b = mk('button', 'mk-role') as HTMLButtonElement; b.type = 'button'; b.dataset.testid = `font-role-${role}`; b.setAttribute('aria-expanded', 'false');
      b.append(mk('b', '', name), mk('small', '', sample(role))); hover(b, role, name);
      b.addEventListener('click', () => open.A(role)); box.append(b);
    }
    open.A = (role: string): void => {
      box.querySelectorAll('[data-testid="font-role-panel"]').forEach((n) => n.remove()); box.querySelectorAll('.mk-role').forEach((n) => n.setAttribute('aria-expanded', 'false'));
      const b = box.querySelector<HTMLElement>(`[data-testid="font-role-${role}"]`); if (!b) return; b.setAttribute('aria-expanded', 'true');
      b.after(editor(role, ROLES.find((r) => r[0] === role)?.[1] ?? role, false));
    };
  }
  if (side === 'B') {
    const chips = mk('div', 'mk-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Text role to change');
    for (const [role, name] of ROLES) { const c = btn(name, `font-role-${role}`, undefined, role === 'title'); hover(c, role, name); c.addEventListener('click', () => open.B(role)); chips.append(c); }
    box.append(chips);
    open.B = (role: string): void => {
      box.querySelectorAll('[data-testid="font-role-panel"]').forEach((n) => n.remove()); chips.querySelectorAll('button').forEach((n) => n.setAttribute('aria-pressed', String(n.dataset.testid === `font-role-${role}`)));
      box.append(editor(role, ROLES.find((r) => r[0] === role)?.[1] ?? role, true));
    };
    open.B('title');
  }
  if (side === 'C') {
    for (const [role, name] of ROLES) {
      const r = mk('div', 'mk-sheetrow'); r.dataset.testid = `font-role-${role}`; r.setAttribute('role', 'group'); r.setAttribute('aria-label', name);
      const more = btn('More', `font-more-${role}`, `More for ${name}: colour, weight, spacing`); more.setAttribute('aria-expanded', 'false'); more.addEventListener('click', () => open.C(role));
      const head = mk('div', 'mk-rh'); head.append(mk('b', '', name), more);
      const line = mk('div', 'mk-srow'); line.append(fontSel(name, sample(role).split(' · ')[0]), sizeStep(name));
      r.append(head, line); r.querySelectorAll<HTMLElement>('button, select').forEach((n) => hover(n, role, name)); hover(head, role, name); box.append(r);
    }
    open.C = (role: string): void => {
      box.querySelectorAll('[data-testid="font-role-panel"]').forEach((n) => n.remove()); box.querySelectorAll('[data-testid^="font-more-"]').forEach((n) => n.setAttribute('aria-expanded', 'false'));
      const r = box.querySelector<HTMLElement>(`[data-testid="font-role-${role}"]`); if (!r) return; r.querySelector('[data-testid^="font-more-"]')?.setAttribute('aria-expanded', 'true');
      const p = editor(role, ROLES.find((x) => x[0] === role)?.[1] ?? role, false); p.querySelector('.mk-srow')?.remove(); r.append(p);
    };
  }
  row.after(box);
  const subCss = mk('style', ''); subCss.textContent = '.mk-sub-h{font-size:1rem;font-weight:600;color:var(--text)}'; document.head.append(subCss);
  const w = window as unknown as { mkHi: typeof hi; mkFontOpen: (role: string) => void };
  w.mkHi = hi; w.mkFontOpen = (role: string): void => { open[side]?.(role); };
}
