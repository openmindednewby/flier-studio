import { FM } from '../i18n/fm';
import { textButton } from './dom';

const PATHS = {
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  more: '<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
  type: '<path d="M4 19 9.5 5h1L16 19M6.3 14h7.4M17 19v-6.5a2.5 2.5 0 0 1 5 0V19"/>',
} as const;

export type IconName = keyof typeof PATHS;

/** An inline 20 px line icon, hidden from screen readers. */
export function iconSvg(name: IconName, filled = false): string {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
}

/** A 44 px square button showing only an icon; `label` is its accessible name. */
export function iconButton(label: string, testId: string, name: IconName, onClick: () => void): HTMLButtonElement {
  const node = textButton(label, testId, onClick, 'icon-button');
  node.innerHTML = iconSvg(name);
  node.setAttribute('aria-label', label);
  node.setAttribute('aria-description', FM('hint.button', label));
  return node;
}
