import type { FlierDoc, LineKey, LineStyle } from '@dloizides/poster-render';
import { FIELD_LINES } from './lineEdit';
import { TextRole } from './TextRole';

export type RoleStyles = Partial<Record<TextRole, LineStyle>>;

const of = (field: string, suffix = ''): LineKey[] => (FIELD_LINES[field] ?? []).filter((k) => k.endsWith(suffix));

export const TEXT_ROLES: readonly TextRole[] = [
  TextRole.Title, TextRole.TitleBottom, TextRole.Script, TextRole.Venue, TextRole.Levels, TextRole.Times,
  TextRole.Prices, TextRole.PriceLabels, TextRole.IncludesHeading, TextRole.IncludesItems, TextRole.Footer,
];

/** The flier lines each text role draws. */
export const ROLE_LINES: Readonly<Record<TextRole, readonly LineKey[]>> = {
  [TextRole.Title]: of('title'),
  [TextRole.TitleBottom]: of('titleBottom'),
  [TextRole.Script]: [...of('script'), ...of('items', '.date')],
  [TextRole.Venue]: of('venue'),
  [TextRole.Levels]: of('schedule', '.label'),
  [TextRole.Times]: of('schedule', '.time'),
  [TextRole.Prices]: [...of('prices', '.amount'), ...of('items', '.price')],
  [TextRole.PriceLabels]: of('prices', '.label'),
  [TextRole.IncludesHeading]: of('includesHeading'),
  [TextRole.IncludesItems]: of('includesItems'),
  [TextRole.Footer]: of('footer'),
};

const isSet = (style: LineStyle | undefined): style is LineStyle => style !== undefined && Object.keys(style).length > 0;

/** The doc with every role style under its lines; a value the flier's own Style sets wins. */
export function withRoleStyles(doc: FlierDoc, roles: RoleStyles): FlierDoc {
  const merged: Record<LineKey, LineStyle | undefined> = { ...doc.lineStyles };
  for (const role of TEXT_ROLES) {
    const style = roles[role];
    if (!isSet(style)) continue;
    for (const key of ROLE_LINES[role]) merged[key] = { ...style, ...doc.lineStyles?.[key] };
  }
  return Object.keys(merged).length === 0 ? doc : { ...doc, lineStyles: merged };
}
