import { roleOf, type FlierDoc, type LineKey, type LineStyle } from '@dloizides/poster-render';
import { FIELD_LINES } from './lineEdit';
import { TextRole } from './TextRole';

export type RoleStyles = Partial<Record<TextRole, LineStyle>>;

const of = (field: string, suffix = ''): LineKey[] => (FIELD_LINES[field] ?? []).filter((k) => k.endsWith(suffix));

export const TEXT_ROLES: readonly TextRole[] = [
  TextRole.Title, TextRole.TitleBottom, TextRole.Script, TextRole.Venue, TextRole.Levels, TextRole.Times,
  TextRole.Prices, TextRole.PriceLabels, TextRole.IncludesHeading, TextRole.IncludesItems, TextRole.Footer,
  TextRole.ListDates, TextRole.ListPasses, TextRole.ListTimes,
];

/** The flier lines each text role draws. */
export const ROLE_LINES: Readonly<Record<TextRole, readonly LineKey[]>> = {
  [TextRole.Title]: of('title'),
  [TextRole.TitleBottom]: of('titleBottom'),
  [TextRole.Script]: of('script'),
  [TextRole.Venue]: of('venue'),
  [TextRole.Levels]: of('schedule', '.label'),
  [TextRole.Times]: of('schedule', '.time'),
  [TextRole.Prices]: of('prices', '.amount'),
  [TextRole.PriceLabels]: of('prices', '.label'),
  [TextRole.IncludesHeading]: of('includesHeading'),
  [TextRole.IncludesItems]: of('includesItems'),
  [TextRole.Footer]: of('footer'),
  [TextRole.ListDates]: of('items', '.date'),
  [TextRole.ListPasses]: of('items', '.price'),
  [TextRole.ListTimes]: (FIELD_LINES.items ?? []).filter((k) => k.includes('.schedule.')),
};

/** The text roles in the order the flier draws them, top to bottom; roles it does not draw follow in their default order. */
export function rolesInFlierOrder(drawn: readonly string[]): TextRole[] {
  const rank = (role: TextRole): number => {
    const hits = ROLE_LINES[role].map((k) => drawn.indexOf(roleOf(k))).filter((i) => i >= 0);
    return hits.length === 0 ? drawn.length : Math.min(...hits);
  };
  return [...TEXT_ROLES].sort((a, b) => rank(a) - rank(b));
}

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
