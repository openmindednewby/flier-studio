import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const FULL_SHOTS = new Set(['360-full', '1280-full']);
const PAIRED_SHOTS = new Set([...FULL_SHOTS, '360-previews']);
const recorded = readdirSync(join(HERE, 'frames')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(HERE, 'frames', f), 'utf8')));
const frames = recorded.filter((f) => PAIRED_SHOTS.has(f.shot));
const context = recorded.filter((f) => !PAIRED_SHOTS.has(f.shot));
const itemsOf = (side) => [...new Set(frames.filter((f) => f.side === side && FULL_SHOTS.has(f.shot))
  .flatMap((f) => f.visibleItems[side]))].sort();
const before = itemsOf('before');
const after = itemsOf('after');
const kept = before.filter((id) => after.includes(id));
const misaligned = frames.flatMap((f) => f.formRows.misaligned.map((row) => `${f.side} ${f.shot}: ${row.join(' | ')}`));
const result = {
  countMethod: 'visible-in-frame',
  rowsMethod: 'auto',
  pairMethod: 'same-steps',
  note: 'Written by build-result.mjs from frames/*.json, recorded per frame by e2e/appCapture.spec.ts on each build.',
  options: {
    app: {
      inventory: `${kept.length}/${before.length}`,
      items: { before, after },
      lost: before.filter((id) => !after.includes(id)),
      formRowsMisaligned: misaligned,
    },
  },
  frames,
  contextNote: 'Viewport crops anchored on the form top: the taller grouped form shows fewer fields per screen, so they are context, not pairs; the full-height pairs show every field.',
  context,
};
writeFileSync(join(HERE, 'result.json'), `${JSON.stringify(result, null, 1)}\n`);
console.log(`inventory ${result.options.app.inventory}; frames ${frames.length}; misaligned rows ${misaligned.length}`);
