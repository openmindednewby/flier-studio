import { validateFlierDoc, type FlierDocResult } from '@dloizides/poster-render';

/** Pulls the first JSON object out of a model reply (prose and code fences allowed) and validates it. */
export function parseLlmDoc(reply: string): FlierDocResult {
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start < 0 || end <= start) return { ok: false, errors: ['reply: no JSON object'] };
  try {
    return validateFlierDoc(JSON.parse(reply.slice(start, end + 1)));
  } catch {
    return { ok: false, errors: ['reply: the JSON does not parse'] };
  }
}
