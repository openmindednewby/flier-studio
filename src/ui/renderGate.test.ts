import { describe, expect, it } from 'vitest';
import { renderGate } from './renderGate';

describe('renderGate', () => {
  it('with a second ticket handed out, the first ticket is no longer current and the second is', () => {
    const next = renderGate();
    const first = next();

    const second = next();

    expect([first(), second()]).toEqual([false, true]);
  });
});
