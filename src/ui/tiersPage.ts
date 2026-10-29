import { hasWebGpuAdapter } from '@dloizides/text-generation';
import { fitLayout, type AiSettings } from '../ai/aiSettings';
import { GRADED_KEY, gradeSettings } from '../ai/gradedKey';
import { settingsFromPrompt } from '../ai/keywordTier';
import { TierId } from '../ai/TierId';
import { p50 } from '../ai/tierStats';
import type { TierReply, TierRequest } from '../ai/tierWorker';

const MB = 1024 * 1024;
const WARM_UP = 'Kizomba class on Monday 2 March at 19:00';
const ROUND = 10;

interface Row { prompt: string; right: boolean; misses: string[]; settings?: AiSettings; error?: string }

interface TierResult { tier: TierId; downloadMB: number; loadMs: number; msPerPrompt: number[]; p50Ms: number; longestTaskMs: number; score: number; nGpuLayers?: number; rows: Row[] }

type Answer = { ms: number; settings?: AiSettings; error?: string; nGpuLayers?: number };
type Ask = (prompt: string) => Promise<Answer>;

const longTasks: { start: number; end: number }[] = [];

function longestBetween(t0: number, t1: number): number {
  const inside = longTasks.filter((t) => t.start >= t0 && t.start <= t1).map((t) => t.end - t.start);
  return Math.round(Math.max(0, ...inside));
}

function workerAsk(worker: Worker, tier: TierId, webGpu: boolean, bytes: Map<string, number>): Ask {
  let next = 0;
  const pending = new Map<number, (r: Answer) => void>();
  worker.addEventListener('message', (e: MessageEvent<TierReply>) => {
    const reply = e.data;
    if (reply.kind === 'progress' && reply.tier === tier) bytes.set(reply.file, reply.totalBytes);
    if (reply.kind === 'done') pending.get(reply.id)?.(reply);
  });
  return (prompt) => new Promise((resolve) => {
    next += 1;
    pending.set(next, resolve);
    worker.postMessage({ id: next, tier, prompt, webGpu } satisfies TierRequest);
  });
}

async function measureTier(tier: TierId, ask: Ask, bytes: Map<string, number>, live: HTMLElement): Promise<TierResult> {
  const t0 = performance.now();
  const warm = await ask(WARM_UP);
  const rows: Row[] = [];
  const msPerPrompt: number[] = [];
  for (const [k, key] of GRADED_KEY.entries()) {
    const got = await ask(key.prompt);
    msPerPrompt.push(Math.round(got.ms));
    const grade = got.settings === undefined ? { right: false, misses: ['error'] } : gradeSettings(key.expect, fitLayout(got.settings));
    rows.push({ prompt: key.prompt, ...grade, settings: got.settings, error: got.error });
    live.textContent = JSON.stringify({ tier, prompt: k + 1, of: GRADED_KEY.length, ms: msPerPrompt[k] });
  }
  const downloadMB = Math.round(([...bytes.values()].reduce((a, b) => a + b, 0) / MB) * ROUND) / ROUND;
  const score = rows.filter((r) => r.right).length;
  return { tier, downloadMB, loadMs: Math.round(warm.ms), msPerPrompt, p50Ms: p50(msPerPrompt), longestTaskMs: longestBetween(t0, performance.now()), score, nGpuLayers: warm.nGpuLayers, rows };
}

const keywordAsk: Ask = (prompt) => {
  const started = performance.now();
  const settings = settingsFromPrompt(prompt);
  return Promise.resolve({ ms: performance.now() - started, settings });
};

/** The AC-42 tier comparison page (?measure=tiers): grades each tier on the 20 prompts and prints JSON. */
export async function runTiersMeasure(out: HTMLElement, live: HTMLElement): Promise<void> {
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) longTasks.push({ start: e.startTime, end: e.startTime + e.duration });
  }).observe({ type: 'longtask', buffered: true });
  const webGpu = await hasWebGpuAdapter();
  const wanted = (new URLSearchParams(location.search).get('tiers') ?? 'keyword,embed,llm').split(',');
  const worker = new Worker(new URL('../ai/tierWorker.ts', import.meta.url), { type: 'module' });
  const results: TierResult[] = [];
  for (const tier of [TierId.Keyword, TierId.Embed, TierId.Llm].filter((t) => wanted.includes(t))) {
    const bytes = new Map<string, number>();
    const ask = tier === TierId.Keyword ? keywordAsk : workerAsk(worker, tier, webGpu, bytes);
    results.push(await measureTier(tier, ask, bytes, live));
  }
  worker.terminate();
  const env = { at: new Date().toISOString(), viewport: `${innerWidth}x${innerHeight}`, userAgent: navigator.userAgent, webGpu, crossOriginIsolated, cores: navigator.hardwareConcurrency };
  out.textContent = JSON.stringify({ env, tiers: results }, null, 2);
}
