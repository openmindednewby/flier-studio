import type { FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import type { ConfigStore } from '../store/configStore';
import { templateName } from './shareCodec';

/** Adds each shared flier as a new named config; existing configs and the working doc are not touched. */
export function importShared(store: ConfigStore, docs: readonly FlierDoc[], themes?: readonly (string | undefined)[]): string[] {
  return docs.map((doc, i) => {
    const themeId = themes?.[i];
    const name = templateName(doc);
    return store.addNew(name === '' ? FM('share.untitled') : name, [doc], themeId === undefined ? undefined : [themeId]);
  });
}
