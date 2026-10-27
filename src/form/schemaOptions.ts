import { flierDocSchema } from '@dloizides/poster-render';

export const enum DocPicker {
  Format = 'format',
  Layout = 'layout',
  Palette = 'palette',
  Fonts = 'fonts',
  Background = 'background',
}

/** The allowed values of a top-level doc field, read from the published FlierDoc schema. */
export function schemaOptions(field: DocPicker): string[] {
  return (flierDocSchema.properties?.[field]?.enum ?? []).map(String);
}

export function anchorOptions(): string[] {
  return (flierDocSchema.properties?.picture?.properties?.anchor?.enum ?? []).map(String);
}
