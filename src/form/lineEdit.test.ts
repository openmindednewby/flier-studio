import { LineTieKind, type FlierDoc } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { FIELD_LINES, TITLE_PAIR, percent, resetLines, restyle, setTie, stepSize, stepWidth, styleOf, tieOf } from './lineEdit';

const doc = (extra: Partial<FlierDoc> = {}): FlierDoc => ({ blocks: { title: 'KIZOMBA' }, ...extra }) as FlierDoc;

describe('restyle', () => {
  it('with a font on the venue field, styles all three venue lines', () => {
    const base = doc();

    const next = restyle(base, FIELD_LINES.venue, { font: 'Fraunces' });

    expect(Object.keys(next.lineStyles ?? {})).toEqual(['venue.0', 'venue.1', 'venue.2']);
  });

  it('with an undefined value, drops that override and the empty style', () => {
    const base = doc({ lineStyles: { title: { italic: true } } });

    const next = restyle(base, ['title'], { italic: undefined });

    expect(next.lineStyles).toBeUndefined();
  });
});

describe('resetLines', () => {
  it('with two styled fields, resets only the named lines', () => {
    const base = doc({ lineStyles: { title: { italic: true }, footer: { weight: 700 } } });

    const next = resetLines(base, ['title']);

    expect(next.lineStyles).toEqual({ footer: { weight: 700 } });
  });
});

describe('stepSize', () => {
  it('with one step up from the theme size, sets 105%', () => {
    const base = doc();

    const next = stepSize(base, ['title'], 1);

    expect(percent(styleOf(next, 'title').sizeScale ?? 1)).toBe('105%');
  });

  it('with a step back to 100%, drops the override', () => {
    const base = doc({ lineStyles: { title: { sizeScale: 1.05 } } });

    const next = stepSize(base, ['title'], -1);

    expect(next.lineStyles).toBeUndefined();
  });

  it('with many steps down, stops at the smallest step, 5%', () => {
    const base = doc();

    const next = stepSize(base, ['title'], -40);

    expect(styleOf(next, 'title').sizeScale).toBe(0.05);
  });

  it('with many steps up, grows past 300% with no ceiling', () => {
    const base = doc({ lineStyles: { title: { sizeScale: 3 } } });

    const next = stepSize(base, ['title'], 10);

    expect(styleOf(next, 'title').sizeScale).toBe(3.5);
  });
});

describe('stepWidth', () => {
  it('with many steps up, widens past 150% with no ceiling', () => {
    const base = doc({ lineStyles: { venue: { widthScale: 1.5 } } });

    const next = stepWidth(base, ['venue'], 4);

    expect(styleOf(next, 'venue').widthScale).toBe(1.7);
  });

  it('with many steps down, narrows below 50% to the smallest step, 5%', () => {
    const base = doc({ lineStyles: { venue: { widthScale: 0.5 } } });

    const next = stepWidth(base, ['venue'], -20);

    expect(styleOf(next, 'venue').widthScale).toBe(0.05);
  });
});

describe('setTie', () => {
  it('with Same size after Same width, keeps one tie of the size kind', () => {
    const base = setTie(doc(), TITLE_PAIR, LineTieKind.Width);

    const next = setTie(base, TITLE_PAIR, LineTieKind.Size);

    expect(next.lineTies).toEqual([{ kind: LineTieKind.Size, lines: ['title', 'titleBottom'] }]);
  });

  it('with no kind, unties the pair and drops the empty list', () => {
    const base = setTie(doc(), TITLE_PAIR, LineTieKind.Width);

    const next = setTie(base, TITLE_PAIR, undefined);

    expect(tieOf(next, TITLE_PAIR)).toBeUndefined();
    expect(next.lineTies).toBeUndefined();
  });
});
