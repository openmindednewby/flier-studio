import { flierDocSchema, kizombaWorkshopDocs, type FlierDoc } from '@dloizides/poster-render';
import { GenerateSource } from './GenerateSource';
import { parseLlmDoc } from './parseLlmDoc';
import { docFromPrompt } from './promptFallback';
import { hasWebGpuAdapter } from './webGpu';

const MB = 1024 * 1024;
const MODEL_MB = 400;
export const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct-GGUF';
export const MAX_MODEL_BYTES = MODEL_MB * MB;

interface ChatClient {
  chat: (text: string) => Promise<string>;
}

interface LlmModule {
  run(model: string, opts: { maxModelBytes: number; onProgress?: (e: unknown) => void }): Promise<ChatClient>;
}

export interface GenerateDeps {
  hasWebGpu(): Promise<boolean>;
  loadLlm(): Promise<LlmModule>;
  onProgress?: (e: unknown) => void;
}

export interface GenerateOutcome {
  source: GenerateSource;
  doc: FlierDoc;
  errors: string[];
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
export function createGenerator(deps: GenerateDeps): { generate(prompt: string): Promise<GenerateOutcome> } {
  let client: Promise<ChatClient> | null = null;
  const connect = async (): Promise<ChatClient> => {
    const llm = await deps.loadLlm();
    return llm.run(MODEL_ID, { maxModelBytes: MAX_MODEL_BYTES, onProgress: deps.onProgress });
  };
  return {
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
      return { source: GenerateSource.Fallback, doc: docFromPrompt(prompt), errors: parsed.errors };
    },
  };
}

export function browserDeps(onProgress?: (e: unknown) => void): GenerateDeps {
  return {
    hasWebGpu: async () => hasWebGpuAdapter(typeof navigator === 'undefined' ? undefined : (navigator as never)),
    loadLlm: async () => (await import('@dloizides/llm-run')) as unknown as LlmModule,
    onProgress,
  };
}
