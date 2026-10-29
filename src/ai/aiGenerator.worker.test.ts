import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAiGenerator, type AiOutcome } from './aiGenerator';
import { AiStatus } from './AiStatus';
import type { EmbedSettings } from './embedTier';
import { settingsFromPrompt } from './keywordTier';
import { TierId } from './TierId';
import type { TierReply } from './tierWorker';

const DEADLINE_MS = 1000;
const OTHER_ID = 99;
const PROMPT = 'Salsa night on Saturday 14 November';

class FakeWorker extends EventTarget {
  posted = 0;
  terminations = 0;
  postMessage(): void {
    this.posted += 1;
  }
  terminate(): void {
    this.terminations += 1;
  }
  reply(data: TierReply): void {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }
}

function setup(): { fake: FakeWorker; made: () => number; generate: () => Promise<AiOutcome> } {
  const fake = new FakeWorker();
  let count = 0;
  const generator = createAiGenerator(() => {
    count += 1;
    return fake as unknown as Worker;
  }, DEADLINE_MS);
  return { fake, made: () => count, generate: () => generator.generate(PROMPT) };
}

async function isSettled(p: Promise<unknown>): Promise<boolean> {
  let settled = false;
  void p.then(() => (settled = true));
  await new Promise((r) => setTimeout(r, 0));
  return settled;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('createAiGenerator', () => {
  it('with a done reply that carries an error, fills from keywords and says the model failed', async () => {
    const { fake, generate } = setup();
    const pending = generate();

    fake.reply({ kind: 'done', id: 1, ms: 1, error: 'boom' });

    expect((await pending).status).toBe(AiStatus.Failed);
  });

  it('with a worker error event, fails the request and terminates the worker', async () => {
    const { fake, generate } = setup();
    const pending = generate();

    fake.dispatchEvent(new Event('error'));

    expect([(await pending).status, fake.terminations]).toEqual([AiStatus.Failed, 1]);
  });

  it('with a progress reply, keeps the request waiting', async () => {
    const { fake, generate } = setup();
    const pending = generate();

    fake.reply({ kind: 'progress', tier: TierId.Embed, file: 'model.gguf', totalBytes: 1 });

    expect(await isSettled(pending)).toBe(false);
  });

  it('with a done reply for another request id, keeps this request waiting', async () => {
    const { fake, generate } = setup();
    const pending = generate();
    const settings: EmbedSettings = { ...settingsFromPrompt(''), matched: ['palette'] };

    fake.reply({ kind: 'done', id: OTHER_ID, ms: 1, settings });

    expect(await isSettled(pending)).toBe(false);
  });

  it('past the deadline, says the model took too long and terminates the worker', async () => {
    vi.useFakeTimers();
    const { fake, generate } = setup();
    const pending = generate();

    vi.advanceTimersByTime(DEADLINE_MS);

    expect([(await pending).status, fake.terminations]).toEqual([AiStatus.TimedOut, 1]);
  });

  it('after a timeout, the next Generate starts a new worker', async () => {
    vi.useFakeTimers();
    const { made, generate } = setup();
    const first = generate();
    vi.advanceTimersByTime(DEADLINE_MS);
    await first;

    void generate();

    expect(made()).toBe(2);
  });
});
