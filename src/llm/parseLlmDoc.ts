import { validateFlierDoc, type FlierDocResult } from '@dloizides/poster-render';
import { FM } from '../i18n/fm';

/** Pulls the first JSON object out of a model reply (prose and code fences allowed) and validates it. */
export function parseLlmDoc(reply: string): FlierDocResult {
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start < 0 || end <= start) return { ok: false, errors: [FM('errors.replyNoJson')] };
  try {
    return validateFlierDoc(JSON.parse(reply.slice(start, end + 1)));
  } catch {
    return { ok: false, errors: [FM('errors.replyBadJson')] };
  }
}
