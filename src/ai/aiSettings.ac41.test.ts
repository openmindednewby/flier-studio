import { describe, expect, it } from 'vitest';
import { FormatId, LayoutId } from '@dloizides/poster-render';
import { parseSettings } from './aiSettings';
import { settingsGrammar } from './settingsGrammar';

const VALID = '{"format":"phone","layout":"phone-arch","palette":"rose","fonts":"elegant","background":"tint","pictureAnchor":"top","pictureScale":"1","title":"TANGO","subtitle":"PARTY","date":"","time":""}';

describe('settingsGrammar', () => {
  it('with the poster enums, lists every format and layout id as a quoted alternative', () => {
    const ids = [...Object.values(FormatId), ...Object.values(LayoutId)];

    const grammar = settingsGrammar();

    expect(ids.filter((id) => !grammar.includes(`"\\"${id}\\""`))).toEqual([]);
  });

  it('with the root rule, puts format before time', () => {
    const grammar = settingsGrammar();

    const root = grammar.split('\n').find((line) => line.startsWith('root ::=')) ?? '';

    expect(root.indexOf('format')).toBeLessThan(root.indexOf('time'));
  });
});

describe('parseSettings', () => {
  it('with a reply matching the grammar, returns the settings', () => {
    const reply = VALID;

    const parsed = parseSettings(reply);

    expect(parsed.ok && parsed.settings.layout).toBe('phone-arch');
  });

  it('with an unknown palette, returns an error naming palette', () => {
    const reply = VALID.replace('"rose"', '"purple"');

    const parsed = parseSettings(reply);

    expect(parsed.ok ? [] : parsed.errors).toEqual(['palette']);
  });

  it('with prose before the JSON, returns not ok', () => {
    const reply = `Sure: ${VALID}`;

    const parsed = parseSettings(reply);

    expect(parsed.ok).toBe(false);
  });
});
