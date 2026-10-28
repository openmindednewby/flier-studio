import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CHECK_MARK_RULE = String.raw`.cutout-dialog button[aria-pressed="true"]::before { content: "\2713\00a0"; content: "\2713\00a0" / ""; }`;

function readStyles(): string {
  return readFileSync(join(__dirname, '..', 'src', 'ui', 'styles.css'), 'utf8');
}

describe('styles.css', () => {
  it('as saved, holds no replacement character, NUL or other control byte', () => {
    const css = readStyles();

    const bad = [...css].filter((c) => c === '�' || (c < ' ' && c !== '\n' && c !== '\r' && c !== '\t'));

    expect(bad).toEqual([]);
  });

  it('for the pressed brush button, writes the check mark as a CSS escape hidden from the accessible name', () => {
    const css = readStyles();

    const lines = css.split(/\r?\n/);

    expect(lines).toContain(CHECK_MARK_RULE);
  });
});
