import { LAYOUT_CATALOGUE, type FlierDoc, type LayoutId } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import { kizombaPreset } from '../presets/kizomba';
import { toThemed, type ThemedFlier } from '../theme/flierTheme';

export interface BuiltInTemplate {
  readonly key: string;
  readonly name: string;
  readonly flier: ThemedFlier;
}

/** The 4 Kizomba preset fliers, one built-in template each. */
export function builtInTemplates(): BuiltInTemplate[] {
  return kizombaPreset().map((doc, i) => ({ key: `kizomba-${String(i + 1)}`, name: FM('templates.builtInName', String(i + 1), FM(`layouts.${doc.layout}`)), flier: toThemed(doc) }));
}

/** The name a saved template gets: the typed name, else the flier title, else "Untitled template". */
export function defaultTemplateName(flier: ThemedFlier, typed = ''): string {
  const given = typed.trim();
  if (given !== '') return given;
  const title = flier.content.blocks.title.trim();
  return title === '' ? FM('templates.untitled') : title;
}

/** A blank flier in the chosen layout, in the first format that layout supports, Kizomba look kept. */
export function blankFlier(layout: LayoutId): ThemedFlier {
  const entry = LAYOUT_CATALOGUE.find((e) => e.id === layout) ?? LAYOUT_CATALOGUE[0];
  const [base] = kizombaPreset();
  const doc: FlierDoc = { version: 1, format: entry.formats[0], layout: entry.id, palette: base.palette, fonts: base.fonts, background: base.background, blocks: { title: FM('templates.blankTitle') } };
  return toThemed(doc);
}
