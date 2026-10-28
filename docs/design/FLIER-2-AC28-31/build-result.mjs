import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const frames = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const base = JSON.parse(readFileSync(join(HERE, '../FLIER-2-AC24-27/result.json'), 'utf8')).inventory;
const before = frames.filter((f) => f.option === 'before');
const beforeIds = [...new Set(before.flatMap((f) => f.inViewport))].sort();
const known = new Set(base.map((r) => r.id));
const liveNew = beforeIds.filter((id) => id && !known.has(id) && !/^(preview|edit|download|draft-(restore|star)|draft-thumb)-\d+$/.test(id));
const rows = [
  ...base.map((r) => ({ ...r, kind: r.kind === 'probe' && !beforeIds.includes(r.id) ? 'absent-live' : r.kind })),
  ...liveNew.map((id, i) => ({ n: base.length + 1 + i, item: `live ffd9a68 item \`${id}\``, id, source: 're-sighted live ffd9a68', kind: 'probe' })),
];
const SHOWN = ['1280-light-top', '1280-light-allfliers', '1280-light-editing', '360-light-top', '360-light-allfliers', '360-light-editing', '1280-dark-top', '360-dark-top'];
const options = {};
const out = [];
for (const o of ['A', 'B', 'C']) {
  const mine = frames.filter((f) => f.option === o);
  const afterIds = new Set(mine.flatMap((f) => f.inViewport));
  const lost = rows.filter((r) => r.kind === 'probe' && !afterIds.has(r.id)).map((r) => r.id);
  const beside = mine.filter((f) => f.shot === 'editing').every((f) => f.previewBeside);
  const ai = afterIds.has('ai-note');
  const k = rows.length - lost.length - (beside ? 0 : 1) - (ai ? 0 : 1);
  options[o] = {
    inventory: `${k}/${rows.length}`, lost, previewBesideWhileEditing: beside, aiNote: ai,
    rightOnlyFliers: mine.every((f) => f.rightOnlyFliers), downloadAllOnHeaderRow: mine.filter((f) => f.shot === 'top').every((f) => f.dlOnHeader),
    railCollapsedWidth1280: mine.find((f) => f.file === `${o}-1280-light-${o === 'C' ? 'top' : 'rail'}.png`)?.railWidth,
    railOpenWidth1280: mine.find((f) => f.file === `${o}-1280-light-${o === 'C' ? 'rail' : 'top'}.png`)?.railWidth,
    misaligned: mine.flatMap((f) => f.misaligned), textFit: mine.flatMap((f) => f.textFit), hscroll: mine.some((f) => f.hscroll), under44: [...new Set(mine.flatMap((f) => f.under44))],
    focusedOnLoad: Object.fromEntries(mine.filter((f) => f.shot === 'top').map((f) => [f.file, f.focusedOnLoad])),
    flier1Top360: mine.find((f) => f.file === `${o}-360-light-top.png`)?.flier1Top, pageHeight360: mine.find((f) => f.file === `${o}-360-light-top.png`)?.pageHeight,
    items: { note: 'pair-content check narrowed to the header mark: AC-28 moves Generate and Saved configs between columns by design; inventory is counted visible-in-frame over all frames', before: ['brand'], after: ['brand'] },
  };
  for (const f of mine.filter((x) => x.pair && SHOWN.includes(x.file.replace(/^[ABC]-/, '').replace('.png', '')))) {
    const b = before.find((x) => x.file === f.file.replace(/^[ABC]-/, 'before-'));
    const key = f.file.replace(/^[ABC]-/, '').replace('.png', '');
    out.push({ option: o, shot: key, side: 'before', build: b.build, file: b.file, pair: b.pair, visibleItems: { before: b.inViewport, after: [] } });
    out.push({ option: o, shot: key, side: 'after', build: f.build, file: f.file, pair: f.pair, visibleItems: { before: [], after: f.inViewport } });
  }
}
const bf = before.find((f) => f.file === 'before-360-light-top.png');
const result = { countMethod: 'visible-in-frame', rowsMethod: 'auto', pairMethod: 'same-steps', beforeBuild: 'ffd9a68', before360: { flier1Top: bf?.flier1Top, pageHeight: bf?.pageHeight }, inventory: rows, options, frames: out };
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
for (const [k, o] of Object.entries(options)) console.log(k, o.inventory, 'lost', o.lost.join(',') || '-', 'beside', o.previewBesideWhileEditing, 'right', o.rightOnlyFliers, 'dl', o.downloadAllOnHeaderRow, 'rail', o.railOpenWidth1280, '/', o.railCollapsedWidth1280, 'mis', o.misaligned.length, 'fit', o.textFit.length, 'u44', o.under44.join(','), 'f1', o.flier1Top360, 'h', o.pageHeight360, JSON.stringify(o.focusedOnLoad));
console.log('before360', JSON.stringify(result.before360), 'rows', rows.length, 'absent', rows.filter((r) => r.kind === 'absent-live').map((r) => r.id).join(','), 'new', liveNew.join(','));
