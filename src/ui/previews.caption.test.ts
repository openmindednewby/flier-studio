import { describe, expect, it, vi } from 'vitest';
import { previewCaption } from './previews';

const view = (remove = vi.fn(), select = vi.fn()) => ({ selected: 0, select, enlarge: vi.fn(), remove });

describe('previewCaption', () => {
  it('with flier 2 of 3, shows a short Edit that still names the flier for screen readers', () => {
    const caption = previewCaption([1, 3], view(), vi.fn());

    const edit = caption.querySelector('[data-testid="edit-2"]');
    expect(edit?.textContent).toBe('Edit');
    expect(edit?.getAttribute('aria-label')).toBe('Edit flier 2');
  });

  it('with flier 2 of 3, Delete removes flier 2', () => {
    const remove = vi.fn();
    const caption = previewCaption([1, 3], view(remove), vi.fn());

    caption.querySelector<HTMLButtonElement>('[data-testid="delete-2"]')?.click();

    expect(remove).toHaveBeenCalledWith(1);
  });

  it('with only one flier, Delete is disabled', () => {
    const caption = previewCaption([0, 1], view(), vi.fn());

    expect(caption.querySelector<HTMLButtonElement>('[data-testid="delete-1"]')?.disabled).toBe(true);
  });
});
