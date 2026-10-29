import type { FlierDoc } from '@dloizides/poster-render';
import { docFromPrompt, docWith } from '../llm/promptFallback';
import { fitLayout } from './aiSettings';
import { AiStatus } from './AiStatus';
import type { EmbedSettings } from './embedTier';
import { gapFill } from './gapFill';
import { settingsFromPrompt } from './keywordTier';
import { TierId } from './TierId';
import type { TierReply, TierRequest } from './tierWorker';

export interface AiOutcome {
  doc: FlierDoc;
  status: AiStatus;
}

type MakeWorker = () => Worker;
type Settle = (result: EmbedSettings | AiStatus) => void;

export const GENERATE_DEADLINE_MS = 90_000;

const tierWorker: MakeWorker = () => new Worker(new URL('./tierWorker.ts', import.meta.url), { type: 'module' });

/** The flier from the embedding settings with keyword gap fill, or from the keyword match alone when the model failed. */
export function outcomeFor(prompt: string, result: EmbedSettings | AiStatus): AiOutcome {
  if (typeof result === 'string') return { doc: docFromPrompt(prompt), status: result };
  const status = result.matched.length > 0 ? AiStatus.Model : AiStatus.KeywordsOnly;
  return { doc: docWith(prompt, fitLayout(gapFill(result, settingsFromPrompt(prompt)))), status };
}

/** Generate through the embedding tier in a worker; the model loads on first Generate, a stuck run ends at the deadline. */
export function createAiGenerator(makeWorker: MakeWorker = tierWorker, deadlineMs = GENERATE_DEADLINE_MS): { generate(prompt: string): Promise<AiOutcome> } {
  let worker: Worker | null = null;
  let next = 0;
  const pending = new Map<number, Settle>();
  const failAll = (status: AiStatus): void => {
    for (const settle of pending.values()) settle(status);
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  const onReply = (e: MessageEvent<TierReply>): void => {
    if (e.data.kind !== 'done') return;
    const settle = pending.get(e.data.id);
    pending.delete(e.data.id);
    settle?.((e.data.settings as EmbedSettings | undefined) ?? AiStatus.Failed);
  };
  const start = (): Worker => {
    const w = makeWorker();
    w.addEventListener('message', onReply);
    w.addEventListener('error', () => failAll(AiStatus.Failed));
    return w;
  };
  return {
    async generate(prompt: string): Promise<AiOutcome> {
      const w = worker ?? start();
      worker = w;
      next += 1;
      const id = next;
      const result = await new Promise<EmbedSettings | AiStatus>((resolve) => {
        const timer = setTimeout(() => failAll(AiStatus.TimedOut), deadlineMs);
        pending.set(id, (r) => {
          clearTimeout(timer);
          resolve(r);
        });
        w.postMessage({ id, tier: TierId.Embed, prompt, webGpu: false } satisfies TierRequest);
      });
      return outcomeFor(prompt, result);
    },
  };
}
