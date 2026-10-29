import type { FlierDoc } from '@dloizides/poster-render';
import { createAiGenerator } from '../ai/aiGenerator';
import { FM } from '../i18n/fm';
import { button, el, labelled } from './dom';

/** Prompt box; Generate runs the on-device embedding model in a worker, keywords fill what it misses. */
export function renderPromptPanel(container: HTMLElement, apply: (doc: FlierDoc) => void): void {
  const prompt = el('textarea', { rows: '3', placeholder: FM('prompt.placeholder'), 'data-testid': 'prompt-text' });
  const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'prompt-status' });
  const generator = createAiGenerator();
  const generate = async (go: HTMLButtonElement): Promise<void> => {
    go.disabled = true;
    status.textContent = FM('prompt.working');
    const outcome = await generator.generate(prompt.value);
    apply(outcome.doc);
    status.textContent = FM(outcome.byModel ? 'prompt.done' : 'prompt.modelFailed');
    go.disabled = false;
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
