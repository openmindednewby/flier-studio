import type { FlierDoc } from '@dloizides/poster-render';

/** The doc with bullet points on (the default, field absent) or off. */
export function withBullets(doc: FlierDoc, on: boolean): FlierDoc {
  const next = { ...doc };
  if (on) delete next.bullets;
  else next.bullets = false;
  return next;
}
