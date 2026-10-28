import { FM } from '../i18n/fm';
import { GenerateSource } from './GenerateSource';
import type { GenerateOutcome } from './generate';

export function outcomeMessage(outcome: GenerateOutcome): string {
  if (outcome.source === GenerateSource.Model) return FM('prompt.model');
  if (outcome.source === GenerateSource.NoWebGpu) return FM('prompt.noWebGpu');
  if (outcome.source === GenerateSource.ModelFailed) return FM('prompt.modelFailed');
  return FM('prompt.fallback', outcome.errors.join('; '));
}
