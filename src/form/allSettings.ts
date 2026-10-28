import { LAYOUT_CATALOGUE, type FlierDoc } from '@dloizides/poster-render';
import { layoutsFor } from './layoutOptions';
import { DocPicker, schemaOptions } from './schemaOptions';
import { SettingId } from './SettingId';

export const EACH_OWN = '';
const LEVELS_SHOWN = 3;

export interface SettingSpec {
  readonly id: SettingId;
  readonly labelKey: string;
  readonly whatKey: string;
  options(docs: readonly FlierDoc[]): string[];
}

const fitsLayout = (doc: FlierDoc, id: string): boolean => layoutsFor(doc.format).some((e) => e.id === id);

/** Every All fliers setting; a new one is one row here and shows up without a re-layout. */
export const SETTINGS: readonly SettingSpec[] = [
  { id: SettingId.Layout, labelKey: 'form.layout', whatKey: 'allFliers.layoutWhat', options: (docs) => LAYOUT_CATALOGUE.map((e) => e.id).filter((id) => docs.some((d) => fitsLayout(d, id))) },
  { id: SettingId.Palette, labelKey: 'form.palette', whatKey: 'allFliers.paletteWhat', options: () => schemaOptions(DocPicker.Palette) },
  { id: SettingId.Fonts, labelKey: 'form.fonts', whatKey: 'allFliers.fontsWhat', options: () => schemaOptions(DocPicker.Fonts) },
];

/** The docs with one setting put on every flier it fits; Each flier's own leaves them as they are. */
export function applySetting(docs: readonly FlierDoc[], id: SettingId, value: string): FlierDoc[] {
  return docs.map((doc) => {
    const fits = id !== SettingId.Layout || fitsLayout(doc, value);
    return value !== EACH_OWN && fits ? ({ ...doc, [id]: value } as FlierDoc) : doc;
  });
}

/** The value every flier shares, or Each flier's own when they differ. */
export function sharedValue(docs: readonly FlierDoc[], id: SettingId): string {
  const values = [...new Set(docs.map((d) => String(d[id])))];
  return values.length === 1 ? values[0] : EACH_OWN;
}

export interface SharedSummary {
  readonly footer: string;
  readonly levels: string;
  readonly price: string;
}

/** What the shared text fields read on a flier: footer, the first level names and the class price. */
export function sharedSummary(doc: FlierDoc): SharedSummary {
  const { footer = '', schedule = [], prices = [] } = doc.blocks;
  const price = prices.length === 0 ? '' : [prices[0].amount, prices[0].label].filter((s) => s !== '').join(' ');
  return { footer, levels: schedule.map((r) => r.label).slice(0, LEVELS_SHOWN).join(', '), price };
}
