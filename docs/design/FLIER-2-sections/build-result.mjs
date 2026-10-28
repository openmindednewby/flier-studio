import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MOVED = { B: { 'theme-row': 'sec-theme-toggle', 'pick-theme': 'sec-theme-toggle', 'pick-scope': 'sec-scope-toggle' } };
const NON_TESTID = ['fold hint (aria-description)', 'note "Theme and these settings change all n fliers."', 'label "Shared text edits apply to"', 'folded state', 'Drafts reachable at desktop'];
const raw = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json') && f !== 'result.json').sort()
  .map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const shotOf = (f) => f.file.replace(/^(before|A|B|C)-/, '').replace(/\.png$/, '');
const before = raw.filter((f) => f.option === 'before' && f.present);
const beforeIds = [...new Set(before.flatMap((f) => f.present))].sort();
const frames = [];
const options = {};
for (const o of ['A', 'B', 'C']) {
  const mine = raw.filter((f) => f.option === o && f.present);
  const afterIds = [...new Set(mine.flatMap((f) => f.present))].sort();
  const moved = MOVED[o] ?? {};
  const lost = beforeIds.filter((id) => !afterIds.includes(id) && !afterIds.includes(moved[id]));
  const drafts = raw.find((f) => f.option === o && f.file === `${o}-1280-light-drafts.png`)?.draftsReachedByPageScroll?.seen === true;
  const n = beforeIds.length + NON_TESTID.length;
  const k = n - lost.length - (drafts ? 0 : 1);
  options[o] = {
    inventory: `${k}/${n}`, lost, movedTo: Object.entries(moved).map(([a, b]) => `${a} -> one tap behind ${b}`), nonTestidItems: NON_TESTID,
    misaligned: mine.flatMap((f) => f.misaligned ?? []), textFit: mine.flatMap((f) => f.textFit ?? []), draftsReachedByPageScrollAt1280: drafts,
  };
  for (const f of mine) {
    const shot = shotOf(f);
    const b = before.find((x) => shotOf(x) === shot);
    frames.push({ option: o, shot, side: 'before', build: b.build, file: b.file, pair: b.pair, visibleItems: { before: b.present, after: [] } });
    frames.push({ option: o, shot, side: 'after', build: f.build, file: f.file, pair: f.pair, visibleItems: { before: [], after: f.present } });
  }
}
const result = { countMethod: 'visible-in-frame', rowsMethod: 'auto', pairMethod: 'same-steps', beforeIds, options, frames };
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
for (const [k, o] of Object.entries(options)) console.log(k, o.inventory, 'lost', o.lost.join(',') || '-', 'misaligned', o.misaligned.length, 'text', o.textFit.length, 'drafts', o.draftsReachedByPageScrollAt1280);
