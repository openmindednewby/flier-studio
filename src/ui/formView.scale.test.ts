import { describe, expect, it } from 'vitest';
import { kizombaPreset } from '../presets/kizomba';
import { renderForm, type FormActions } from './formView';

const noActions = new Proxy({}, { get: () => () => undefined }) as FormActions;

describe('renderForm', () => {
  it('with a picture flier, names the picture-size slider by its "Picture size" label', () => {
    const container = document.body.appendChild(document.createElement('div'));
    const [doc] = kizombaPreset();

    renderForm(container, doc, [1, 4], noActions);

    const slider = container.querySelector('[data-testid="pick-scale"]');
    const nameId = slider?.getAttribute('aria-labelledby') ?? '';
    expect(document.getElementById(nameId)?.textContent).toBe('Picture size');
  });
});
