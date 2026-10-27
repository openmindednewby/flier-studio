import { mkdirSync, writeFileSync } from 'node:fs';
import { FIXED_PROMPTS } from '../src/llm/fixedPrompts';
import { measurePrompts } from '../src/llm/measure';
import { docFromPrompt } from '../src/llm/promptFallback';

const OUT_DIR = 'docs/measurements';

const result = await measurePrompts(FIXED_PROMPTS, async (p) => docFromPrompt(p));
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_DIR + '/prompts-fallback.json', JSON.stringify({ mode: 'keyword-fallback', at: new Date().toISOString(), ...result }, null, 2));
console.log('keyword fallback: ' + String(result.valid) + '/' + String(result.total) + ' valid');
console.log('model mode runs in the browser: open /?measure=llm on a WebGPU device');
