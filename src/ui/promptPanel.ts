import type { FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import { browserDeps, createGenerator } from '../llm/generate';
import { outcomeMessage } from '../llm/outcomeMessage';
import { button, el, labelled } from './dom';

const PERCENT = 100;

function progressText(e: unknown): string {
  const p = e as { loaded?: number; total?: number } | null;
  if (p?.loaded === undefined || p.total === undefined || p.total === 0) return '';
  return `${String(Math.round((p.loaded / p.total) * PERCENT))}%`;
}

/** Prompt box; the model module and weights load only when Generate is pressed. */
export function renderPromptPanel(container: HTMLElement, apply: (doc: FlierDoc) => void): void {
  const prompt = el('textarea', { rows: '3', placeholder: FM('prompt.placeholder'), 'data-testid': 'prompt-text' });
  const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'prompt-status' });
  let generator: ReturnType<typeof createGenerator> | null = null;
  const generate = async (): Promise<void> => {
    generator ??= createGenerator(browserDeps((e) => { status.textContent = FM('prompt.progress', progressText(e)); }));
    status.textContent = FM('prompt.working');
    try {
      const outcome = await generator.generate(prompt.value);
      apply(outcome.doc);
      status.textContent = outcomeMessage(outcome);
    } catch {
      status.textContent = FM('prompt.failed');
    }
  };
  container.replaceChildren(
    el('h2', { text: FM('prompt.heading') }),
    labelled('prompt.label', prompt),
    button('prompt.generate', 'prompt-generate', () => void generate()),
    status,
  );
}
