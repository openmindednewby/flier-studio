import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const COLD = ['./ui/presetDialog', './ui/importDialog'];

describe('main.ts dialog imports', () => {
  it('with the preset and share-import dialogs, loads each only on demand so they stay out of the start bundle', () => {
    const main = readFileSync(join(__dirname, '..', 'src', 'main.ts'), 'utf8');

    const eager = COLD.filter((path) => main.includes(`from '${path}'`));

    expect(eager).toEqual([]);
  });
});
