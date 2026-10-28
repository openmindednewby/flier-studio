import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const frames = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const options = {};
for (const option of [...new Set(frames.map((f) => f.option))]) {
  const mine = frames.filter((f) => f.option === option);
  const itemsOf = (side) => [...new Set(mine.filter((f) => f.side === side).flatMap((f) => f.visibleItems[side]))].sort();
  const before = itemsOf('before');
  const after = itemsOf('after');
  options[option] = {
    inventory: `${before.filter((id) => after.includes(id)).length}/${before.length}`,
    items: { before, after },
    lost: before.filter((id) => !after.includes(id)),
    added: after.filter((id) => !before.includes(id)),
    formRowsMisaligned: mine.flatMap((f) => f.formRows.misaligned.map((row) => `${f.side} ${f.shot}: ${row.join(' | ')}`)),
  };
}
const result = {
  countMethod: 'visible-in-frame',
  rowsMethod: 'auto',
  pairMethod: 'same-steps',
  note: 'Written by build-result.mjs from frames/*.json, recorded per frame by capture.spec.ts on the HEAD build (before) and the FLIER-2 build (after).',
  options,
  frames,
};
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
console.log(Object.entries(options).map(([k, o]) => `${k} ${o.inventory} misaligned ${o.formRowsMisaligned.length}`).join('; '));
