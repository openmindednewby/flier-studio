import type { ProgressEvent } from '@dloizides/llm-run';
import { FM } from '../i18n/fm';
import type { GenerateSource } from './GenerateSource';

const PERCENT = 100;

export interface MeasureProgress {
  download(e: ProgressEvent): void;
  prompt(k: number, total: number, ms: number, source: GenerateSource): void;
}

function percentOf(e: ProgressEvent): number {
  return e.totalBytes > 0 ? Math.floor((e.loadedBytes / e.totalBytes) * PERCENT) : 0;
}

/** Live lines for the ?measure=llm run: the latest model download line, then one line per finished prompt. */
export function createMeasureProgress(render: (text: string) => void): MeasureProgress {
  let download = '';
  const prompts: string[] = [];
  const show = (): void => render([download, ...prompts].filter((line) => line !== '').join('\n'));
  return {
    download(e) {
      download = FM('measure.download', e.file, String(percentOf(e)));
      show();
    },
    prompt(k, total, ms, source) {
      prompts.push(FM('measure.prompt', String(k), String(total), String(ms), source));
      show();
    },
  };
}
