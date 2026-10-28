import { describe, expect, it } from 'vitest';
import en from './en.json';

describe('layouts labels', () => {
  it('with every layout label, carries no design code such as (E-A)', () => {
    const labels = Object.values(en.layouts);

    const withCodes = labels.filter((label) => /\([A-Z]-[A-Z]\)/.test(label));

    expect(withCodes).toEqual([]);
  });
});
