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
  { group: FormGroup.Text, rows: TEXT_FIELDS.map((key) => [key]) },
];

export function groupedControls(): string[] {
  return [...LEAD_ROW, ...FORM_GROUPS.flatMap((g) => g.rows.flat())];
}
