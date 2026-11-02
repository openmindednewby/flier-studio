import { DEFAULT_EMBEDDING_MODEL_URL, loadWllamaRuntime, type WllamaModule } from '@dloizides/llm-run/intent';
import type { AiSettings } from './aiSettings';
import { createEmbedTier } from './embedTier';
import { createLlmTier } from './llmTier';
import { tierCache } from './tierCache';
import { TierId } from './TierId';

export interface TierRequest {
  id: number;
  tier: TierId;
  prompt: string;
  webGpu: boolean;
}

export type TierReply =
  | { kind: 'done'; id: number; ms: number; settings?: AiSettings; error?: string; nGpuLayers?: number }
  | { kind: 'progress'; tier: TierId; file: string; totalBytes: number };

type Tier = { settings(prompt: string): Promise<AiSettings>; nGpuLayers?: number };
const tiers = tierCache<TierId, Tier>();
const post = (reply: TierReply): void => {
  self.postMessage(reply);
};

async function loadEmbed(): Promise<Tier> {
  const runtime = await loadWllamaRuntime(
    { model: DEFAULT_EMBEDDING_MODEL_URL, onProgress: ({ total }) => post({ kind: 'progress', tier: TierId.Embed, file: DEFAULT_EMBEDDING_MODEL_URL, totalBytes: total }) },
    { importModule: () => import('@wllama/wllama/esm/index.js') as unknown as Promise<WllamaModule> },
  );
  return createEmbedTier((text) => runtime.embed(text));
}

async function loadLlm(webGpu: boolean): Promise<Tier> {
  const { run } = await import('@dloizides/llm-run');
  return createLlmTier({ run, webGpu, onProgress: (e) => post({ kind: 'progress', tier: TierId.Llm, file: e.file, totalBytes: e.totalBytes }) });
}

async function handle(req: TierRequest): Promise<void> {
  const started = performance.now();
  try {
    const tier = await tiers(req.tier, () => (req.tier === TierId.Llm ? loadLlm(req.webGpu) : loadEmbed()));
    const settings = await tier.settings(req.prompt);
    post({ kind: 'done', id: req.id, ms: performance.now() - started, settings, nGpuLayers: tier.nGpuLayers });
  } catch (e) {
    post({ kind: 'done', id: req.id, ms: performance.now() - started, error: String(e) });
  }
}

self.onmessage = (e: MessageEvent<TierRequest>): void => {
  void handle(e.data);
};
