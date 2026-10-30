import { describe, expect, it } from 'vitest';
import type { FlierDoc } from '@dloizides/poster-render';
import { kizombaPreset } from '../presets/kizomba';
import { EditScope } from './EditScope';
import { MAX_FREE_LINES, addLine, moveLine, removeLine, setLine } from './freeLines';
import { nextDocs } from './sharedFields';

const docWith = (lines: string[], lineStyles?: FlierDoc['lineStyles']): FlierDoc => {
  const doc = kizombaPreset()[0];
  return { ...doc, lineStyles, blocks: { ...doc.blocks, lines } };
};

describe('addLine', () => {
  it('with no free lines, adds one empty line', () => {
    const doc = kizombaPreset()[0];

    const next = addLine(doc);

    expect(next.blocks.lines).toEqual(['']);
  });

  it('with the maximum number of lines, keeps the doc as it is', () => {
    const doc = docWith(Array.from({ length: MAX_FREE_LINES }, (_, i) => `line ${String(i)}`));

    const next = addLine(doc);

    expect(next.blocks.lines).toHaveLength(MAX_FREE_LINES);
  });
});

describe('setLine', () => {
  it('with index 1, replaces only that line', () => {
    const doc = docWith(['a', 'b']);

    const next = setLine(doc, 1, 'Bring a friend');

    expect(next.blocks.lines).toEqual(['a', 'Bring a friend']);
  });
});

describe('moveLine', () => {
  it('moving line 1 up, swaps the texts and carries its style to lines.0', () => {
    const doc = docWith(['a', 'b'], { 'lines.1': { weight: 300 }, title: { italic: true } });

    const next = moveLine(doc, 1, -1);

    expect(next.blocks.lines).toEqual(['b', 'a']);
    expect(next.lineStyles).toEqual({ title: { italic: true }, 'lines.0': { weight: 300 } });
  });

  it('moving the first line up, keeps the doc as it is', () => {
    const doc = docWith(['a', 'b']);

    const next = moveLine(doc, 0, -1);

    expect(next).toBe(doc);
  });
});

describe('removeLine', () => {
  it('removing line 0, shifts the next line and its style down by one', () => {
    const doc = docWith(['a', 'b'], { 'lines.0': { italic: true }, 'lines.1': { sizeScale: 2 } });

    const next = removeLine(doc, 0);

    expect(next.blocks.lines).toEqual(['b']);
    expect(next.lineStyles).toEqual({ 'lines.0': { sizeScale: 2 } });
  });

  it('removing the last line, drops the lines field and an emptied style map', () => {
    const doc = docWith(['a'], { 'lines.0': { italic: true } });

    const next = removeLine(doc, 0);

    expect('lines' in next.blocks).toBe(false);
    expect('lineStyles' in next).toBe(false);
  });
});

describe('nextDocs free lines', () => {
  it('with scope All and an added styled line, gives every flier the lines and their styles', () => {
    const docs = kizombaPreset();
    const edited = docWith(['Free parking'], { 'lines.0': { sizeScale: 1.5 } });

    const out = nextDocs(EditScope.All, docs, 0, edited);

    expect(out.map((d) => d.blocks.lines)).toEqual(docs.map(() => ['Free parking']));
    expect(out.map((d) => d.lineStyles?.['lines.0'])).toEqual(docs.map(() => ({ sizeScale: 1.5 })));
  });

  it('with scope This, changes only the edited flier', () => {
    const docs = kizombaPreset();
    const edited = docWith(['Free parking']);

    const out = nextDocs(EditScope.This, docs, 0, edited);

    expect(out.slice(1).every((d) => d.blocks.lines === undefined)).toBe(true);
  });
});
