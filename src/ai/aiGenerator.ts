import type { FlierDoc } from '@dloizides/poster-render';
import { createTierRunner, gapFill, TierStatus } from '@dloizides/prompt-to-config';
import { docFromPrompt, docWith } from '../llm/promptFallback';
import { fitLayout } from './aiSettings';
import { AiStatus } from './AiStatus';
import type { EmbedSettings } from './embedTier';
import { settingsFromPrompt } from './keywordTier';
import { TierId } from './TierId';
import type { TierRequest } from './tierWorker';

export interface AiOutcome {
  doc: FlierDoc;
  status: AiStatus;
}

type MakeWorker = () => Worker;

export const GENERATE_DEADLINE_MS = 90_000;

const STATUS_FOR: Readonly<Record<TierStatus, AiStatus>> = { [TierStatus.Failed]: AiStatus.Failed, [TierStatus.TimedOut]: AiStatus.TimedOut };

const tierWorker: MakeWorker = () => new Worker(new URL('./tierWorker.ts', import.meta.url), { type: 'module' });

/** The flier from the embedding settings with keyword gap fill, or from the keyword match alone when the model failed. */
export function outcomeFor(prompt: string, result: EmbedSettings | AiStatus): AiOutcome {
  if (typeof result === 'string') return { doc: docFromPrompt(prompt), status: result };
  const status = result.matched.length > 0 ? AiStatus.Model : AiStatus.KeywordsOnly;
  return { doc: docWith(prompt, fitLayout(gapFill(result, settingsFromPrompt(prompt)))), status };
}

/** Generate through the embedding tier in a worker; the model loads on first Generate, a stuck run ends at the deadline. */
export function createAiGenerator(makeWorker: MakeWorker = tierWorker, deadlineMs = GENERATE_DEADLINE_MS): { generate(prompt: string): Promise<AiOutcome> } {
  const runner = createTierRunner<Omit<TierRequest, 'id'>, EmbedSettings>(makeWorker, deadlineMs);
  return {
    async generate(prompt: string): Promise<AiOutcome> {
      const result = await runner.run({ tier: TierId.Embed, prompt, webGpu: false });
      return outcomeFor(prompt, typeof result === 'string' ? STATUS_FOR[result] : result);
    },
  };
}
