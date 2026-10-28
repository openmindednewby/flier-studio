import { kizombaWorkshopDocs } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { FM } from '../i18n/fm';
import { GenerateSource } from './GenerateSource';
import { outcomeMessage } from './outcomeMessage';

describe('outcomeMessage', () => {
  it('with a model that failed to load, shows the friendly keyword-match message, never the raw error', () => {
    const outcome = { source: GenerateSource.ModelFailed, doc: kizombaWorkshopDocs[0], errors: ['LlmRunError: E_NETWORK: cannot reach https://huggingface.co'] };

    const message = outcomeMessage(outcome);

    expect(message).toBe(FM('prompt.modelFailed'));
    expect(message).not.toContain('E_NETWORK');
  });
});
