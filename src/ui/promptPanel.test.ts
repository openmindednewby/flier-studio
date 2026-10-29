import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderPromptPanel } from './promptPanel';

const generate = vi.hoisted(() => vi.fn());

vi.mock('../ai/aiGenerator', async (original) => ({ ...(await original<typeof import('../ai/aiGenerator')>()), createAiGenerator: () => ({ generate }) }));

function mount(): HTMLButtonElement {
  const box = document.createElement('section');
  document.body.replaceChildren(box);
  renderPromptPanel(box, () => undefined);
  return box.querySelector('[data-testid="prompt-generate"]') as HTMLButtonElement;
}

const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  generate.mockReset();
});

describe('renderPromptPanel', () => {
  it('when the generator throws, enables Generate again', async () => {
    generate.mockRejectedValue(new Error('no worker'));
    const go = mount();

    go.click();

    await settle();
    expect(go.disabled).toBe(false);
  });

  it('when a Generate finishes with focus lost, returns focus to Generate', async () => {
    generate.mockRejectedValue(new Error('no worker'));
    const go = mount();

    go.click();

    await settle();
    expect(document.activeElement).toBe(go);
  });
});
