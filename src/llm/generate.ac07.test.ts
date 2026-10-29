import { FormatId, kizombaWorkshopDocs } from '@dloizides/poster-render';
import { describe, expect, it, vi } from 'vitest';
import { GenerateSource } from './GenerateSource';
import { MAX_MODEL_BYTES, MODEL_ID, createGenerator, type GenerateDeps } from './generate';

const MB = 1024 * 1024;
const FENCE = '```';
const event = { ...kizombaWorkshopDocs[0], format: FormatId.Post };

interface TestDeps extends GenerateDeps {
  load: ReturnType<typeof vi.fn>;
}

function deps(reply: string, webgpu = true): TestDeps {
  const chat = Object.assign(vi.fn(async () => reply), { completions: { create: vi.fn() } });
  const load = vi.fn(async () => ({ run: vi.fn(async () => ({ chat, unload: vi.fn() })) }));
  return { hasWebGpu: async () => webgpu, loadLlm: load, load };
}

describe('createGenerator', () => {
  it('with no generate call, never loads the model module', () => {
    const d = deps(JSON.stringify(event));

    createGenerator(d);

    expect(d.load).not.toHaveBeenCalled();
  });

  it('with a model reply wrapped in prose and a code fence, returns the parsed valid doc', async () => {
    const d = deps(`Here it is:\n${FENCE}json\n${JSON.stringify(event)}\n${FENCE}`);

    const outcome = await createGenerator(d).generate('salsa post');

    expect(outcome.source).toBe(GenerateSource.Model);
    expect(outcome.doc.format).toBe(FormatId.Post);
    expect(d.load).toHaveBeenCalledTimes(1);
  });

  it('with a schema-invalid model reply, falls back to the keyword preset and reports the schema errors', async () => {
    const d = deps(JSON.stringify({ ...event, layout: 'zigzag' }));

    const outcome = await createGenerator(d).generate('desktop wallpaper');

    expect(outcome.source).toBe(GenerateSource.Fallback);
    expect(outcome.doc.format).toBe(FormatId.Desktop);
    expect(outcome.errors.join(' ')).toContain('layout');
  });

  it('with a reply that is not JSON, returns the raw reply beside the fallback', async () => {
    const d = deps('Sure! Here is your flier.', true);

    const outcome = await createGenerator(d).generate('salsa');

    expect(outcome.reply).toBe('Sure! Here is your flier.');
  });

  it('before and after the model loads, reports no load time and then a load time', async () => {
    const generator = createGenerator(deps(JSON.stringify(event), true));
    const before = generator.loadMs();

    await generator.generate('salsa');

    expect(before).toBeNull();
    expect(generator.loadMs()).toBeGreaterThanOrEqual(0);
  });

  it('with no WebGPU, uses the keyword preset without loading the model', async () => {
    const d = deps(JSON.stringify(event), false);

    const outcome = await createGenerator(d).generate('square salsa');

    expect(outcome.source).toBe(GenerateSource.NoWebGpu);
    expect(outcome.doc.format).toBe(FormatId.Square);
    expect(d.load).not.toHaveBeenCalled();
  });

  it('with two generate calls, loads the model once', async () => {
    const d = deps(JSON.stringify(event));
    const generator = createGenerator(d);
    await generator.generate('one');

    await generator.generate('two');

    expect(d.load).toHaveBeenCalledTimes(1);
  });

  it('with the model failing to load, falls back to the keyword preset instead of throwing', async () => {
    const d = deps(JSON.stringify(event));
    d.loadLlm = async () => { throw new Error('LlmRunError: E_NETWORK'); };

    const outcome = await createGenerator(d).generate('square salsa');

    expect(outcome.source).toBe(GenerateSource.ModelFailed);
    expect(outcome.doc.format).toBe(FormatId.Square);
  });

  it('with the chat call failing, falls back to the keyword preset instead of throwing', async () => {
    const chat = Object.assign(vi.fn(async () => { throw new Error('device lost'); }), { completions: { create: vi.fn() } });
    const d: GenerateDeps = { hasWebGpu: async () => true, loadLlm: async () => ({ run: async () => ({ chat, unload: vi.fn() }) }) };

    const outcome = await createGenerator(d).generate('desktop wallpaper');

    expect(outcome.source).toBe(GenerateSource.ModelFailed);
    expect(outcome.doc.format).toBe(FormatId.Desktop);
  });

  it('with the chosen model, caps the download at 400 MB', () => {
    const cap = MAX_MODEL_BYTES;

    expect(cap).toBeLessThanOrEqual(400 * MB);
    expect(MODEL_ID).toMatch(/GGUF/);
  });
});
