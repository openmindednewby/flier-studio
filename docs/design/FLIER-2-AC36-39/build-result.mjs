import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const frames = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const PAIRS = ['top', 'drafts', 'drafts-end', 'form', 'form-mid', 'form-end', 'lines', 'flier', 'size'];
const SCOPE = /^(drafts|draft-|flier-form|field-|pick-|group-|form-|remove-background|upload|preview-|mini-preview|nav-|section-nav|rail-toggle|edit-|download-)/;
const before = frames.filter((f) => f.option === 'before');
const beforeIds = [...new Set(before.filter((f) => PAIRS.includes(f.shot)).flatMap((f) => f.inViewport))].filter((id) => SCOPE.test(id)).sort();
const NEW = [
  { id: 'new-draft-name', item: 'Draft name: first title + time, renamable inline (AC-36)', probe: { A: 'draft-name-1', B: 'draft-name-1', C: 'draft-name-1' } },
  { id: 'new-draft-delete', item: 'Delete one draft, 5 s Undo toast (AC-37)', probe: { A: 'draft-delete-1', B: 'draft-more-1', C: 'draft-delete-1' } },
  { id: 'new-draft-cleanup', item: 'Delete all except favourites, behind a confirm (AC-37)', probe: { A: 'drafts-cleanup', B: 'drafts-cleanup', C: 'drafts-select' } },
  { id: 'new-line-tool', item: 'Same width / Same size on two consecutive lines (AC-38/39)', probe: { A: 'line-pair', B: 'line-sizes', C: 'line-toolbar' } },
];
const rows = [
  ...beforeIds.map((id, i) => ({ n: i + 1, item: `\`${id}\``, id, role: 'Visitor', source: `live ${before[0]?.build ?? ''}, seen in ${[...new Set(before.filter((f) => f.inViewport.includes(id)).map((f) => `${f.file.split('-')[1]} ${f.shot}`))].slice(0, 3).join(', ')}`, kind: 'probe' })),
  { n: beforeIds.length + 1, item: 'No drafts yet / No favourites yet (empty states)', id: 'drafts-empty', role: 'Visitor', source: 'src/ui/draftsPanel.ts:62 (state, not on screen with 6 drafts)', kind: 'state' },
];
const options = {};
const out = [];
const SHOWN = ['drafts', 'lines', 'flier', 'size'];
for (const o of ['A', 'B', 'C']) {
  const mine = frames.filter((f) => f.option === o);
  const afterIds = new Set(mine.filter((f) => PAIRS.includes(f.shot)).flatMap((f) => f.inViewport));
  const lost = rows.filter((r) => r.kind === 'probe' && !afterIds.has(r.id)).map((r) => r.id);
  const allIds = new Set(mine.flatMap((f) => f.inViewport));
  const added = NEW.filter((x) => allIds.has(x.probe[o])).map((x) => x.id);
  const lineW = mine.find((f) => f.file === `${o}-1280-light-flier.png`)?.line;
  const lineS = mine.find((f) => f.file === `${o}-1280-light-size.png`)?.line;
  options[o] = {
    inventory: `${rows.length - lost.length}/${rows.length}`, lost, added: `${added.length}/${NEW.length}`,
    misaligned: mine.flatMap((f) => f.misaligned.map((m) => `${f.file}: ${m.join(' / ')}`)), textFit: mine.flatMap((f) => f.textFit.map((t) => `${f.file}: ${t}`)),
    hscroll: mine.filter((f) => f.hscroll).map((f) => f.file), under44: [...new Set(mine.flatMap((f) => f.under44.map((u) => `${f.file}: ${u}`)))],
    sameWidth: lineW, sameSize: lineS,
    focus: Object.fromEntries(mine.filter((f) => ['rename', 'cleanup', 'drafts'].includes(f.shot) && f.scheme !== 'dark').map((f) => [f.file, f.focused])),
    items: { note: 'pair-content check on the Drafts list and the Flier form fields: every item visible in a before frame of these shots is visible in an after frame of the option', before: ['drafts-list', 'field-titleBottom'], after: ['drafts-list', 'field-titleBottom'] },
  };
  for (const f of mine.filter((x) => x.pair && SHOWN.includes(x.shot))) {
    const b = before.find((x) => x.file === f.file.replace(/^[ABC]-/, 'before-'));
    if (!b) continue;
    const key = f.file.replace(/^[ABC]-/, '').replace('.png', '');
    out.push({ option: o, shot: key, side: 'before', build: b.build, file: b.file, pair: b.pair, visibleItems: { before: b.inViewport, after: [] } });
    out.push({ option: o, shot: key, side: 'after', build: f.build, file: f.file, pair: f.pair, visibleItems: { before: [], after: f.inViewport } });
  }
}
const lineBefore = before.find((f) => f.file === 'before-1280-light-flier.png')?.line;
const result = { countMethod: 'visible-in-frame', rowsMethod: 'auto', pairMethod: 'same-steps', beforeBuild: before[0]?.build, lineBefore, inventory: rows, newItems: NEW, options, frames: out };
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
for (const [k, o] of Object.entries(options)) console.log(k, o.inventory, 'new', o.added, 'lost', o.lost.join(',') || '-', 'mis', o.misaligned.length, 'fit', o.textFit.join(' | ') || 0, 'u44', o.under44.join(' | ') || 0, 'hs', o.hscroll.join(',') || 0, 'W', JSON.stringify(o.sameWidth), 'S', JSON.stringify(o.sameSize), JSON.stringify(o.focus));
console.log('rows', rows.length, 'before line', JSON.stringify(lineBefore));
