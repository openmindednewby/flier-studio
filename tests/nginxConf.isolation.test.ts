import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const conf = readFileSync(join(__dirname, '..', 'nginx.conf'), 'utf8');
const locations = conf.split(/\n\s*location /).slice(1);

describe('nginx.conf cross-origin isolation', () => {
  it('has a location block to check', () => {
    const count = locations.length;

    expect(count).toBeGreaterThan(0);
  });

  it.each(locations.map((block) => [block.split('{')[0].trim(), block]))('for location %s, sends COOP same-origin and COEP credentialless', (_name, block) => {
    const headers = block.split(/\n {4}\}/)[0];

    expect(headers).toContain('add_header Cross-Origin-Opener-Policy "same-origin" always;');
    expect(headers).toContain('add_header Cross-Origin-Embedder-Policy "credentialless" always;');
  });
});
