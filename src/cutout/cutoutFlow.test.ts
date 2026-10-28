import { describe, expect, it, vi } from 'vitest';
import { cutPicture, cutoutFile, inFlight, lazy } from './cutoutFlow';

describe('lazy', () => {
  it('before the first call, never builds the value', () => {
    const make = vi.fn(async () => 'remover');

    lazy(make);

    expect(make).not.toHaveBeenCalled();
  });

  it('called twice, builds the value once and returns it both times', async () => {
    const make = vi.fn(async () => ({ id: 7 }));
    const get = lazy(make);

    const [a, b] = [await get(), await get()];

    expect(make).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });
});

describe('cutPicture', () => {
  it('with no picture on the flier, returns undefined and never loads the model', async () => {
    const remover = vi.fn();

    const result = await cutPicture(undefined, { sourceOf: vi.fn(), remover });

    expect(result).toBeUndefined();
    expect(remover).not.toHaveBeenCalled();
  });

  it('with a picture id, cuts the whole stored photo of that id', async () => {
    const photo = new Blob(['photo-bytes'], { type: 'image/png' });
    const removeBackground = vi.fn(async () => ({ elapsedMs: 900 }));
    const sourceOf = vi.fn(async () => photo);

    const result = await cutPicture('couple', { sourceOf, remover: async () => ({ removeBackground, dispose: vi.fn() }) as never });

    expect(sourceOf).toHaveBeenCalledWith('couple');
    expect(removeBackground).toHaveBeenCalledWith(photo);
    expect(result).toEqual({ elapsedMs: 900 });
  });

  it('with a picture id whose photo is missing, returns undefined without cutting', async () => {
    const remover = vi.fn();

    const result = await cutPicture('gone', { sourceOf: async () => undefined, remover });

    expect(result).toBeUndefined();
    expect(remover).not.toHaveBeenCalled();
  });
});

describe('cutoutFile', () => {
  it('with a refined PNG blob, wraps it as cutout.png of type image/png', () => {
    const blob = new Blob(['png'], { type: 'image/png' });

    const file = cutoutFile(blob);

    expect([file.name, file.type, file.size]).toEqual(['cutout.png', 'image/png', 3]);
  });
});

describe('inFlight', () => {
  it('with an upload still running, settles only after the upload finishes', async () => {
    const work = inFlight();
    const order: string[] = [];
    let finish = (): void => undefined;
    void work.track(new Promise<void>((resolve) => { finish = resolve; }).then(() => { order.push('upload'); }));
    const waited = work.settled().then(() => { order.push('cut'); });

    finish();
    await waited;

    expect(order).toEqual(['upload', 'cut']);
  });

  it('with a failed upload, still settles', async () => {
    const work = inFlight();
    work.track(Promise.reject(new Error('disk full'))).catch(() => undefined);

    const settled = work.settled();

    await expect(settled).resolves.toBeUndefined();
  });

  it('with nothing tracked, settles at once', async () => {
    const work = inFlight();

    const settled = work.settled();

    await expect(settled).resolves.toBeUndefined();
  });
});
