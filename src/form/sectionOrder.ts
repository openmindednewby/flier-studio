import { sectionOrderOf, type BodySection, type FlierDoc } from '@dloizides/poster-render';

/** The doc with one body section moved by delta places in its drawn order; the same doc when it cannot move. */
export function moveSection(doc: FlierDoc, section: BodySection, delta: number): FlierDoc {
  const order = sectionOrderOf(doc);
  const from = order.indexOf(section);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= order.length) return doc;
  const next = order.filter((s) => s !== section);
  next.splice(to, 0, section);
  return { ...doc, sectionOrder: next };
}

/** The doc drawn in its layout's own section order again. */
export function resetSections(doc: FlierDoc): FlierDoc {
  const next = { ...doc };
  delete next.sectionOrder;
  return next;
}
