import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { FLIER_TOKENS } from '@dloizides/design-tokens';
import { buildManifest, generateServiceWorker } from '@dloizides/pwa-sw';
import { describe, expect, it } from 'vitest';
import { withThemeColor } from '../scripts/themeColor';

const root = join(__dirname, '..');
const read = (p: string): string => readFileSync(join(root, p), 'utf8');
const config = createRequire(import.meta.url)(join(root, 'pwa-sw.config.cjs'));
const LLM_EXTENSIONS = ['.bin', '.gguf', '.wasm', '.json', '.safetensors', '.onnx'];

describe('buildManifest', () => {
  it('with the app config, names the app and takes its theme colour from the tokens', () => {
    const expected = { name: 'Flier Studio', short_name: 'Fliers', theme_color: FLIER_TOKENS.dark.background, display: 'standalone', start_url: '/' };

    const manifest = buildManifest(config.manifest);

    expect(manifest).toMatchObject(expected);
  });

  it('with the app config, lists maskable 192 and 512 icons that exist in public', () => {
    const manifest = buildManifest(config.manifest);

    const maskable = manifest.icons.filter((i) => i.purpose === 'maskable');

    expect(maskable.map((i) => i.sizes)).toEqual(['192x192', '512x512']);
    expect(manifest.icons.every((i) => existsSync(join(root, 'public', i.src)))).toBe(true);
  });
});

describe('generateServiceWorker', () => {
  it('with the app config, never treats LLM weights or model files as cacheable assets', () => {
    const extensions: string[] = config.serviceWorker.staticExtensions;

    const source = generateServiceWorker(config.serviceWorker);

    expect(extensions.filter((e) => LLM_EXTENSIONS.includes(e))).toEqual([]);
    expect(source).not.toContain('huggingface');
  });
});

describe('nginx.conf', () => {
  it('with the cache rules, keeps HTML and the worker files no-cache and only hashed assets immutable', () => {
    const conf = read('nginx.conf');

    const worker = /location ~ \^\/\(service-worker\|sw-register\|sw\)\\.js\$ \{[^}]*no-cache/.test(conf);
    const assets = /location \/assets\/ \{[^}]*immutable/.test(conf);
    const root = /location \/ \{[^}]*no-cache/.test(conf);

    expect([worker, assets, root]).toEqual([true, true, true]);
  });
});

describe('index.html', () => {
  it('with the PWA wiring, links the generated manifest and loads the registration snippet', () => {
    const html = withThemeColor(read('index.html'));

    const found = ['rel="manifest" href="/manifest.json"', 'src="/sw-register.js"', 'name="theme-color"'].filter((s) => html.includes(s));

    expect(found).toHaveLength(3);
  });

  it('with the PWA wiring, sets a light and a dark page theme colour from the tokens by colour scheme', () => {
    const expected = [
      ['(prefers-color-scheme: light)', FLIER_TOKENS.light.background],
      ['(prefers-color-scheme: dark)', FLIER_TOKENS.dark.background],
    ];
    const html = withThemeColor(read('index.html'));

    const tags = [...html.matchAll(/name="theme-color" media="([^"]+)" content="([^"]+)"/g)].map((m) => [m[1], m[2]]);

    expect(tags).toEqual(expected);
  });
});
