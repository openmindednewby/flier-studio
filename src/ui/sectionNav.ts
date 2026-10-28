import { FM } from '../i18n/fm';
import { el } from './dom';

const NUMBER_WIDTH = 2;
const SECTIONS: readonly (readonly [string, string])[] = [
  ['all-fliers', 'all'],
  ['flier-form', 'form'],
  ['drafts-panel', 'drafts'],
  ['generate', 'ai'],
  ['preview-grid', 'previews'],
  ['saved-configs', 'configs'],
];

/** The contents card: one numbered 44 px link per section of the page. */
export function sectionNav(): HTMLElement {
  const links = SECTIONS.map(([target, key], i) => {
    const label = FM(`nav.${key}`);
    const link = el('a', { href: `#${target}`, 'data-testid': `nav-${key}`, 'aria-description': FM('hint.jump', label) }, [el('span', { class: 'n', text: String(i + 1).padStart(NUMBER_WIDTH, '0') }), label]);
    return el('li', {}, [link]);
  });
  return el('nav', { class: 'section-nav card', 'aria-label': FM('nav.label'), 'data-testid': 'section-nav' }, [el('ul', {}, links)]);
}

/** The one-line entry above the fliers that names the on-device AI and jumps to the Generate card. */
export function aiEntry(): HTMLElement {
  return el('a', { class: 'ai-entry', href: '#generate', 'data-testid': 'ai-entry', 'aria-description': FM('hint.jump', FM('nav.ai')) }, [FM('prompt.entry')]);
}
