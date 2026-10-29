import { FM } from '../i18n/fm';
import { el, textButton } from './dom';

export const UNDO_MS = 5000;
const GAP = 8;

/** A toast with an Undo button for `ms`, focused on show; `expired` runs when it leaves without Undo. */
export function undoToast(message: string, undo: () => void, expired: () => void = () => undefined, ms: number = UNDO_MS): void {
  document.querySelector('[data-testid="drafts-toast"]')?.remove();
  const toast = el('div', { class: 'undo-toast', role: 'status', 'data-testid': 'drafts-toast' });
  const timer = window.setTimeout(() => {
    const focused = toast.contains(document.activeElement) || document.activeElement === document.body;
    toast.remove();
    if (focused) expired();
  }, ms);
  const button = textButton(FM('drafts.undo'), 'drafts-undo', () => { window.clearTimeout(timer); toast.remove(); undo(); });
  toast.append(el('span', { text: message }), button);
  const bar = document.querySelector('[data-testid="mini-preview"]')?.getBoundingClientRect();
  if (bar !== undefined && bar.height > 1 && bar.top < innerHeight) toast.style.bottom = `${String(Math.round(innerHeight - bar.top + GAP))}px`;
  document.body.append(toast);
  button.focus();
}
