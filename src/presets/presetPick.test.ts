import { describe, expect, it } from 'vitest';
import { PresetChoice } from './PresetChoice';
import { asksFirst, firstShown, presetFliers, presetStatusKey, savesDraftFirst } from './presetPick';

describe('asksFirst', () => {
  it('with fliers on screen, asks', () => {
    const count = 3;

    const asks = asksFirst(count);

    expect(asks).toBe(true);
  });

  it('with no fliers, loads without asking', () => {
    const count = 0;

    const asks = asksFirst(count);

    expect(asks).toBe(false);
  });
});

describe('savesDraftFirst', () => {
  it('with Replace over existing fliers, saves a draft first', () => {
    const choice = PresetChoice.Replace;

    const saves = savesDraftFirst(choice, 2);

    expect(saves).toBe(true);
  });

  it('with Replace over no fliers, saves nothing', () => {
    const choice = PresetChoice.Replace;

    const saves = savesDraftFirst(choice, 0);

    expect(saves).toBe(false);
  });

  it('with Add, saves nothing because nothing is lost', () => {
    const choice = PresetChoice.Add;

    const saves = savesDraftFirst(choice, 2);

    expect(saves).toBe(false);
  });
});

describe('presetFliers', () => {
  it('with Add, appends the preset after the existing fliers', () => {
    const current = ['mine-1', 'mine-2'];

    const next = presetFliers(current, ['sample-1', 'sample-2'], PresetChoice.Add);

    expect(next).toEqual(['mine-1', 'mine-2', 'sample-1', 'sample-2']);
  });

  it('with Replace, returns only the preset', () => {
    const current = ['mine-1', 'mine-2'];

    const next = presetFliers(current, ['sample-1'], PresetChoice.Replace);

    expect(next).toEqual(['sample-1']);
  });

  it('with Cancel, returns the current fliers unchanged', () => {
    const current = ['mine-1', 'mine-2'];

    const next = presetFliers(current, ['sample-1'], PresetChoice.Cancel);

    expect(next).toEqual(['mine-1', 'mine-2']);
  });

  it('with Add, leaves the input array untouched', () => {
    const current = ['mine-1'];

    presetFliers(current, ['sample-1'], PresetChoice.Add);

    expect(current).toEqual(['mine-1']);
  });
});

describe('firstShown', () => {
  it('with Add after 3 fliers, selects the first added flier at index 3', () => {
    const choice = PresetChoice.Add;

    const index = firstShown(choice, 3);

    expect(index).toBe(3);
  });

  it('with Replace, selects the first flier', () => {
    const choice = PresetChoice.Replace;

    const index = firstShown(choice, 3);

    expect(index).toBe(0);
  });
});

describe('presetStatusKey', () => {
  it('with Cancel, returns null because nothing changed', () => {
    const choice = PresetChoice.Cancel;

    const key = presetStatusKey(choice, 2);

    expect(key).toBeNull();
  });

  it('with Add, returns the added message', () => {
    const choice = PresetChoice.Add;

    const key = presetStatusKey(choice, 2);

    expect(key).toBe('config.presetAdded');
  });

  it('with Replace over existing fliers, returns the replaced message', () => {
    const choice = PresetChoice.Replace;

    const key = presetStatusKey(choice, 2);

    expect(key).toBe('config.presetReplaced');
  });

  it('with Replace over no fliers, returns the plain loaded message', () => {
    const choice = PresetChoice.Replace;

    const key = presetStatusKey(choice, 0);

    expect(key).toBe('config.presetLoaded');
  });
});
