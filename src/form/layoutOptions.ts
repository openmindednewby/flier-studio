import { LAYOUT_CATALOGUE, defaultLayoutFor, type FlierDoc, type FormatId, type LayoutCatalogueEntry } from '@dloizides/poster-render';

/** The catalogue layouts that fit a format, in catalogue order. */
export function layoutsFor(format: FormatId): LayoutCatalogueEntry[] {
  return LAYOUT_CATALOGUE.filter((entry) => entry.formats.includes(format));
}

/** The doc in a new format; keeps its layout when it fits, otherwise the format's default layout. */
export function withFormat(doc: FlierDoc, format: FormatId): FlierDoc {
  const fits = layoutsFor(format).some((entry) => entry.id === doc.layout);
  return { ...doc, format, layout: fits ? doc.layout : defaultLayoutFor(format) };
}
