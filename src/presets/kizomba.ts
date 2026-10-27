import { kizombaWorkshopDocs, type FlierDoc } from '@dloizides/poster-render';

export const KIZOMBA_ASSET_URLS: Readonly<Record<string, string | undefined>> = {
  dancers: '/img/dancers.png',
  logo: '/img/logo.png',
};

export function cloneDocs(docs: readonly FlierDoc[]): FlierDoc[] {
  return JSON.parse(JSON.stringify(docs)) as FlierDoc[];
}

/** The 2026-10-27 Kizomba workshops: three event fliers and one list flier. */
export function kizombaPreset(): FlierDoc[] {
  return cloneDocs(kizombaWorkshopDocs);
}
