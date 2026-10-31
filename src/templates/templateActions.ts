import type { LayoutId } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import type { ThemedFlier } from '../theme/flierTheme';
import { blankFlier, defaultTemplateName } from './builtInTemplates';
import type { Template, TemplateStore } from './templateStore';

export interface TemplatesHost {
  add(flier: ThemedFlier): number;
  current(): { readonly flier: ThemedFlier; readonly thumb: string };
  refresh(): void;
  status(message: string): void;
}

export interface TemplatesActions {
  use(name: string, flier: ThemedFlier): void;
  save(typedName: string): void;
  create(layout: LayoutId): void;
  rename(template: Template, name: string): void;
  remove(template: Template): void;
}

/** Wires the Templates panel to the store: Use adds one flier, Save and New store a template, Rename and Delete edit one. */
export function templateActions(store: TemplateStore, host: TemplatesHost, now: () => number = Date.now): TemplatesActions {
  const fail = (e: unknown): void => host.status(FM('templates.failed', String(e)));
  const keep = (name: string, flier: ThemedFlier, thumb: string, message: () => string): void => {
    void store.add({ at: now(), name, flier, thumb }).then(() => { host.refresh(); host.status(message()); }, fail);
  };
  return {
    use: (name, flier) => host.status(FM('templates.added', name, String(host.add(flier)))),
    save: (typedName) => {
      const { flier, thumb } = host.current();
      const name = defaultTemplateName(flier, typedName);
      keep(name, flier, thumb, () => FM('templates.saved', name));
    },
    create: (layout) => {
      const flier = blankFlier(layout);
      const name = defaultTemplateName(flier);
      keep(name, flier, '', () => FM('templates.created', name, String(host.add(flier))));
    },
    rename: (template, name) => void store.rename(template.id, name).then(host.refresh, fail),
    remove: (template) => void store.remove(template.id).then(host.refresh, fail),
  };
}
