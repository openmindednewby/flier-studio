import type { FlierDoc } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';
import type { ConfigStore } from '../store/configStore';
import { button, downloadBlob, el, enterClicks, fileButton, labelled } from './dom';
import { shareRow } from './shareControls';

export interface ConfigActions {
  current(): FlierDoc[];
  currentThemes(): string[];
  apply(docs: FlierDoc[], themes?: readonly string[] | null): void;
  preset(): void;
  status(message: string): void;
}

function exportConfig(store: ConfigStore, name: string): void {
  const json = store.exportJson(name);
  if (json !== null) downloadBlob(new Blob([json], { type: 'application/json' }), `${name}.flier.json`);
}

/** Save, load, rename, delete, import and export named configs, plus the built-in Kizomba preset. */
export function renderConfigPanel(container: HTMLElement, store: ConfigStore, actions: ConfigActions): void {
  const name = el('input', { type: 'text', 'data-testid': 'config-name' });
  const saved = el('select', { 'data-testid': 'config-pick' });
  const refresh = (pick?: string): void => {
    saved.replaceChildren(...store.list().map((e) => el('option', { value: e.name, text: e.name })));
    if (pick !== undefined) saved.value = pick;
  };
  const withName = (fn: (value: string) => void) => (): void => {
    const value = name.value.trim();
    if (value === '') actions.status(FM('config.needName'));
    else fn(value);
  };
  const load = (): void => {
    const docs = store.load(saved.value);
    if (docs) { actions.apply(docs, store.themesOf(saved.value)); name.value = saved.value; actions.status(FM('config.loaded', saved.value)); }
  };
  const rename = withName((value) => {
    const ok = store.rename(saved.value, value);
    actions.status(ok ? FM('config.renamed', value) : FM('config.renameFailed'));
    refresh(ok ? value : saved.value);
  });
  const remove = (): void => {
    const gone = saved.value;
    if (gone === '') return;
    store.remove(gone);
    refresh();
    actions.status(FM('config.deleted', gone));
  };
  const importFile = async (file: File): Promise<void> => {
    const result = store.importJson(await file.text());
    if (result.ok) { refresh(result.name); actions.status(FM('config.imported', result.name)); }
    else actions.status(FM('config.importFailed', result.error));
  };
  container.replaceChildren(
    el('h2', { text: FM('config.heading') }),
    el('div', { class: 'row' }, [labelled('config.name', name), enterClicks(name, button('config.save', 'config-save', withName((value) => {
      store.save(value, actions.current(), actions.currentThemes()); refresh(value); actions.status(FM('config.saved', value));
    }), 'primary'))]),
    el('div', { class: 'row' }, [labelled('config.pick', saved)]),
    el('div', { class: 'row' }, [
      button('config.load', 'config-load', load), button('config.rename', 'config-rename', rename),
      button('config.delete', 'config-delete', remove), button('config.export', 'config-export', () => exportConfig(store, saved.value)),
      fileButton('config.import', 'config-import', 'application/json,.json', (f) => void importFile(f)),
    ]),
    shareRow(actions.current, actions.status, actions.currentThemes),
    button('config.preset', 'config-preset', () => actions.preset()),
  );
  refresh();
}
