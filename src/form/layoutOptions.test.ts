import { FormatId, LAYOUT_CATALOGUE, LayoutId, kizombaWorkshop } from '@dloizides/poster-render';
import { describe, expect, it } from 'vitest';
import { FM } from '../i18n/fm';
import { layoutsFor, withFormat } from './layoutOptions';

describe('layoutsFor', () => {
  it('with a story format, offers the five poster layouts', () => {
    const ids = layoutsFor(FormatId.Story).map((e) => e.id);

    expect(ids).toEqual([LayoutId.PictureRight, LayoutId.PictureLeft, LayoutId.Arch, LayoutId.PictureBottom, LayoutId.List]);
  });

  it('with the desktop format, offers only the two desktop wallpaper layouts', () => {
    const ids = layoutsFor(FormatId.Desktop).map((e) => e.id);

    expect(ids).toEqual([LayoutId.DesktopSafe, LayoutId.DesktopArch]);
  });

  it('across every format, makes every catalogue layout selectable', () => {
    const formats = [FormatId.Story, FormatId.Post, FormatId.Square, FormatId.Phone, FormatId.Desktop];

    const offered = new Set(formats.flatMap((f) => layoutsFor(f).map((e) => e.id)));

    expect(offered.size).toBe(LAYOUT_CATALOGUE.length);
  });

  it('for every catalogue layout, has a translated picker label', () => {
    const missing = LAYOUT_CATALOGUE.filter((e) => FM(`layouts.${e.id}`) === `layouts.${e.id}`).map((e) => e.id);

    expect(missing).toEqual([]);
  });
});

describe('withFormat', () => {
  it('with a poster layout switched to desktop, falls back to the desktop default', () => {
    const doc = { ...kizombaWorkshop, format: FormatId.Story, layout: LayoutId.Arch };

    const next = withFormat(doc, FormatId.Desktop);

    expect(next).toMatchObject({ format: FormatId.Desktop, layout: LayoutId.DesktopSafe });
  });

  it('with a phone layout switched to phone again, keeps the chosen layout', () => {
    const doc = { ...kizombaWorkshop, format: FormatId.Phone, layout: LayoutId.PhoneArch };

    const next = withFormat(doc, FormatId.Phone);

    expect(next.layout).toBe(LayoutId.PhoneArch);
  });

  it('with an arch poster switched to square, keeps the arch', () => {
    const doc = { ...kizombaWorkshop, format: FormatId.Story, layout: LayoutId.Arch };

    const next = withFormat(doc, FormatId.Square);

    expect(next.layout).toBe(LayoutId.Arch);
  });
});
