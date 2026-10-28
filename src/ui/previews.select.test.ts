import { describe, expect, it } from 'vitest';
import { markSelected } from './previews';

const grid = (count: number): HTMLElement => {
  const container = document.createElement('div');
  for (let i = 0; i < count; i++) {
    const figure = document.createElement('figure');
    const trim = document.createElement('div');
    trim.className = 'trim';
    figure.append(trim);
    container.append(figure);
  }
  return container;
};

describe('markSelected', () => {
  it('with flier 2 of 3 selected, presses only its toggle and marks only its figure', () => {
    const container = grid(3);

    markSelected(container, 1);

    expect([...container.querySelectorAll('.trim')].map((t) => t.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    expect([...container.querySelectorAll('figure')].map((f) => f.classList.contains('selected'))).toEqual([false, true, false]);
  });
});
