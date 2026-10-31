/** Resolves with the result of an IndexedDB request, rejects with its error. */
export function done<T>(request: IDBRequest<T>, name: string): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => reject(request.error ?? new Error(name));
  });
}

/** Resolves once the transaction commits. */
export function committed(tx: IDBTransaction, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = (): void => resolve();
    tx.onabort = (): void => reject(tx.error ?? new Error(name));
  });
}

/** Opens a one-store database whose records are keyed by an auto-increment id. */
export function openKeyed(factory: IDBFactory | null, name: string, store: string): Promise<IDBDatabase> {
  if (factory === null) return Promise.reject(new Error(name));
  const request = factory.open(name, 1);
  request.onupgradeneeded = (): void => {
    request.result.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
  };
  return done(request, name);
}
