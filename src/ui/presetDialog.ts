import { createGamepadPoller, createMenuNav, MENU_DEFAULT_ATTR, type PadLike } from '@dloizides/game-input';
import { FM } from '../i18n/fm';
import { plural } from '../i18n/plural';
import { PresetChoice } from '../presets/PresetChoice';
import { button, el, textButton } from './dom';

const TITLE_ID = 'preset-title';

const pads = (): ReadonlyArray<PadLike | null> => (typeof navigator.getGamepads === 'function' ? Array.from(navigator.getGamepads()) : []);

function startNav(): () => void {
  const nav = createMenuNav({ baseRoot: () => null });
  const poller = createGamepadPoller({
    getPads: pads,
    requestFrame: (cb) => requestAnimationFrame(cb),
    cancelFrame: (id) => cancelAnimationFrame(id),
    onAction: (action) => nav.pad(action),
    onScroll: (axisY, now) => nav.stick(axisY, now),
  });
  poller.start();
  return () => { poller.stop(); nav.dispose(); };
}

/** The dialog body, naming the fliers on screen in the singular or plural. */
export function presetBodyText(counts: [mine: number, samples: number]): string {
  return FM('config.presetBody', plural('config.presetFliers', counts[0]), String(counts[1]), plural('config.presetSwaps', counts[0]));
}

/** Asks whether the sample fliers replace or join the current ones; Add has focus and Cancel or Escape changes nothing. */
export function openPresetDialog(counts: [mine: number, samples: number], choose: (choice: PresetChoice) => void): HTMLDialogElement {
  const dialog = el('dialog', { class: 'import-dialog', role: 'dialog', 'aria-modal': 'true', 'data-testid': 'preset-dialog', 'aria-labelledby': TITLE_ID });
  let picked = PresetChoice.Cancel;
  const pick = (choice: PresetChoice) => (): void => { picked = choice; dialog.close(); };
  const add = button('config.presetAdd', 'preset-add', pick(PresetChoice.Add), 'primary');
  add.setAttribute(MENU_DEFAULT_ATTR, '');
  dialog.append(
    el('h2', { id: TITLE_ID, 'data-testid': 'preset-title', text: FM('config.presetTitle') }),
    el('p', { class: 'muted', 'data-testid': 'preset-body', text: presetBodyText(counts) }),
    el('div', { class: 'row preset-actions' }, [add, textButton(plural('config.presetReplaceAll', counts[0]), 'preset-replace', pick(PresetChoice.Replace), 'destructive-text'), button('config.presetCancel', 'preset-cancel', pick(PresetChoice.Cancel))]),
  );
  const stopNav = startNav();
  dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !e.isTrusted) dialog.close(); });
  dialog.addEventListener('close', () => { stopNav(); dialog.remove(); choose(picked); });
  document.body.append(dialog);
  dialog.showModal();
  add.focus();
  return dialog;
}
