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

const EMBED_URL = 'https://huggingface.co/second-state/All-MiniLM-L6-v2-Embedding-GGUF/resolve/main/all-MiniLM-L6-v2-Q8_0.gguf';
const WLLAMA_WASM = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/src/wasm/wllama.wasm';
const EMBED_CTX = 512;

type Tier = { settings(prompt: string): Promise<AiSettings>; nGpuLayers?: number };
const tiers = tierCache<TierId, Tier>();
const post = (reply: TierReply): void => {
  self.postMessage(reply);
};

async function loadEmbed(): Promise<Tier> {
  const { Wllama } = await import('@wllama/wllama/esm/index.js');
  const wllama = new Wllama({ default: WLLAMA_WASM });
  await wllama.loadModelFromUrl(EMBED_URL, {
    embeddings: true,
    pooling_type: 'LLAMA_POOLING_TYPE_MEAN',
    n_ctx: EMBED_CTX,
    n_gpu_layers: 0,
    progressCallback: ({ total }: { loaded: number; total: number }) => post({ kind: 'progress', tier: TierId.Embed, file: EMBED_URL, totalBytes: total }),
  });
  return createEmbedTier(async (text) => {
    const res = await wllama.createEmbedding({ input: text });
    return res.data[0].embedding as number[];
  });
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
