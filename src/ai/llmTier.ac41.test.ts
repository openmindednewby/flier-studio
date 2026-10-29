import { describe, expect, it, vi } from 'vitest';
import { createLlmTier, LLM_MODEL_ID } from './llmTier';

const REPLY = '{"format":"post","layout":"picture-right","palette":"night","fonts":"classic","background":"solid","pictureAnchor":"center","pictureScale":"1","title":"SALSA","subtitle":"PARTY","date":"","time":""}';
const PROMPT = 'Salsa social night, Instagram post, dark colours';

function fakeRun(): { run: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } {
  const create = vi.fn().mockResolvedValue({ choices: [{ message: { content: REPLY } }] });
  const run = vi.fn().mockResolvedValue({ chat: { completions: { create } }, unload: vi.fn() });
  return { run, create };
}

describe('createLlmTier', () => {
  it('with no WebGPU, loads SmolLM2-135M with nGpuLayers 0', async () => {
    const { run } = fakeRun();
    const tier = createLlmTier({ run, webGpu: false });

    await tier.settings(PROMPT);

    expect(run).toHaveBeenCalledWith(LLM_MODEL_ID, expect.objectContaining({ nGpuLayers: 0 }));
  });

  it('with a prompt, sends the settings grammar with the request', async () => {
    const { run, create } = fakeRun();
    const tier = createLlmTier({ run, webGpu: true });

    await tier.settings(PROMPT);

    expect(String(create.mock.calls[0][0].grammar)).toContain('root ::=');
  });

  it('with a grammar-shaped reply, returns its settings', async () => {
    const { run } = fakeRun();
    const tier = createLlmTier({ run, webGpu: true });

    const s = await tier.settings(PROMPT);

    expect([s.format, s.palette]).toEqual(['post', 'night']);
  });
});
