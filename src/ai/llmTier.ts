import type { ProgressEvent, run } from '@dloizides/llm-run';
import { parseSettings, type AiSettings } from './aiSettings';
import { settingsGrammar } from './settingsGrammar';

const MB = 1024 * 1024;
const MAX_MB = 145;
const MAX_TOKENS = 128;
export const GPU_ALL_LAYERS = 99;
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

/** Tier 1: SmolLM2-135M through llm-run, reply constrained by the settings grammar, GPU layers explicit. */
export function createLlmTier(deps: LlmTierDeps): { settings(prompt: string): Promise<AiSettings>; nGpuLayers: number } {
  const nGpuLayers = deps.webGpu ? GPU_ALL_LAYERS : 0;
  let client: ReturnType<typeof run> | null = null;
  const grammar = settingsGrammar();
  return {
    nGpuLayers,
    async settings(prompt: string): Promise<AiSettings> {
      client ??= deps.run(LLM_MODEL_ID, { maxModelBytes: MAX_MB * MB, nGpuLayers, onProgress: deps.onProgress });
      const reply = await (await client).chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: EXAMPLE_ASK },
          { role: 'assistant', content: EXAMPLE_REPLY },
          { role: 'user', content: prompt },
        ],
        grammar,
        max_tokens: MAX_TOKENS,
        temperature: 0,
      });
      const parsed = parseSettings(reply.choices[0]?.message.content ?? '');
      if (!parsed.ok) throw new Error(`invalid settings: ${parsed.errors.join(', ')}`);
      return parsed.settings;
    },
  };
}
