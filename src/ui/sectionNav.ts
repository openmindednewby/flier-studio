import { FM } from '../i18n/fm';
import { localFoldStore, type FoldStore } from './collapsible';
import { el } from './dom';
import { PanelKey } from './PanelKey';
import { railIcon } from './railIcons';

const RAIL_KEY = 'flier-studio:rail';
const COLLAPSED = 'collapsed';
const ORDER: readonly PanelKey[] = [PanelKey.All, PanelKey.Form, PanelKey.Drafts, PanelKey.Templates, PanelKey.Ai, PanelKey.Previews, PanelKey.Configs];

export interface Rail {
  readonly nav: HTMLElement;
  show(key: PanelKey, reveal?: boolean): void;
}

function railToggle(nav: HTMLElement, store: FoldStore): HTMLButtonElement {
  const word = el('span', { class: 'rail-label' });
  const toggle = el('button', { type: 'button', class: 'rail-toggle', 'data-testid': 'rail-toggle' }, [railIcon('fold'), word]);
  const set = (collapsed: boolean): void => {
    const text = FM(collapsed ? 'nav.expand' : 'nav.collapse');
    nav.dataset.collapsed = String(collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', text);
    toggle.setAttribute('aria-description', FM('hint.button', text));
    toggle.title = text;
    word.textContent = text;
  };
  set(store.read(RAIL_KEY) === COLLAPSED);
  toggle.addEventListener('click', () => {
    const collapsed = nav.dataset.collapsed !== 'true';
    set(collapsed);
    store.write(RAIL_KEY, collapsed ? COLLAPSED : 'open');
  });
  return toggle;
}

/** The sidebar: one icon + caption item per section; a panel item shows only that panel, Fliers scrolls to them. */
export function sectionRail(panels: Partial<Record<PanelKey, HTMLElement>>, fliers: HTMLElement, store: FoldStore = localFoldStore): Rail {
  const links = ORDER.map((key) => {
    const label = FM(`nav.${key}`);
    return el('a', { href: `#${(panels[key] ?? fliers).id}`, title: label, 'aria-label': label, 'data-testid': `nav-${key}`, 'aria-description': FM('hint.jump', label) }, [railIcon(key), el('span', { class: 'rail-label', text: label })]);
  });
  const show = (key: PanelKey, reveal = false): void => {
    links.forEach((a, i) => (ORDER[i] === key ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    const panel = panels[key];
    if (panel === undefined) {
      fliers.scrollIntoView({ block: 'start' });
      return;
    }
    for (const [k, p] of Object.entries(panels)) p.hidden = k !== key;
    if (!reveal) return;
    panel.scrollIntoView({ block: 'nearest' });
    panel.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  };
  links.forEach((a, i) => a.addEventListener('click', (e) => { e.preventDefault(); show(ORDER[i], true); }));
  const nav = el('nav', { class: 'rail', 'aria-label': FM('nav.label'), 'data-testid': 'section-nav' }, [el('ul', {}, links.map((a) => el('li', {}, [a])))]);
  nav.append(railToggle(nav, store));
  return { nav, show };
}

/** The one-line entry above the fliers that names the on-device AI and opens the Generate panel. */
export function aiEntry(open: () => void): HTMLElement {
  const entry = el('a', { class: 'ai-entry', href: '#generate', 'data-testid': 'ai-entry', 'aria-description': FM('hint.jump', FM('nav.ai')) }, [FM('prompt.entry')]);
  entry.addEventListener('click', (e) => { e.preventDefault(); open(); });
  return entry;
}
