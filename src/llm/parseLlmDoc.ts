import { validateFlierDoc, type FlierDocResult } from '@dloizides/poster-render';
import { parseJsonObject } from '@dloizides/text-generation';
import { FM } from '../i18n/fm';

/** Pulls the first JSON object out of a model reply (prose and code fences allowed) and validates it. */
export function parseLlmDoc(reply: string): FlierDocResult {
  if (!/\{[\s\S]*\}/.test(reply)) return { ok: false, errors: [FM('errors.replyNoJson')] };
  try {
    return validateFlierDoc(parseJsonObject(reply));
  } catch {
    return { ok: false, errors: [FM('errors.replyBadJson')] };
  }
}
