import { afterEach, describe, expect, it, vi } from 'vitest';
import { undoToast } from './undoToast';

const WAIT_MS = 100;

describe('undoToast', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('with a new toast, focuses its Undo button', () => {
    undoToast('Deleted', vi.fn());

    expect(document.activeElement?.getAttribute('data-testid')).toBe('drafts-undo');
  });

  it('with the time up and focus still on Undo, runs expired once', () => {
    vi.useFakeTimers();
    const expired = vi.fn();
    undoToast('Deleted', vi.fn(), expired, WAIT_MS);

    vi.advanceTimersByTime(WAIT_MS);

    expect(expired).toHaveBeenCalledTimes(1);
  });

  it('with Undo pressed, runs undo and never expired', () => {
    vi.useFakeTimers();
    const undo = vi.fn();
    const expired = vi.fn();
    undoToast('Deleted', undo, expired, WAIT_MS);

    document.querySelector<HTMLButtonElement>('[data-testid="drafts-undo"]')?.click();
    vi.advanceTimersByTime(WAIT_MS);

    expect([undo.mock.calls.length, expired.mock.calls.length]).toEqual([1, 0]);
  });
});
