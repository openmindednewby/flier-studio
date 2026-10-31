import { describe, expect, it, vi } from 'vitest';
import { submitOnEnter } from './dom';

function press(input: HTMLInputElement, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { cancelable: true, ...init });
  input.dispatchEvent(event);
  return event;
}

describe('submitOnEnter', () => {
  it('with Enter, runs the action once and keeps the key from doing anything else', () => {
    const input = document.createElement('input');
    const action = vi.fn();
    submitOnEnter(input, action);

    const event = press(input, { key: 'Enter' });

    expect(action).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('with Shift+Enter, does not run the action', () => {
    const input = document.createElement('input');
    const action = vi.fn();
    submitOnEnter(input, action);

    press(input, { key: 'Enter', shiftKey: true });

    expect(action).not.toHaveBeenCalled();
  });

  it('with Enter while an IME is composing, does not run the action', () => {
    const input = document.createElement('input');
    const action = vi.fn();
    submitOnEnter(input, action);

    press(input, { key: 'Enter', isComposing: true });

    expect(action).not.toHaveBeenCalled();
  });

  it('with another key, does not run the action', () => {
    const input = document.createElement('input');
    const action = vi.fn();
    submitOnEnter(input, action);

    press(input, { key: 'a' });

    expect(action).not.toHaveBeenCalled();
  });
});
