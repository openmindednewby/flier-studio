import type { ThemedFlier } from '../theme/flierTheme';
import { templatesPanel } from '../ui/templatesPanel';
import { builtInTemplates } from './builtInTemplates';
import { templateActions } from './templateActions';
import { TemplateStore } from './templateStore';

export interface TemplatesApp {
  add(flier: ThemedFlier): number;
  current(): { readonly flier: ThemedFlier; readonly thumb: string };
  status(message: string): void;
}

/** The Templates card wired to its on-device store; it lists My templates as soon as the store opens. */
export function templatesSection(app: TemplatesApp, store: TemplateStore = new TemplateStore()): HTMLElement {
  const refresh = (): void => void store.list().then((mine) => panel.show(mine), () => undefined);
  const panel = templatesPanel(builtInTemplates(), templateActions(store, { ...app, refresh }));
  panel.show([]);
  refresh();
  return panel.card;
}
