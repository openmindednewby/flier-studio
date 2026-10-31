import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it, vi } from 'vitest';
import { FM } from '../i18n/fm';
import { kizombaPreset } from '../presets/kizomba';
import { toThemed } from '../theme/flierTheme';
import { blankFlier, builtInTemplates, defaultTemplateName } from './builtInTemplates';
import { templateActions, type TemplatesHost } from './templateActions';
import { TemplateStore } from './templateStore';

const [flier] = kizombaPreset().map((d) => toThemed(d));
const titled = (title: string): typeof flier => ({ ...flier, content: { ...flier.content, blocks: { ...flier.content.blocks, title } } });
const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 20));

function host(added = 5): TemplatesHost & { status: ReturnType<typeof vi.fn>; add: ReturnType<typeof vi.fn> } {
  return { add: vi.fn(() => added), current: () => ({ flier: titled('Summer social'), thumb: 'data:thumb' }), refresh: vi.fn(), status: vi.fn() };
}

describe('builtInTemplates', () => {
  it('with the Kizomba preset, returns 4 one-flier templates with distinct names', () => {
    const templates = builtInTemplates();

    expect([templates.length, new Set(templates.map((t) => t.name)).size]).toEqual([4, 4]);
  });
});

describe('defaultTemplateName', () => {
  it.each([
    ['  My social  ', 'Summer social', 'My social'],
    ['', 'Summer social', 'Summer social'],
    ['', '   ', FM('templates.untitled')],
  ])('with typed %j and title %j, returns %j', (typed, title, expected) => {
    const name = defaultTemplateName(titled(title), typed);

    expect(name).toBe(expected);
  });
});

describe('blankFlier', () => {
  it('with the list layout, returns a flier in that layout with only the placeholder title', () => {
    const blank = blankFlier('list' as Parameters<typeof blankFlier>[0]);

    expect([blank.style.layout, blank.content.blocks, blank.content.items]).toEqual(['list', { title: FM('templates.blankTitle') }, undefined]);
  });
});

describe('TemplateStore', () => {
  it('with a template added, renamed and listed after a new store opens, keeps the new name', async () => {
    const factory = new IDBFactory();
    await new TemplateStore(factory).add({ at: 1, name: 'First', flier, thumb: '' });
    const [saved] = await new TemplateStore(factory).list();

    await new TemplateStore(factory).rename(saved.id, '  Renamed ');

    expect((await new TemplateStore(factory).list()).map((t) => t.name)).toEqual(['Renamed']);
  });

  it('with two templates and one removed, lists only the other', async () => {
    const store = new TemplateStore(new IDBFactory());
    await store.add({ at: 1, name: 'Keep', flier, thumb: '' });
    await store.add({ at: 2, name: 'Gone', flier, thumb: '' });
    const [newest] = await store.list();

    await store.remove(newest.id);

    expect((await store.list()).map((t) => t.name)).toEqual(['Keep']);
  });
});

describe('templateActions', () => {
  it('with Use, adds exactly one flier and names it in the status', () => {
    const app = host(5);

    templateActions(new TemplateStore(new IDBFactory()), app).use('Kizomba 1', flier);

    expect([app.add.mock.calls.length, app.status.mock.calls[0][0]]).toEqual([1, FM('templates.added', 'Kizomba 1', '5')]);
  });

  it('with Save and no typed name, stores the selected flier under its title without adding a flier', async () => {
    const app = host();
    const store = new TemplateStore(new IDBFactory());

    templateActions(store, app, () => 7).save('');
    await settle();

    expect([(await store.list()).map((t) => [t.name, t.at, t.thumb]), app.add.mock.calls.length]).toEqual([[['Summer social', 7, 'data:thumb']], 0]);
  });

  it('with New template in the arch layout, adds one blank flier and stores it as a template', async () => {
    const app = host(3);
    const store = new TemplateStore(new IDBFactory());

    templateActions(store, app).create('arch' as Parameters<typeof blankFlier>[0]);
    await settle();

    expect([app.add.mock.calls.length, (await store.list()).map((t) => t.flier.style.layout)]).toEqual([1, ['arch']]);
  });
});
