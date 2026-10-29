/** A per-key cache of loading promises that forgets a key whose load failed, so the next call loads again. */
export function tierCache<K, T>(): (key: K, load: () => Promise<T>) => Promise<T> {
  const cache = new Map<K, Promise<T>>();
  return (key, load) => {
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const loading = load().catch((e: unknown) => {
      cache.delete(key);
      throw e;
    });
    cache.set(key, loading);
    return loading;
  };
}
