import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const RUN_MS = 40 * 60 * 1000;

test.skip(process.env.AI_TIERS !== '1', 'AC-42 tier comparison downloads ~160 MB: run with AI_TIERS=1');

test('AC-42 grades keyword, embedding and SmolLM2-135M on the 20 prompts', async ({ page }, info) => {
  test.setTimeout(RUN_MS);
  const heldout = process.env.AI_SET === 'heldout';
  await page.goto(heldout ? '/?measure=tiers&tiers=keyword,embed&set=heldout' : '/?measure=tiers');

  const out = page.getByTestId('measure');
  await expect(out).not.toBeEmpty({ timeout: RUN_MS });

  mkdirSync('docs/ai-tiers', { recursive: true });
  writeFileSync(`docs/ai-tiers/result-${heldout ? 'heldout-' : ''}${info.project.name}.json`, (await out.textContent()) ?? '');
});
