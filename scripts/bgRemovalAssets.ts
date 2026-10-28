import { copyFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

export interface BgRemovalUrls {
  modelUrl: string;
  runtimeBaseUrl: string;
}

export interface BgRemovalSource {
  pkgDir: string;
  ortDir: string;
  pkgVersion: string;
  ortVersion: string;
}

export interface Copy {
  from: string;
  to: string;
}

const RUNTIME_FILE = /^ort-wasm-simd-threaded\.jsep\.(wasm|mjs)$/;
const BUNDLED_ORT_WASM = /^assets\/ort-wasm-[^/]*\.wasm$/;
const MODEL = 'modnet.onnx';

/** Same-origin URLs of the model and onnxruntime files; the version in the path makes them cacheable forever. */
export function bgRemovalUrls(pkgVersion: string, ortVersion: string): BgRemovalUrls {
  return { modelUrl: `/bg-removal/${pkgVersion}/${MODEL}`, runtimeBaseUrl: `/bg-removal/ort/${ortVersion}/` };
}

/** Files copied into the build: the model plus the jsep runtime the worker loads. */
export function bgRemovalCopies(source: BgRemovalSource, ortListing: readonly string[]): Copy[] {
  const urls = bgRemovalUrls(source.pkgVersion, source.ortVersion);
  const runtime = ortListing.filter((f) => RUNTIME_FILE.test(f)).map((f) => ({ from: join(source.ortDir, f), to: `${urls.runtimeBaseUrl.slice(1)}${f}` }));
  return [{ from: join(source.pkgDir, 'models', MODEL), to: urls.modelUrl.slice(1) }, ...runtime];
}

/** True for the onnxruntime wasm Vite copies into assets/; the worker loads the runtime from runtimeBaseUrl instead. */
export function isBundledOrtWasm(fileName: string): boolean {
  return BUNDLED_ORT_WASM.test(fileName);
}

const versionOf = (dir: string): string => (JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { version: string }).version;

export function bgRemovalSource(root: string): BgRemovalSource {
  const pkgDir = join(root, 'node_modules', '@dloizides', 'background-removal');
  const ortRoot = join(root, 'node_modules', 'onnxruntime-web');
  return { pkgDir, ortDir: join(ortRoot, 'dist'), pkgVersion: versionOf(pkgDir), ortVersion: versionOf(ortRoot) };
}

/** Serves the model and runtime from our own origin in dev and copies them into dist at build. */
export function bgRemovalAssetsPlugin(root: string): Plugin {
  const source = bgRemovalSource(root);
  const copies = bgRemovalCopies(source, readdirSync(source.ortDir));
  const byUrl = new Map(copies.map((c) => [`/${c.to}`, c.from]));
  let outDir = 'dist';
  return {
    name: 'bg-removal-assets',
    config: () => ({ define: { __BG_REMOVAL_URLS__: JSON.stringify(bgRemovalUrls(source.pkgVersion, source.ortVersion)) } }),
    configResolved: (config) => { outDir = config.build.outDir; },
    generateBundle: {
      order: 'post',
      handler: (_options, bundle) => {
        for (const fileName of Object.keys(bundle).filter(isBundledOrtWasm)) delete bundle[fileName];
      },
    },
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        const file = byUrl.get(req.url ?? '');
        if (file === undefined) return next();
        if (file.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
        res.end(readFileSync(file));
      });
    },
    writeBundle: () => {
      for (const c of copies) {
        const target = join(root, outDir, c.to);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(c.from, target);
      }
    },
  };
}
