import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DECIDED_DROPS = { 'pick-theme-scope': 'D11 "AC-18..20 approved": theme is global only' };
const REPLACED = { 'theme-row': 'all-fliers' };
const NEW_ITEMS = /^(all-fliers|select-hint|drafts-|draft-|enlarge-|theme-chip-)/;
const frames = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const before = [...new Set(frames.filter((f) => f.side === 'before').flatMap((f) => f.visibleItems))].sort();
const options = {};
for (const option of ['A', 'B', 'C']) {
  const mine = frames.filter((f) => f.option === option);
  const after = [...new Set(mine.flatMap((f) => f.visibleItems))].sort();
  const lost = before.filter((id) => !after.includes(id) && !(id in DECIDED_DROPS) && !after.includes(REPLACED[id]));
  const moved = before.filter((id) => !after.includes(id) && after.includes(REPLACED[id])).map((id) => `${id}: container replaced by ${REPLACED[id]}`);
  options[option] = {
    inventory: `${before.length - lost.length}/${before.length}`,
    lost, moved, droppedByDecision: before.filter((id) => !after.includes(id) && id in DECIDED_DROPS).map((id) => `${id}: ${DECIDED_DROPS[id]}`),
    added: after.filter((id) => !before.includes(id) && NEW_ITEMS.test(id)),
    formRowsMisaligned: mine.flatMap((f) => f.formRows.misaligned.map((row) => `${f.shot}: ${row.join(' | ')}`)),
    pairs: mine.map((f) => ({ after: f.file, before: `before-${f.shot}.png`, same: JSON.stringify(f.pair) === JSON.stringify(frames.find((b) => b.option === 'before' && b.shot === f.shot)?.pair) })),
  };
}
const result = { countMethod: 'visible data-testid, whole frame', rowsMethod: 'auto (1px bottom/top)', pairMethod: 'same-steps', before, options, frames };
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
console.log(`before ${before.length}:`, before.join(' '));
for (const [k, o] of Object.entries(options)) console.log(k, o.inventory, 'lost', o.lost.join(',') || '-', '| dropped', o.droppedByDecision.length, '| misaligned', o.formRowsMisaligned.join(' ; ') || 0, '| pairs same', o.pairs.every((p) => p.same));
