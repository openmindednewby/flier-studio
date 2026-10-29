import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { GRADED_KEY } from '../src/ai/gradedKey';

const DIR = 'docs/ai-tiers';
const MS_PER_S = 1000;
const MAX_MB = 150;
const MAX_P50_MS = 5000;
const MAX_TASK_MS = 200;
const MIN_SCORE = 18;
const FIELDS = ['format', 'layout', 'palette', 'fonts', 'title', 'date', 'time'] as const;

interface Row { right: boolean; misses: string[]; error?: string }
interface Tier { tier: string; downloadMB: number; loadMs: number; p50Ms: number; longestTaskMs: number; score: number; nGpuLayers?: number; rows: Row[] }
interface Run { env: { viewport: string; webGpu: boolean; crossOriginIsolated: boolean; cores: number; userAgent: string; at: string }; tiers: Tier[] }

const runs = ['mobile', 'desktop'].filter((p) => existsSync(`${DIR}/result-${p}.json`)).map((p) => ({ project: p, run: JSON.parse(readFileSync(`${DIR}/result-${p}.json`, 'utf8')) as Run }));

const passes = (t: Tier): boolean => t.downloadMB <= MAX_MB && t.p50Ms < MAX_P50_MS && t.longestTaskMs <= MAX_TASK_MS && t.score >= MIN_SCORE;
const cell = (row: Row | undefined): string => (row === undefined ? '-' : row.right ? 'right' : `wrong (${row.misses.join(', ')})`);

const lines: string[] = ['# FLIER-2 AC-42 "Pick the lightest that works": three AI tiers on the 20 prompts', ''];
lines.push('Headless Chromium (Playwright) on the dev PC, not the owner\'s GPU. AC-43 limits: download <= 150 MB, p50 < 5 s, main-thread task <= 200 ms, >= 18/20.', '');
for (const { project, run } of runs) {
  lines.push(`## ${project} ${run.env.viewport} (WebGPU ${String(run.env.webGpu)}, cross-origin isolated ${String(run.env.crossOriginIsolated)}, ${run.env.cores} cores, ${run.env.at})`, '');
  lines.push('| Tier | Download MB | Load s | p50 s/prompt | Longest main-thread task ms | Graded | n_gpu_layers | AC-43 |', '|---|---|---|---|---|---|---|---|');
  for (const t of run.tiers) {
    const gpu = t.nGpuLayers === undefined ? '-' : String(t.nGpuLayers);
    lines.push(`| ${t.tier} | ${t.downloadMB} | ${(t.loadMs / MS_PER_S).toFixed(1)} | ${(t.p50Ms / MS_PER_S).toFixed(2)} | ${t.longestTaskMs} | ${t.score}/20 | ${gpu} | ${passes(t) ? 'pass' : 'fail'} |`);
  }
  lines.push('');
}
const last = runs.at(-1)?.run;
lines.push('## Graded key (human-picked; a blank field is not graded) and each tier\'s grade', '');
lines.push(`| # | Prompt | ${FIELDS.join(' | ')} | ${(last?.tiers ?? []).map((t) => t.tier).join(' | ')} |`);
lines.push(`|${'---|'.repeat(2 + FIELDS.length + (last?.tiers.length ?? 0))}`);
GRADED_KEY.forEach((key, i) => {
  const fields = FIELDS.map((f) => (key.expect[f] ?? []).join(' / '));
  const grades = (last?.tiers ?? []).map((t) => cell(t.rows[i]));
  lines.push(`| ${i + 1} | ${key.prompt} | ${fields.join(' | ')} | ${grades.join(' | ')} |`);
});
writeFileSync(`${DIR}/result.md`, `${lines.join('\n')}\n`);
