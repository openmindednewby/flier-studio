import type { FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import { docFromPrompt } from '../llm/promptFallback';
import { button, el, labelled } from './dom';

/** Prompt box; Generate fills the flier with the keyword match, in this browser. */
export function renderPromptPanel(container: HTMLElement, apply: (doc: FlierDoc) => void): void {
  const prompt = el('textarea', { rows: '3', placeholder: FM('prompt.placeholder'), 'data-testid': 'prompt-text' });
  const status = el('p', { class: 'muted', role: 'status', 'aria-live': 'polite', 'data-testid': 'prompt-status' });
  const generate = (): void => {
    apply(docFromPrompt(prompt.value));
    status.textContent = FM('prompt.done');
  };
  container.replaceChildren(
    el('h2', { text: FM('prompt.heading') }),
    el('p', { class: 'muted', 'data-testid': 'ai-note', text: FM('prompt.note') }),
    labelled('prompt.label', prompt),
    button('prompt.generate', 'prompt-generate', generate),
    status,
  );
}
