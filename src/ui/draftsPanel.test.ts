import { describe, expect, it, vi } from 'vitest';
import type { Draft } from '../drafts/draftStore';
import { draftsPanel } from './draftsPanel';

const draft = (starred: boolean): Draft => ({ id: 1, at: 1_700_000_000_000, starred, fliers: [], thumb: '' });

describe('draftsPanel', () => {
  it.each([true, false])('with starred %s, the Star button name starts with its visible text', (starred) => {
    const panel = draftsPanel({ restore: vi.fn(), star: vi.fn() });

    panel.show([draft(starred)]);

    const star = panel.card.querySelector('[data-testid="draft-star-1"]');
    expect(star?.getAttribute('aria-label')?.startsWith(star.textContent ?? '?')).toBe(true);
  });
});
