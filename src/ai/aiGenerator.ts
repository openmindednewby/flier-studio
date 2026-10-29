import type { FlierDoc } from '@dloizides/poster-render';
import { docFromPrompt, docWith } from '../llm/promptFallback';
import { fitLayout, type AiSettings } from './aiSettings';
import { gapFill } from './gapFill';
import { settingsFromPrompt } from './keywordTier';
import { TierId } from './TierId';
import type { TierReply, TierRequest } from './tierWorker';

export interface AiOutcome {
  doc: FlierDoc;
  byModel: boolean;
}

type MakeWorker = () => Worker;

const tierWorker: MakeWorker = () => new Worker(new URL('./tierWorker.ts', import.meta.url), { type: 'module' });

/** The flier from the embedding settings with keyword gap fill, or from the keyword match alone when the model failed. */
export function outcomeFor(prompt: string, settings: AiSettings | undefined): AiOutcome {
  if (settings === undefined) return { doc: docFromPrompt(prompt), byModel: false };
  return { doc: docWith(prompt, fitLayout(gapFill(settings, settingsFromPrompt(prompt)))), byModel: true };
}

/** Generate through the embedding tier in a worker; the model loads on the first Generate only. */
export function createAiGenerator(makeWorker: MakeWorker = tierWorker): { generate(prompt: string): Promise<AiOutcome> } {
  let worker: Worker | null = null;
  let next = 0;
  const pending = new Map<number, (settings: AiSettings | undefined) => void>();
  const failAll = (): void => {
    for (const resolve of pending.values()) resolve(undefined);
    pending.clear();
    worker = null;
  };
  const start = (): Worker => {
    const w = makeWorker();
    w.addEventListener('message', (e: MessageEvent<TierReply>) => {
      if (e.data.kind !== 'done') return;
      pending.get(e.data.id)?.(e.data.settings);
      pending.delete(e.data.id);
    });
    w.addEventListener('error', failAll);
    return w;
  };
  return {
    async generate(prompt: string): Promise<AiOutcome> {
      const w = worker ?? start();
      worker = w;
      next += 1;
      const id = next;
      const settings = await new Promise<AiSettings | undefined>((resolve) => {
        pending.set(id, resolve);
        w.postMessage({ id, tier: TierId.Embed, prompt, webGpu: false } satisfies TierRequest);
      });
      return outcomeFor(prompt, settings);
    },
  };
}
