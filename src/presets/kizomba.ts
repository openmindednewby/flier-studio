import { kizombaWorkshopDocs, type FlierDoc, type ScheduleRow } from '@dloizides/poster-render';

export const KIZOMBA_ASSET_URLS: Readonly<Record<string, string | undefined>> = {
  dancers: '/img/dancers.png',
  logo: '/img/logo.png',
};

export const LEVEL_NAMES: Readonly<Record<string, string | undefined>> = { 'Level 1': 'Beginners', 'Level 2': 'Intermediate' };
export const PRESET_FOOTER = 'Classes by Jimmy & Ismini';

export function cloneDocs(docs: readonly FlierDoc[]): FlierDoc[] {
  return JSON.parse(JSON.stringify(docs)) as FlierDoc[];
}

function renameLevels(rows: ScheduleRow[] | undefined): void {
  for (const row of rows ?? []) row.label = LEVEL_NAMES[row.label] ?? row.label;
}

/** The 2026-10-27 Kizomba workshops: three event fliers and one list flier, Beginners and Intermediate levels. */
export function kizombaPreset(): FlierDoc[] {
  const docs = cloneDocs(kizombaWorkshopDocs);
  for (const doc of docs) {
    doc.blocks.footer = PRESET_FOOTER;
    renameLevels(doc.blocks.schedule);
    for (const item of doc.items ?? []) renameLevels(item.schedule);
  }
  return docs;
}
