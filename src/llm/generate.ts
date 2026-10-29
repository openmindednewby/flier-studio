import type { LlmClient, ProgressEvent, run } from '@dloizides/llm-run';
import { flierDocSchema, kizombaWorkshopDocs, type FlierDoc } from '@dloizides/poster-render';
import { hasWebGpuAdapter } from '@dloizides/text-generation';
import { GenerateSource } from './GenerateSource';
import { parseLlmDoc } from './parseLlmDoc';
import { docFromPrompt } from './promptFallback';

const MB = 1024 * 1024;
const MODEL_MB = 400;
export const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct-GGUF';
export const MAX_MODEL_BYTES = MODEL_MB * MB;

interface LlmModule {
  run: typeof run;
}

export interface GenerateDeps {
  hasWebGpu(): Promise<boolean>;
  loadLlm(): Promise<LlmModule>;
  onProgress?: (e: ProgressEvent) => void;
}

export interface GenerateOutcome {
  source: GenerateSource;
  doc: FlierDoc;
  errors: string[];
  reply?: string;
}

export function buildPrompt(prompt: string): string {
  return [
    'You fill a JSON document for an event flier. Reply with ONE JSON object only, no prose.',
    'It must match this JSON Schema:',
    JSON.stringify(flierDocSchema),
    'Example:',
    JSON.stringify(kizombaWorkshopDocs[0]),
    `Request: ${prompt}`,
  ].join('\n');
}

/** Prompt-to-flier generator; the model module is imported on the first generate() only. */
export function createGenerator(deps: GenerateDeps): { generate(prompt: string): Promise<GenerateOutcome>; loadMs(): number | null } {
  let client: Promise<LlmClient> | null = null;
  let loadMs: number | null = null;
  const connect = async (): Promise<LlmClient> => {
    const started = performance.now();
    const llm = await deps.loadLlm();
    const ready = await llm.run(MODEL_ID, { maxModelBytes: MAX_MODEL_BYTES, onProgress: deps.onProgress });
    loadMs = Math.round(performance.now() - started);
    return ready;
  };
  return {
    loadMs: () => loadMs,
    async generate(prompt: string): Promise<GenerateOutcome> {
      if (!(await deps.hasWebGpu())) return { source: GenerateSource.NoWebGpu, doc: docFromPrompt(prompt), errors: [] };
      let reply: string;
      try {
        client ??= connect();
        reply = await (await client).chat(buildPrompt(prompt));
      } catch (e) {
        client = null;
        return { source: GenerateSource.ModelFailed, doc: docFromPrompt(prompt), errors: [String(e)] };
      }
      const parsed = parseLlmDoc(reply);
      if (parsed.ok) return { source: GenerateSource.Model, doc: parsed.doc, errors: [] };
      return { source: GenerateSource.Fallback, doc: docFromPrompt(prompt), errors: parsed.errors, reply };
    },
  };
}

export function browserDeps(onProgress?: (e: ProgressEvent) => void): GenerateDeps {
  return {
    hasWebGpu: async () => hasWebGpuAdapter(),
    loadLlm: async () => import('@dloizides/llm-run'),
    onProgress,
  };
}
