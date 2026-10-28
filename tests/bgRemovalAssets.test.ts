import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bgRemovalCopies, bgRemovalUrls } from '../scripts/bgRemovalAssets';

describe('bgRemovalUrls', () => {
  it('with package 0.1.0 and runtime 1.31.1, puts both versions in the paths', () => {
    const urls = bgRemovalUrls('0.1.0', '1.31.1');

    expect(urls).toEqual({ modelUrl: '/bg-removal/0.1.0/modnet.onnx', runtimeBaseUrl: '/bg-removal/ort/1.31.1/' });
  });
});

describe('bgRemovalCopies', () => {
  it('with the runtime folder listing, copies the model and only the wasm runtime files, never jspi or maps', () => {
    const listing = ['ort.min.mjs', 'ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.jsep.wasm', 'ort-wasm-simd-threaded.jspi.wasm', 'ort.min.mjs.map'];

    const copies = bgRemovalCopies({ pkgDir: 'pkg', ortDir: 'ort', pkgVersion: '0.1.0', ortVersion: '1.31.1' }, listing);

    expect(copies.map((c) => c.to)).toEqual([
      'bg-removal/0.1.0/modnet.onnx',
      'bg-removal/ort/1.31.1/ort-wasm-simd-threaded.wasm',
      'bg-removal/ort/1.31.1/ort-wasm-simd-threaded.mjs',
      'bg-removal/ort/1.31.1/ort-wasm-simd-threaded.jsep.wasm',
    ]);
    expect(copies[0]?.from).toBe(join('pkg', 'models', 'modnet.onnx'));
  });
});

describe('nginx.conf', () => {
  it('for /bg-removal/, serves the versioned model and runtime as immutable with the wasm MIME type', () => {
    const conf = readFileSync(join(__dirname, '..', 'nginx.conf'), 'utf8');

    const block = conf.slice(conf.indexOf('location /bg-removal/'));

    expect(block).toContain('max-age=31536000, immutable');
    expect(block).toContain('application/wasm');
  });
});
