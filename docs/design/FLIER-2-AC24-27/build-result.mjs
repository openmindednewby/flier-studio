import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const INV_MD = join(HERE, '../../../../../BaseClient/docs/Tasks/TODO/flier-studio/FLIER-2-flier-studio-followups/FLIER-2-AC18-20-inventory.md');
const frames = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const old = readFileSync(INV_MD, 'utf8').split('\n').filter((l) => /^\| \d+ \| Visitor/.test(l)).map((l) => {
  const c = l.split('|').map((s) => s.trim());
  return { n: Number(c[1]), item: c[3], id: ((c[3].match(/`([^`]+)`$/) ?? [])[1] ?? '').replace(/-n$/, '-1'), source: c[5], state: c[6].startsWith('state') && c[7].startsWith('state') };
});
const before = frames.filter((f) => f.option === 'before');
const beforeIds = [...new Set(before.flatMap((f) => f.inViewport))].sort();
const oldIds = new Set(old.map((r) => r.id));
const liveNew = beforeIds.filter((id) => !oldIds.has(id) && !/^(preview|edit|download)-\d+$/.test(id) || /^(preview|edit|download)-[2-4]$/.test(id) && false);
const rows = [
  ...old.map((r) => ({ ...r, kind: r.state ? 'state' : beforeIds.includes(r.id) ? 'probe' : 'absent-live' })),
  ...liveNew.map((id, i) => ({ n: 64 + i, item: `live ff3b43d item \`${id}\``, id, source: 're-sighted live ff3b43d', kind: 'probe' })),
];
rows.push({ n: rows.length + 1, item: 'Previews stay beside the form while a lower field is edited (1280: preview-1 in view; 360: mini-preview in view)', id: '', source: 'src/ui/styles.css:147 (sticky), src/ui/miniPreview.ts:65', kind: 'previewBeside' });
rows.push({ n: rows.length + 1, item: 'Generate from prompt heading + on-device AI wording', id: '', source: 'src/ui/promptPanel.ts:31, en.json prompt.heading', kind: 'aiTitle' });
const ANCHORS = ['brand', 'field-items', 'drafts-panel', 'prompt-generate', 'config-save', 'pick-anchor', 'field-venue', 'download-1'];
const options = {};
const out = [];
for (const o of ['A', 'B', 'C']) {
  const mine = frames.filter((f) => f.option === o);
  const afterIds = [...new Set(mine.flatMap((f) => f.inViewport))];
  const lost = rows.filter((r) => r.kind === 'probe' && !afterIds.includes(r.id)).map((r) => r.id);
  const beside = mine.filter((f) => f.shot === 'editing').every((f) => f.previewBeside);
  const ai = afterIds.includes('ai-note');
  const k = rows.length - lost.length - (beside ? 0 : 1) - (ai ? 0 : 1);
  options[o] = {
    inventory: `${k}/${rows.length}`, lost, previewBesideWhileEditing: beside, aiNote: ai,
    downloadAllOnHeaderRow: mine.filter((f) => f.shot === 'top').every((f) => f.dlOnHeader),
    draftsByPageScroll: mine.filter((f) => f.shot === 'drafts').every((f) => f.draftsInView),
    items: { note: 'pair-content check narrowed to the header mark: AC-25 moves every other item between columns by design, so per-shot content differs; inventory is counted visible-in-frame over all frames', before: ['brand'], after: ['brand'] },
    misaligned: mine.flatMap((f) => f.misaligned), textFit: mine.flatMap((f) => f.textFit), hscroll: mine.some((f) => f.hscroll), under44: [...new Set(mine.flatMap((f) => f.under44))],
    focusedOnLoad: Object.fromEntries(mine.filter((f) => f.shot === 'top').map((f) => [f.file, f.focusedOnLoad])),
    flier1Top360: mine.find((f) => f.file === `${o}-360-light-top.png`)?.flier1Top, pageHeight360: mine.find((f) => f.file === `${o}-360-light-top.png`)?.pageHeight,
  };
  const SHOWN = ['1280-light-top', '1280-light-editing', '360-light-top', '360-light-editing', '1280-light-drafts', '1280-dark-top'];
  for (const f of mine.filter((x) => x.pair && SHOWN.includes(x.file.replace(/^[ABC]-/, '').replace('.png', '')))) {
    const b = before.find((x) => x.file === f.file.replace(/^[ABC]-/, 'before-'));
    const key = f.file.replace(/^[ABC]-/, '').replace('.png', '');
    out.push({ option: o, shot: key, side: 'before', build: b.build, file: b.file, pair: b.pair, visibleItems: { before: b.inViewport, after: [] } });
    out.push({ option: o, shot: key, side: 'after', build: f.build, file: f.file, pair: f.pair, visibleItems: { before: [], after: f.inViewport } });
  }
}
const bf = before.find((f) => f.file === 'before-360-light-top.png');
const result = { countMethod: 'visible-in-frame', rowsMethod: 'auto', pairMethod: 'same-steps', beforeBuild: 'ff3b43d', before360: { flier1Top: bf?.flier1Top, pageHeight: bf?.pageHeight }, inventory: rows, options, frames: out };
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
for (const [k, o] of Object.entries(options)) console.log(k, o.inventory, 'lost', o.lost.join(',') || '-', 'beside', o.previewBesideWhileEditing, 'dl', o.downloadAllOnHeaderRow, 'drafts', o.draftsByPageScroll, 'mis', o.misaligned.length, 'fit', o.textFit.length, 'u44', o.under44.join(','), 'f1', o.flier1Top360, 'h', o.pageHeight360, JSON.stringify(o.focusedOnLoad));
console.log('before360', JSON.stringify(result.before360), 'rows', rows.length, 'absent', rows.filter((r) => r.kind === 'absent-live').map((r) => r.id).join(','), 'new', liveNew.join(','));
