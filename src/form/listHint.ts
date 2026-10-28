import { LayoutId, type FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';

/** The hint for a list flier with no rows yet, or null when the doc needs none. */
export function listHint(doc: FlierDoc): string | null {
  const empty = (doc.items?.length ?? 0) === 0;
  return doc.layout === LayoutId.List && empty ? FM('form.listEmpty', FM('form.itemsShort')) : null;
}
