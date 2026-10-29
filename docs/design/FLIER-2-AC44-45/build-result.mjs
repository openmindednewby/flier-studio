import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const frames = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const PAIRS = ['card', 'fonts', 'card-end', 'fliers'];
const SCOPE = /^(all-|pick-theme|pick-scope|shared-|replace-|add-flier|preview-|mini-|nav-all)/;
const SRC = {
  'all-fliers': 'src/ui/collapsible.ts:65', 'all-fliers-row': 'src/ui/allFliersPanel.ts:75', 'pick-theme': 'src/ui/themeControls.ts:12', 'all-layout': 'src/ui/allFliersPanel.ts:31 (allSettings.ts:20)',
  'all-layout-row': 'src/ui/allFliersPanel.ts:37', 'all-palette': 'src/ui/allFliersPanel.ts:31 (allSettings.ts:21)', 'all-palette-row': 'src/ui/allFliersPanel.ts:37', 'all-fonts': 'src/ui/allFliersPanel.ts:31 (allSettings.ts:22)',
  'all-fonts-row': 'src/ui/allFliersPanel.ts:37', 'all-custom-layouts': 'src/ui/allFliersPanel.ts:69', 'all-ai-line': 'src/ui/allFliersPanel.ts:43', 'pick-scope': 'src/ui/allFliersPanel.ts:47', 'shared-fields': 'src/ui/allFliersPanel.ts:50',
  'shared-state': 'src/ui/allFliersPanel.ts:51', 'replace-text': 'src/ui/replacePanel.ts:126', 'replace-find': 'src/ui/replacePanel.ts:96', 'replace-with': 'src/ui/replacePanel.ts:97', 'replace-word': 'src/ui/replacePanel.ts:98',
  'add-flier': 'src/ui/allFliersPanel.ts:79', 'preview-grid': 'src/main.ts:44', 'mini-preview': 'src/ui/miniPreview.ts:65', 'nav-all': 'src/ui/sectionNav.ts:41',
};
const before = frames.filter((f) => f.option === 'before');
const ids = [...new Set(before.filter((f) => PAIRS.includes(f.shot)).flatMap((f) => f.inViewport))].filter((id) => SCOPE.test(id)).sort();
const seenAt = (id, w) => (before.some((f) => f.file.split('-')[1] === w && f.inViewport.includes(id)) ? 'seen' : 'not in a 360 frame');
const rows = [
  ...ids.map((id) => ({ id, item: id, source: SRC[id] ?? (id.startsWith('preview-') ? 'src/ui/previews.ts:43' : id.startsWith('mini-') ? 'src/ui/miniPreview.ts:58' : 'live DOM'), s360: seenAt(id, '360'), s1280: seenAt(id, '1280'), kind: 'probe' })),
  ...[['note', 'Card note "Every setting here changes all n fliers"', 'src/ui/allFliersPanel.ts:72'], ['look-head', 'Heading "Look of every flier"', 'src/ui/allFliersPanel.ts:76'], ['shared-head', 'Heading "Shared text"', 'src/ui/allFliersPanel.ts:59'],
    ['replace-empty', 'Replace text hint (no word typed)', 'src/ui/replacePanel.ts:102'], ['replace-count', 'Replace: match count (after typing)', 'src/ui/replacePanel.ts:99'], ['replace-matches', 'Replace: ticked match list (after typing)', 'src/ui/replacePanel.ts:100'],
    ['replace-apply', 'Replace: Apply n (after typing)', 'src/ui/replacePanel.ts:101'], ['fold', 'Card fold state (open/closed, remembered)', 'src/ui/collapsible.ts:64']]
    .filter(([id]) => !ids.includes(id)).map(([id, item, source]) => ({ id, item, source, s360: 'inside all-fliers, untouched', s1280: 'inside all-fliers, untouched', kind: 'contained' })),
];
const NEW = [
  { id: 'new-roles', item: 'Fonts by text role: 11 roles (AC-44)', probe: { A: 'font-role-title', B: 'font-role-title', C: 'font-role-title' } },
  { id: 'new-editor', item: 'Role editor: face, size, colour (palette + Custom), weight/italic, letter spacing, Reset to theme (AC-44)', probe: { A: 'font-role-panel', B: 'font-role-panel', C: 'font-role-panel' } },
  { id: 'new-highlight', item: 'Outline of the poster text on hover/focus/tap (AC-45)', probe: { A: 'hi', B: 'hi', C: 'hi' } },
];
const options = {};
const out = [];
for (const o of ['A', 'B', 'C']) {
  const mine = frames.filter((f) => f.option === o);
  const afterIds = new Set(mine.filter((f) => PAIRS.includes(f.shot)).flatMap((f) => f.inViewport));
  const lost = rows.filter((r) => r.kind === 'probe' && !afterIds.has(r.id)).map((r) => r.id);
  const all = new Set(mine.flatMap((f) => f.inViewport));
  const hiFrames = mine.filter((f) => f.highlightBoxesInView > 0).map((f) => `${f.file}:${f.highlightBoxesInView}`);
  const added = NEW.filter((x) => (x.probe[o] === 'hi' ? hiFrames.length > 0 : all.has(x.probe[o]))).map((x) => x.id);
  options[o] = {
    inventory: `${rows.length - lost.length}/${rows.length}`, lost, added: `${added.length}/${NEW.length}`, highlight: hiFrames,
    misaligned: mine.flatMap((f) => f.misaligned.map((m) => `${f.file}: ${m.join(' / ')}`)), textFit: mine.flatMap((f) => f.textFit.map((t) => `${f.file}: ${t}`)),
    hscroll: mine.filter((f) => f.hscroll).map((f) => f.file), under44: [...new Set(mine.flatMap((f) => f.under44.map((u) => `${f.file}: ${u}`)))],
  };
  for (const f of mine.filter((x) => x.pair)) {
    const b = before.find((x) => x.file === f.file.replace(/^[ABC]-/, 'before-'));
    if (!b) continue;
    const key = f.file.replace(/^[ABC]-/, '').replace('.png', '');
    out.push({ option: o, shot: key, side: 'before', build: b.build, file: b.file, pair: b.pair, visibleItems: { before: b.inViewport, after: [] } });
    out.push({ option: o, shot: key, side: 'after', build: f.build, file: f.file, pair: f.pair, visibleItems: { before: [], after: f.inViewport } });
  }
}
const result = { countMethod: 'visible-in-frame', rowsMethod: 'auto', pairMethod: 'same-steps', beforeBuild: before[0]?.build, inventory: rows, newItems: NEW, options, frames: out };
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
for (const [k, o] of Object.entries(options)) console.log(k, o.inventory, 'new', o.added, 'lost', o.lost.join(',') || '-', 'mis', o.misaligned.join(' | ') || 0, 'fit', o.textFit.join(' | ') || 0, 'u44', o.under44.join(' | ') || 0, 'hs', o.hscroll.join(',') || 0, 'hi', o.highlight.join(' '));
console.log('rows', rows.length, rows.map((r) => r.id).join(','));
