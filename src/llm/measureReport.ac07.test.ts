import { kizombaWorkshopDocs } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { GenerateSource } from './GenerateSource';
import { measureReport, traceOf } from './measureReport';

const REPLY_CAP = 300;

describe('traceOf', () => {
  it('with a Fallback outcome, keeps its source, errors and the first 300 chars of the raw reply', () => {
    const reply = 'x'.repeat(REPLY_CAP + 100);
    const outcome = { source: GenerateSource.Fallback, doc: kizombaWorkshopDocs[0], errors: ['doc: must be an object'], reply };

    const trace = traceOf('Salsa night', outcome);

    expect(trace).toEqual({ prompt: 'Salsa night', source: GenerateSource.Fallback, errors: ['doc: must be an object'], reply: 'x'.repeat(REPLY_CAP) });
  });

  it('with a ModelFailed outcome, keeps the exception text and no reply', () => {
    const outcome = { source: GenerateSource.ModelFailed, doc: kizombaWorkshopDocs[0], errors: ['Error: model too big'] };

    const trace = traceOf('Salsa night', outcome);

    expect(trace).toEqual({ prompt: 'Salsa night', source: GenerateSource.ModelFailed, errors: ['Error: model too big'] });
  });
});

describe('measureReport', () => {
  it('with a run, keeps the valid count and adds webGpu, model load time and one trace per prompt', () => {
    const result = { valid: 1, total: 2, invalid: [{ prompt: 'b', errors: ['doc: must be an object'] }], msPerPrompt: [900, 230] };
    const traces = [{ prompt: 'a', source: GenerateSource.Model, errors: [] }, { prompt: 'b', source: GenerateSource.NoWebGpu, errors: [] }];

    const report = measureReport(result, traces, { at: '2026-10-29T10:00:00.000Z', webGpu: false, loadMs: 4200 });

    expect(report).toEqual({ mode: 'model', at: '2026-10-29T10:00:00.000Z', webGpu: false, loadMs: 4200, ...result, prompts: traces });
  });
});
