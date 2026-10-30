import { roleOf } from '@dloizides/poster-render';
import { FIELD_LINES } from './lineEdit';
import { FormGroup } from './FormGroup';

export interface FormGroupSpec {
  group: FormGroup;
  rows: readonly (readonly string[])[];
}

const TEXT_FIELDS = ['titleBottom', 'script', 'includesHeading', 'footer', 'venue', 'schedule', 'prices', 'includesItems', 'items'];

/** The row above the groups: Title first, so the initial focus lands in the first viewport. */
export const LEAD_ROW: readonly string[] = ['title'];

/** The flier form in three groups; each row lists the controls that sit side by side. */
export const FORM_GROUPS: readonly FormGroupSpec[] = [
  { group: FormGroup.Layout, rows: [['layout'], ['format', 'palette'], ['fonts', 'background']] },
  { group: FormGroup.Pictures, rows: [['picture', 'logo'], ['cutout'], ['anchor'], ['scale']] },
  { group: FormGroup.Text, rows: [...TEXT_FIELDS.map((key) => [key]), ['bullets']] },
];

export function groupedControls(): string[] {
  return [...LEAD_ROW, ...FORM_GROUPS.flatMap((g) => g.rows.flat())];
}

/** AC-49: the text fields in the flier's top-to-bottom order; fields it does not draw follow in form order. */
export function textFieldsInFlierOrder(drawn: readonly string[]): string[] {
  const rank = (field: string): number => {
    const hits = (FIELD_LINES[field] ?? []).map((k) => drawn.indexOf(roleOf(k))).filter((i) => i >= 0);
    return hits.length === 0 ? drawn.length : Math.min(...hits);
  };
  return [...TEXT_FIELDS].sort((a, b) => rank(a) - rank(b));
}
