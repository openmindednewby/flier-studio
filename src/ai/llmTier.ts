import type { ProgressEvent, run } from '@dloizides/llm-run';
import { createLlmTier as createConfigLlmTier, type ConfigTier } from '@dloizides/prompt-to-config';
import { AI_SCHEMA, type AiSettings } from './aiSettings';

export const LLM_MODEL_ID = 'unsloth/SmolLM2-135M-Instruct-GGUF';

const SYSTEM = [
  'Pick poster settings for the request. Reply with JSON only.',
  'format: story (tall), post (feed), square, phone (phone wallpaper), desktop (computer wallpaper).',
  'layout: picture-right, picture-left, picture-bottom, list (several dates), phone-clock-safe, desktop-safe.',
  'palette: sand, night (dark), sea (blue), rose (pink), golden-horizon. fonts: classic, modern, elegant, coastal.',
  'title: the dance style in capitals. date like "Saturday 31 October", time like "20:00 - 21:00", "" when absent.',
].join('\n');
const EXAMPLE_ASK = 'Zumba class on Monday 2 March at 18:00, square';
const EXAMPLE_REPLY = '{"format":"square","layout":"picture-right","palette":"sand","fonts":"classic","background":"tint","pictureAnchor":"center","pictureScale":"1","title":"ZUMBA","subtitle":"CLASS","date":"Monday 2 March","time":"18:00"}';

export interface LlmTierDeps {
  run: typeof run;
  webGpu: boolean;
  onProgress?: (e: ProgressEvent) => void;
}

/** Tier 1: SmolLM2-135M over the shared grammar-constrained LLM tier with the Flier schema and prompt. */
export function createLlmTier(deps: LlmTierDeps): ConfigTier<AiSettings> & { readonly nGpuLayers: number } {
  return createConfigLlmTier({
    run: deps.run,
    modelId: LLM_MODEL_ID,
    webGpu: deps.webGpu,
    schema: AI_SCHEMA,
    system: SYSTEM,
    examples: [{ ask: EXAMPLE_ASK, reply: EXAMPLE_REPLY }],
    onProgress: deps.onProgress,
  });
}
