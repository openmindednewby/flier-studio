import { describe, expect, it } from 'vitest';
import { FormatId, LayoutId } from '@dloizides/poster-render';
import { configGrammar, parseConfig } from '@dloizides/prompt-to-config';
import { AI_SCHEMA } from './aiSettings';

const VALID = '{"format":"phone","layout":"phone-arch","palette":"rose","fonts":"elegant","background":"tint","pictureAnchor":"top","pictureScale":"1","title":"TANGO","subtitle":"PARTY","date":"","time":""}';

describe('configGrammar', () => {
  it('with the poster enums, lists every format and layout id as a quoted alternative', () => {
    const ids = [...Object.values(FormatId), ...Object.values(LayoutId)];

    const grammar = configGrammar(AI_SCHEMA);

    expect(ids.filter((id) => !grammar.includes(`"\\"${id}\\""`))).toEqual([]);
  });

  it('with the root rule, puts format before time', () => {
    const grammar = configGrammar(AI_SCHEMA);

    const root = grammar.split('\n').find((line) => line.startsWith('root ::=')) ?? '';

    expect(root.indexOf('format')).toBeLessThan(root.indexOf('time'));
  });
});

describe('parseConfig', () => {
  it('with a reply matching the grammar, returns the settings', () => {
    const reply = VALID;

    const parsed = parseConfig(AI_SCHEMA, reply);

    expect(parsed.ok && parsed.config.layout).toBe('phone-arch');
  });

  it('with an unknown palette, returns an error naming palette', () => {
    const reply = VALID.replace('"rose"', '"purple"');

    const parsed = parseConfig(AI_SCHEMA, reply);

    expect(parsed.ok ? [] : parsed.errors).toEqual(['palette']);
  });

  it('with prose before the JSON, returns not ok', () => {
    const reply = `Sure: ${VALID}`;

    const parsed = parseConfig(AI_SCHEMA, reply);

    expect(parsed.ok).toBe(false);
  });
});
