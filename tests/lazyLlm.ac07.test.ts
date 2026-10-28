import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : [];
  });
}

const STATIC_IMPORT = new RegExp("^import (?!type )[^(]*['\"]@dloizides/llm-run['\"]", 'm');

describe('llm-run import', () => {
  it('with every app source file, is only ever a dynamic import so the model loads on click only', () => {
    const files = sources(join(__dirname, '..', 'src'));

    const staticImports = files.filter((f) => STATIC_IMPORT.test(readFileSync(f, 'utf8')));

    expect(files.length).toBeGreaterThan(5);
    expect(staticImports).toEqual([]);
  });
});
