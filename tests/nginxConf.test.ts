import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('nginx.conf', () => {
  it('for /bg-removal/, serves the versioned model and runtime as immutable with the wasm MIME type', () => {
    const conf = readFileSync(join(__dirname, '..', 'nginx.conf'), 'utf8');

    const block = conf.slice(conf.indexOf('location /bg-removal/'));

    expect(block).toContain('max-age=31536000, immutable');
    expect(block).toContain('application/wasm');
  });
});
