import type { FlierDoc } from '@dloizides/poster-render';
import { createAiGenerator, outcomeFor, type AiOutcome } from '../ai/aiGenerator';
import { AiStatus } from '../ai/AiStatus';
import { FM } from '../i18n/fm';
import { button, el, labelled } from './dom';

/** Prompt box; Generate runs the on-device embedding model in a worker, keywords fill what it misses. */
export function renderPromptPanel(container: HTMLElement, apply: (doc: FlierDoc) => void): void {
  const prompt = el('textarea', { rows: '3', placeholder: FM('prompt.placeholder'), 'data-testid': 'prompt-text', 'data-autofocus': 'true' });
  const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'prompt-status' });
  const generator = createAiGenerator();
  const run = async (): Promise<AiOutcome> => {
    try {
      return await generator.generate(prompt.value);
    } catch {
      return outcomeFor(prompt.value, AiStatus.Failed);
    }
  };
  const generate = async (go: HTMLButtonElement): Promise<void> => {
    go.disabled = true;
    status.textContent = FM('prompt.working');
    try {
      const outcome = await run();
      apply(outcome.doc);
      status.textContent = FM(outcome.status);
    } finally {
      go.disabled = false;
      if (document.activeElement === document.body) go.focus();
    }
  };
  const go: HTMLButtonElement = button('prompt.generate', 'prompt-generate', () => void generate(go));
  container.replaceChildren(
    el('h2', {}, [FM('prompt.heading'), ' ', el('span', { class: 'badge', text: FM('prompt.badge') })]),
    el('p', { class: 'muted', 'data-testid': 'ai-note', text: FM('prompt.note') }),
    labelled('prompt.label', prompt),
    go,
    status,
  );
}
