import { describe, expect, it, vi } from 'vitest';
import type { Draft } from '../drafts/draftStore';
import { FM } from '../i18n/fm';
import { draftDay, draftTime, draftsPanel } from './draftsPanel';

const draft = (starred: boolean): Draft => ({ id: 1, at: 1_700_000_000_000, starred, fliers: [], thumb: '' });

describe('draftsPanel', () => {
  it.each([[true, 'drafts.starredAt'], [false, 'drafts.starAt']] as const)('with starred %s, names the Star button by %s and its pressed state', (starred, key) => {
    const panel = draftsPanel({ restore: vi.fn(), star: vi.fn(), rename: vi.fn(), remove: vi.fn(), cleanUp: vi.fn() });
    const saved = draft(starred);

    panel.show([saved]);

    const star = panel.card.querySelector('[data-testid="draft-star-1"]');
    expect([star?.getAttribute('aria-label'), star?.getAttribute('aria-pressed')]).toEqual([FM(key, draftTime(saved)), String(starred)]);
  });
});

describe('draftDay', () => {
  it('with a draft saved this year, leaves the year out', () => {
    const at = new Date(2026, 10, 14).getTime();

    const day = draftDay(at, new Date(2026, 11, 1).getTime());

    expect(day).not.toMatch(/26/);
  });

  it('with a draft saved in an earlier year, keeps the year', () => {
    const at = new Date(2023, 10, 14).getTime();

    const day = draftDay(at, new Date(2026, 11, 1).getTime());

    expect(day).toMatch(/23/);
  });
});
