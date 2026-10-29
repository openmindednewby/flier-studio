import { describe, expect, it, vi } from 'vitest';
import { GenerateSource } from './GenerateSource';
import { measurePrompts } from './measure';
import { createMeasureProgress } from './measureProgress';

describe('createMeasureProgress', () => {
  it('with a download event of 50 of 200 bytes, renders the file and 25%', () => {
    const render = vi.fn();
    const progress = createMeasureProgress(render);

    progress.download({ file: 'model.gguf', loadedBytes: 50, totalBytes: 200 });

    expect(render).toHaveBeenLastCalledWith('Model download: model.gguf 25%');
  });

  it('with a zero total, renders 0% instead of NaN', () => {
    const render = vi.fn();
    const progress = createMeasureProgress(render);

    progress.download({ file: 'model.gguf', loadedBytes: 10, totalBytes: 0 });

    expect(render).toHaveBeenLastCalledWith('Model download: model.gguf 0%');
  });

  it('after a download and two prompts, keeps the latest download line and one line per prompt', () => {
    const render = vi.fn();
    const progress = createMeasureProgress(render);
    progress.download({ file: 'model.gguf', loadedBytes: 100, totalBytes: 200 });
    progress.download({ file: 'model.gguf', loadedBytes: 200, totalBytes: 200 });
    progress.prompt(1, 20, 900, GenerateSource.Model);

    progress.prompt(2, 20, 1200, GenerateSource.Fallback);

    expect(render).toHaveBeenLastCalledWith('Model download: model.gguf 100%\nPrompt 1/20: 900 ms, model\nPrompt 2/20: 1200 ms, fallback');
  });
});

describe('measurePrompts', () => {
  it('with an onDone callback, reports each prompt by its 1-based number as it finishes', async () => {
    const onDone = vi.fn();

    await measurePrompts(['a', 'b'], async () => null, onDone);

    expect(onDone.mock.calls.map(([k]) => k)).toEqual([1, 2]);
  });
});
